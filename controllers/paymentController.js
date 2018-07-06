const sqlModels = require('../models')
const helper = require('../helper')

/**
 * inventory.js
 * Stripe Payments Demo. Created by Romain Huet (@romainhuet).
 *
 * Simple library to store and interact with orders and products.
 * These methods are using the Stripe Orders API, but we tried to abstract them
 * from the main code if you'd like to use your own order management system instead.
 */

'use strict'

const config = require('../config')
const stripe = require('stripe')(config.stripe.secretKey)
stripe.setApiVersion(config.stripe.apiVersion)

const pay = async (req, res, next) => {
  let { source } = req.body
  console.log(source)
  try {
    // Retrieve the order associated to the ID.
    let order = await retrieveProduct(req.params.id)
    console.log('')
    console.log('order')
    console.log(order)
    // Verify that this order actually needs to be paid.
    if (
      order.metadata.status === 'pending' ||
      order.metadata.status === 'paid'
    ) {
      return res.status(403).json({order, source})
    }
    // Dynamically evaluate if 3D Secure should be used.
    if (source && source.type === 'card') {
      // A 3D Secure source may be created referencing the card source.
      source = await dynamic3DS(source, order, req)
    }
    // Demo: In test mode, replace the source with a test token so charges can work.
    if (source.type === 'card' && !source.livemode) {
      source.id = 'tok_visa'
    }
    // Pay the order using the Stripe source.
    if (source && source.status === 'chargeable') {
      let charge, status
      try {
        charge = await stripe.charges.create(
          {
            source: source.id,
            amount: order.amount,
            currency: order.currency,
            receipt_email: order.email,
          },
          {
            // Set a unique idempotency key based on the order ID.
            // This is to avoid any race conditions with your webhook handler.
            idempotency_key: order.id,
          }
        )
      } catch (err) {
        // This is where you handle declines and errors.
        // For the demo we simply set to failed.
        status = 'failed'
      }
      if (charge && charge.status === 'succeeded') {
        status = 'paid'
      } else if (charge) {
        status = charge.status
      } else {
        status = 'failed'
      }
      // Update the order with the charge status.
      order = await orders.update(order.id, {metadata: {status}})
    }
    return res.status(200).json({order, source})
  } catch (err) {
    console.log(err)
    return res.status(500).json({error: err.message})
  }
}

// Create an order.
const createOrder = async (req, res, next) => {
  let { items, email, shipping } = req.body;
  try {
    const order = await stripe.orders.create({
      currency: 'USD',
      items,
      email,
      shipping,
      metadata: {
        status: 'created',
      },
    })
    // console.log(order)
    return res.status(200).json({ success: true, order});
  } catch (err) {
    console.log('err', err)
    return res.status(500).json({ success: false, message: err.message});
  }
}

// Retrieve an order by ID.
const retrieveOrder = async orderId => {
  return await stripe.orders.retrieve(orderId)
}

// Update an order.
const updateOrder = async (orderId, properties) => {
  return await stripe.orders.update(orderId, properties)
}

// List all products.
const listProducts = async () => {
  return await stripe.products.list({limit: 3, type: 'good'});
};

// Retrieve a product by ID.
const retrieveProduct = async productId => {
  return await stripe.products.retrieve(productId);
};

// Validate that products exist.
const productsExist = productList => {
  const validProducts = ['increment', 'shirt', 'pins'];
  return productList.data.reduce((accumulator, currentValue) => {
    return (
      accumulator &&
      productList.data.length === 3 &&
      validProducts.includes(currentValue.id)
    );
  }, !!productList.data.length);
};

module.exports = {
  createOrder,
  retrieveOrder,
  update: updateOrder,
  pay,
  listProducts,
  retrieveProduct,
  productsExist
}