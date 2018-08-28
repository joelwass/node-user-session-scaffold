const express = require('express')
const router = express.Router()
const controllers = require('../controllers')
const config = require('../config');

// health
router.get('/health', (req, res) => res.status(200).json({ alive: true }))

// user auth
router.post('/user/login', controllers.userAuthController.loginUser)
router.post('/user/logout', controllers.userAuthController.logoutUser)
router.post('/user/resume', controllers.userAuthController.authenticateSessionId, controllers.userAuthController.resume)

// create new session
router.post('/auth', controllers.customerAuthController.createAuth);
// resume and save
router.post('/save', controllers.customerAuthController.authenticateSessionId, (req, res) => res.status(200).json({ success: true }))
router.get('/resume', controllers.customerAuthController.authenticateSessionId, controllers.customerAuthController.resume)

// user routes
router.route('/user/:email?')
  .post(controllers.userController.createUser)
  .get(controllers.adminUserAuthController.authenticateSessionId, controllers.userController.getUsers)
  .put(controllers.adminUserAuthController.authenticateSessionId, controllers.userController.updateUser)
  .delete(controllers.adminUserAuthController.authenticateSessionId, controllers.userController.deleteUser)

module.exports = router
