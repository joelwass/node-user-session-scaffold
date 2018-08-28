const ulid = require('ulid').ulid
const helper = require('../helper')
const sqlModels = require('../models')
const pluck = require('object-pluck')

const redis = {}
const twoHoursInMilliseconds = 7200000

/* a user session will have the following properties

  SESSION:
  [sessionId]: {
    expiresAt: unixTimeStamp + 2 hours,
    user: the users info
  }

*/

module.exports = {
  authenticateSessionId: (req, res, next) => {
    // make sure we have a sessionId in the header
    const sessionId = req.get('Auth')

    // look it up in redis
    const currentSession = redis[sessionId]
    if (!currentSession) return res.status(401).json({ success: false, message: helper.strings.unauthorizedRequest })

    // check if the session has expired
    if (currentSession.expiresAt <= Date.now()) {
      // nuke that session and return 401
      delete redis[sessionId]
      return res.status(401).json({ success: false, message: helper.strings.expiredSessionId })
    }

    // set the various state stuff if it was passed down
    if (req.body) {
      const params = pluck(['user'], req.body).end()
      if (params.user) redis[sessionId].user = params.user
    }
    
    redis[sessionId].expiresAt = Date.now() + twoHoursInMilliseconds

    req.authToken = sessionId

    return next()
  },
  createAuth: (req, res) => {
    // create a new ulid (session id) as well as a new order to associate it to
    sqlModels.Order.create()
      .then(newOrder => {
        // we have the new order created
        const sessionId = ulid()
        // declare user session
        redis[sessionId] = {
          expiresAt: Date.now() + twoHoursInMilliseconds,
          user: undefined,
        }

        // return order id
        return res.status(200).json({ success: true, sessionId })
      })
      .catch(err => {
        helper.methods.handleErrors(err, res)
      })
  },
  loginUser: (req, res) => {
    // validate params, email and password is required
    const params = pluck(['email', 'password'], req.body).end()
    if (Object.keys(params).length !== 2) return res.status(200).json({ success: false, message: helper.strings.invalidParameters })

    const oldSession = redis[req.get('Auth')]

    sqlModels.User.findOne({ where: { email: params.email }})
      .then(user => {
        if (!user) return res.status(200).json({ success: false, message: helper.strings.noUserExistingByThatEmail })
        
        else {
          return sqlModels.User.authenticate(params).then(authenticatedUser => {
            // we know the user authenticated correctly if they make it into this block
            const sessionId = ulid()
            // declare users session
            redis[sessionId] = {
              expiresAt: Date.now() + twoHoursInMilliseconds,
              user: oldSession.user,
            }

            const jsonUser = authenticatedUser.toJSON()
            delete jsonUser.password
            delete jsonUser.createdAt
            delete jsonUser.updatedAt

            // return session id
            return res.status(200).json({ success: true, sessionId, user: jsonUser })
          })
          .catch(err => {
            helper.methods.handleErrors(err, res)
          })
        }
      })
      .catch(err => {
        helper.methods.handleErrors(err, res)
      })
  },
  logoutUser: (req, res) => {
    // nuke the session and return 200
    delete redis[req.authToken]
    return res.status(200).json({ success: true })
  },
  resume: (req, res) => {
    const oldSession = redis[req.authToken]
    if (!oldSession.user) {
      return res.status(200).json({ success: true })
    }
    sqlModels.User.findById(oldSession.user.id)
      .then(authenticatedUser => {
        if (authenticatedUser) {
          // generate a fresh session id for them
          const sessionId = ulid()
          // save user session
          redis[sessionId] = {
            expiresAt: Date.now() + twoHoursInMilliseconds,
            user: oldSession.user
          }
          // delete the old session
          delete redis[req.authToken]
        }

        const jsonUser = authenticatedUser ? authenticatedUser.toJSON() : {}
        delete jsonUser.password
        delete jsonUser.createdAt
        delete jsonUser.updatedAt

        // return session id
        return res.status(200).json({ success: true, user: jsonUser })
      })
      .catch(err => {
        helper.methods.handleErrors(err, res)
      })
  }
}
