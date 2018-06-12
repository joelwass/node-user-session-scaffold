const express = require('express')
const router = express.Router()
const controllers = require('../controllers')

// health
router.get('/health', (req, res) => res.status(200).json({ alive: true }))

// create new session
router.post('/auth', controllers.customerAuthController.createAuth);

// subscribe for emails
router.post('/signUpForEmails', controllers.newsletterController.signUpUser)

// customer routes
router.route('/customer/:email?')
  .post(controllers.customerController.createCustomer)
  .get(controllers.customerAuthController.authenticateSessionId, controllers.customerController.getCustomers)
  .put(controllers.customerAuthController.authenticateSessionId, controllers.customerController.updateCustomer)
  .delete(controllers.customerAuthController.authenticateSessionId, controllers.customerController.deleteCustomer)

// user auth
router.post('/user/login', controllers.adminUserAuthController.loginUser)
router.post('/user/logout', controllers.adminUserAuthController.logoutUser)
router.post('/user/resume', controllers.adminUserAuthController.authenticateSessionId, controllers.adminUserAuthController.resume)

// customer auth
router.post('/customer/login', controllers.customerAuthController.loginUser)
router.post('/customer/logout', controllers.customerAuthController.logoutUser)
router.post('/customer/resume', controllers.customerAuthController.authenticateSessionId, controllers.customerAuthController.resume)

// product routes
router.route('/product/:id?')
  .post(controllers.adminUserAuthController.authenticateSessionId, controllers.productController.createProduct)
  .put(controllers.adminUserAuthController.authenticateSessionId, controllers.productController.updateProduct)
  .get(controllers.customerAuthController.authenticateSessionId,controllers.productController.getProducts)
  .delete(controllers.adminUserAuthController.authenticateSessionId,controllers.productController.deleteProduct)

// order routes
router.route('/order/:id?')
  .post(controllers.customerAuthController.authenticateSessionId, controllers.orderController.createOrder)
  .put(controllers.customerAuthController.authenticateSessionId, controllers.orderController.updateOrder)
  .get(controllers.customerAuthController.authenticateSessionId, controllers.orderController.getOrders)
  .delete(controllers.customerAuthController.authenticateSessionId, controllers.orderController.deleteOrder)

router.post('/order/resume', controllers.customerAuthController.authenticateSessionId, controllers.customerAuthController.resume)

// user routes
router.route('/user/:email?')
  .post(controllers.userController.createUser)
  .get(controllers.adminUserAuthController.authenticateSessionId, controllers.userController.getUsers)
  .put(controllers.adminUserAuthController.authenticateSessionId, controllers.userController.updateUser)
  .delete(controllers.adminUserAuthController.authenticateSessionId, controllers.userController.deleteUser)

router.get('/users', controllers.adminUserAuthController.authenticateSessionId, controllers.userController.getUsers)

module.exports = router
