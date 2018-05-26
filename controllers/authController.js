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
    userId: user id of the user logged in
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

    // set the current user id
    req.currentUserId = currentSession.userId
    req.authToken = sessionId
    return next()
  },
  loginUser: (req, res) => {
    // validate params, email and password is required
    const params = pluck(['email', 'password'], req.body).end()
    if (Object.keys(params).length !== 2) return res.status(200).json({ success: false, message: helper.strings.invalidParameters })

    // try logging in
    sqlModels.User.authenticate(params)
      .then(authenticatedUser => {
        // we know the user authenticated correctly if they make it into this block
        const sessionId = ulid()
        // declare users session
        redis[sessionId] = {
          userId: authenticatedUser.id,
          expiresAt: Date.now() + twoHoursInMilliseconds
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
  },
  logoutUser: (req, res) => {
    // nuke the session and return 200
    delete redis[req.authToken]
    return res.status(200).json({ success: true })
  },
  resume: (req, res) => {
    const userId = redis[req.authToken].userId
    sqlModels.User.findById(userId)
      .then(authenticatedUser => {
        // generate a fresh session id for them
        const sessionId = ulid()
        // save user session
        redis[sessionId] = {
          userId: authenticatedUser.id,
          expiresAt: Date.now() + twoHoursInMilliseconds
        }
        // delete the old session
        delete redis[req.authToken]

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
}
