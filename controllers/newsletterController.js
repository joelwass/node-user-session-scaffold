const sqlModels = require('../models')
const pluck = require('object-pluck')
const helper = require('../helper')

module.exports = {
  signUpUser: (req, res) => {
    // validate params
    const params = pluck(['email'], req.body).end()
    if (params.length !== 1) return res.status(200).json({ success: false, message: helper.strings.invalidParameters })

    return sqlModels.NewsletterCustomer.findOrCreate({ where: { email: params.email }, defaults: params })
      .then(() => res.status(200).json({ success: true }))
      .catch(err => {
        helper.methods.handleErrors(err, res)
      })
  }
}