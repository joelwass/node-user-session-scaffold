const express = require('express')
const router = express.Router()
const controllers = require('../controllers')

// health
router.get('/health', (req, res) => res.status(200).json({ alive: true }))

// auth
router.post('/user/login', controllers.authController.loginUser)
router.post('/user/logout', controllers.authController.logoutUser)
router.post('/user/resume', controllers.authController.authenticateSessionId, controllers.authController.resume)

// user routes
router.route('/user/:email?')
  .post(controllers.userController.createUser)
  .get(controllers.authController.authenticateSessionId, controllers.userController.getUser)
  .put(controllers.authController.authenticateSessionId, controllers.userController.updateUser)
  .delete(controllers.authController.authenticateSessionId, controllers.userController.deleteUser)

router.get('/users', controllers.authController.authenticateSessionId, controllers.userController.getUsers)

module.exports = router
