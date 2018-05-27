const sqlModels = require('../models')
const pluck = require('object-pluck')
const helper = require('../helper')

module.exports = {
  createOrder: (req, res) => {
    // validate
    const params = pluck(['products', 'price', 'price_dollars', 'price_cents'], req.body).end()

    if (Object.keys(params).length !== 4) return res.status(200).json({ success: false, message: helper.strings.invalidParameters })

    sqlModels.Order.create(params)
      .then(order => res.status(200).json({ success: true, message: helper.strings.OrderCreatedSuccesfully, order }))
      .catch(err => {
        helper.methods.handleErrors(err, res)
      })
  },
  updateOrder: (req, res) => {
    // validate params, id is required but all else are optional
    const params = pluck(['id', 'products', 'completed', 'paid', 'shipped', 'price', 'price_dollars', 'price_cents', 'discount', 'discount_dollars', 'discount_cents', 'meta'], req.body).end()
    if (!params.id) return res.status(200).json({ success: false, message: helper.strings.invalidParameters })

    // find the Order by the id
    sqlModels.Order.findOne({ where: { name: params.id } })
      .then(Order => {
        // check if a Order was returned
        if (!Order) throw new helper.CustomError(helper.strings.noOrderExistsWithThatId)
        // update the Order properties
        Object.keys(params).forEach(updatedProperty => {
          Order[updatedProperty] = params[updatedProperty]
        })
        return Order.save()
      })
      .then(updatedOrder => res.status(200).json({ success: true, message: helper.strings.OrderUpdatedSuccesfully, order: updatedOrder }))
      .catch(err => {
        helper.methods.handleErrors(err, res)
      })
  },
  getOrders: (req, res) => {
    // validate params. if we have a Order id passed in then we will retrieve one Order, otherwise we'll retrieve all
    const params = pluck(['id'], req.params).end()
    
    // an id was passed in
    if (params.id) {
      sqlModels.Order.findOne({ where: { id: params.id } })
      .then(order => res.status(200).json({ success: true, order }))
      .catch(err => {
        helper.methods.handleErrors(err, res)
      })

    // no id was passed in, get all Orders
    } else {
      sqlModels.Order.findAll()
      .then(orders => res.status(200).json({ success: true, orders }))
      .catch(err => {
        helper.methods.handleErrors(err, res)
      })
    }
  },
  deleteOrder: (req, res) => {
    // validate params, must have an id passed in
    const params = pluck(['id'], req.params).end()
    if (!params.id) return res.status(200).json({ success: false, message: helper.strings.invalidParameters })

    sqlModels.Order.findOne({ where: { id: params.id } })
      .then(order => order.destroy())
      .then(() => {
        return res.status(200).json({ success: true, message: helper.strings.OrderSuccessfullyDeleted })
      })
      .catch(err => {
        helper.methods.handleErrors(err, res)
      })
  }
}