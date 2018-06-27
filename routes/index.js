const express = require('express')
const router = express.Router()
const controllers = require('../controllers')
const config = require('../config');

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
router.post('/customer/ux/login', controllers.customerAuthController.loginUser)
router.post('/customer/ux/logout', controllers.customerAuthController.logoutUser)
router.post('/customer/ux/resume', controllers.customerAuthController.authenticateSessionId, controllers.customerAuthController.resume)

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

router.get('/config', (req, res) => {
  res.json({
    stripePublishableKey: config.stripe.publishableKey,
    stripeCountry: config.stripe.country,
    country: config.country,
    currency: config.currency,
  })
})

// STRIPE endpoints

router.post('/stripe/orders', controllers.paymentController.createOrder)

router.get('/stripe/orders/:id', async (req, res) => {
  try {
    return res.status(200).json(await controllers.paymentController.retrieveOrder(req.params.id))
  } catch (err) {
    return res.sendStatus(404)
  }
})

// Retrieve all products.
router.get('/stripe/products', async (req, res) => {
  const productList = await controllers.paymentController.listProducts()
  // Check if products exist on Stripe Account.
  if (controllers.paymentController.productsExist(productList)) {
    res.json(productList)
  } else {
    // We need to set up the products.
    await setup.run()
    res.json(await controllers.paymentController.listProducts())
  }
});

// Retrieve a product by ID.
router.get('/stripe/products/:id', async (req, res) => {
  res.json(await controllers.paymentController.retrieveProduct(req.params.id));
});

// Complete payment for an order using a source.
router.post('/stripe/orders/:id/pay', controllers.paymentController.pay)

module.exports = router
