const sqlModels = require('../models')
const pluck = require('object-pluck')
const helper = require('../helper')

module.exports = {
  createCustomer: (req, res) => {
    // validate params, all required fields
    const params = pluck(['email'], req.body).end()
    if (Object.keys(params).length !== 1) return res.status(200).json({ success: false, message: helper.strings.invalidParameters })

    return sqlModels.Customer.findOrCreate({ where: { email: params.email }, defaults: params })
      .then(result => {
        const didCreateNewCustomer = result[1]
        const customer = result[0].toJSON()

        // if the Customer wasn't created new, this will return the old, found Customer with matching email address
        if (!didCreateNewCustomer) return res.status(200).json({ success: false, message: helper.strings.customerAlreadyExists, customer })
        else return res.status(200).json({ success: true, message: helper.strings.customerCreatedSuccesfully, customer })
      })
      .catch(err => {
        helper.methods.handleErrors(err, res)
      })
  },
  updateCustomer: (req, res) => {
    // validate params, email is required but all else are optional
    const params = pluck(['email', 'password', 'firstName', 'lastName', 'birthday', 'address', 'address2', 'city', 'state', 'zip', 'meta'], req.body).end()
    if (!params.email) return res.status(200).json({ success: false, message: helper.strings.invalidParameters })

    // convert birthday
    if (params.birthday) params.birthday = new Date(parseInt(params.birthday)).toISOString()

    // find the Customer by the email
    sqlModels.Customer.findOne({ where: { email: params.email } })
      .then(customer => {
        // check if a Customer was returned
        if (!customer) throw new helper.CustomError(helper.strings.noCustomerExistingByThatEmail)
        // update the Customer properties
        Object.keys(params).forEach(updatedProperty => {
          customer[updatedProperty] = params[updatedProperty]
        })
        return customer.save()
      })
      .then(updatedCustomer => res.status(200).json({ success: true, message: helper.strings.customerUpdatedSuccesfully, customer: updatedCustomer }))
      .catch(err => {
        helper.methods.handleErrors(err, res)
      })
  },
  getCustomers: (req, res) => {
    // validate params. if we have a customer id passed in then we will retrieve one customer, otherwise we'll retrieve all
    const params = pluck(['id'], req.params).end()
    
    // an id was passed in
    if (params.id) {
      sqlModels.Customer.findOne({ where: { id: params.id } })
      .then(customer => res.status(200).json({ success: true, customer }))
      .catch(err => {
        helper.methods.handleErrors(err, res)
      })

    // no id was passed in, get all customers
    } else {
      sqlModels.Customer.findAll()
      .then(customers => res.status(200).json({ success: true, customers }))
      .catch(err => {
        helper.methods.handleErrors(err, res)
      })
    }
  },
  deleteCustomer: (req, res) => {
    // validate params, must have an email passed in
    const params = pluck(['email'], req.params).end()
    if (!params.email) return res.status(200).json({ success: false, message: helper.strings.invalidParameters })

    sqlModels.Customer.findOne({ where: { email: params.email } })
      .then(customer => customer.destroy())
      .then(() => {
        return res.status(200).json({ success: true, message: helper.strings.customerSuccessfullyDeleted })
      })
      .catch(err => {
        helper.methods.handleErrors(err, res)
      })
  }
}
