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
    orderId: user id of the user logged in
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

    // set the current order id
    req.currentOrderId = currentSession.orderId
    req.authToken = sessionId
    return next()
  },
  createAuth: (req, res) => {
    // create a new ulid (session id) as well as a new order to associate it to
    sqlModels.Order.create()
      .then(newOrder => {
        // we have the new order created
        const sessionId = ulid()
        // declare customer session
        redis[sessionId] = {
          orderId: newOrder.id,
          expiresAt: Date.now() + twoHoursInMilliseconds
        }

        // return order id
        return res.status(200).json({ success: true, orderId: newOrder.id, sessionId })
      })
      .catch(err => {
        helper.methods.handleErrors(err, res)
      })
  },
  resume: (req, res) => {
    const orderId = redis[req.authToken].userId
    sqlModels.Order.findById(orderId)
      .then(foundOrder => {
        // generate a fresh session id for them
        const sessionId = ulid()
        // save user session
        redis[sessionId] = {
          orderId: foundOrder.id,
          expiresAt: Date.now() + twoHoursInMilliseconds
        }
        // delete the old session
        delete redis[req.authToken]

        // return session id
        return res.status(200).json({ success: true, orderId: newOrder.id })
      })
      .catch(err => {
        helper.methods.handleErrors(err, res)
      })
  }
}
