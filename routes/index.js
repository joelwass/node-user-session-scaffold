const express = require('express')
const router = express.Router()
const controllers = require('../controllers')

// health
router.get('/health', (req, res) => res.status(200).json({ alive: true }))

// get basic auth
router.get('/auth', controllers.auth.basic);

// get jwt auth
router.post('/auth', controllers.auth.jwt);

// user auth
router.post('/user/login', controllers.authController.loginUser)
router.post('/user/logout', controllers.authController.logoutUser)
router.post('/user/resume', controllers.authController.authenticateSessionId, controllers.authController.resume)

// product routes
router.route('/product/:id?')
  .post(controllers.productController.createProduct)
  .put(controllers.productController.updateProduct)
  .get(controllers.productController.getProducts)
  .delete(controllers.productController.deleteProduct)

// order routes
router.route('/order/:id?')
  .post(controllers.orderController.createOrder)
  .put(controllers.orderController.updateOrder)
  .get(controllers.orderController.getOrders)
  .delete(controllers.orderController.deleteOrder)

// user routes
router.route('/user/:email?')
  .post(controllers.userController.createUser)
  .get(controllers.authController.authenticateSessionId, controllers.userController.getUser)
  .put(controllers.authController.authenticateSessionId, controllers.userController.updateUser)
  .delete(controllers.authController.authenticateSessionId, controllers.userController.deleteUser)

router.get('/users', controllers.authController.authenticateSessionId, controllers.userController.getUsers)

module.exports = router
