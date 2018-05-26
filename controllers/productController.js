const sqlModels = require('../models')
const pluck = require('object-pluck')
const helper = require('../helper')

module.exports = {
  createProduct: (req, res) => {
    // validate
    const params = pluck(['image', 'description', 'name', 'price', 'price_dollars', 'color', 'price_cents'], req.body).end()

    if (Object.keys(params).length !== 7) return res.status(200).json({ success: false, message: helper.strings.invalidParameters })

    sqlModels.Product.findOrCreate({ where: { name: params.name, color: params.color }, defaults: params })
      .then(result => {
        const didCreateNewProduct = result[1]
        const product = result[0].toJSON()

        if (!didCreateNewProduct) return res.status(200).json({ success: false, message: helper.strings.productAlreadyExists, product })
        else return res.status(200).json({ success: true, message: helper.strings.productCreatedSuccesfully, product })
      })
      .catch(err => {
        helper.methods.handleErrors(err, res)
      })
  },
  updateProduct: (req, res) => {
    // validate params, color and name are required but all else are optional
    const params = pluck(['image', 'description', 'price', 'price_dollars', 'name', 'color', 'price_cents', 'discount', 'discount_dollars', 'discount_cents', 'meta'], req.body).end()
    if (!params.name || !params.color) return res.status(200).json({ success: false, message: helper.strings.invalidParameters })

    // find the product by the name and color
    sqlModels.Product.findOne({ where: { name: params.name, color: params.color } })
      .then(product => {
        // check if a product was returned
        if (!product) throw new helper.CustomError(helper.strings.noProductExistsWithNameAndColor)
        // update the product properties
        Object.keys(params).forEach(updatedProperty => {
          product[updatedProperty] = params[updatedProperty]
        })
        return product.save()
      })
      .then(updatedProduct => res.status(200).json({ success: true, message: helper.strings.productUpdatedSuccesfully, product: updatedProduct }))
      .catch(err => {
        helper.methods.handleErrors(err, res)
      })
  },
  getProducts: (req, res) => {
    // validate params. if we have a product id passed in then we will retrieve one product, otherwise we'll retrieve all
    const params = pluck(['id'], req.params).end()
    
    // an id was passed in
    if (params.id) {
      sqlModels.Product.findOne({ where: { id: params.id } })
      .then(product => res.status(200).json({ success: true, product }))
      .catch(err => {
        helper.methods.handleErrors(err, res)
      })

    // no id was passed in, get all products
    } else {
      sqlModels.Product.findAll()
      .then(products => res.status(200).json({ success: true, products }))
      .catch(err => {
        helper.methods.handleErrors(err, res)
      })
    }
  },
  deleteProduct: (req, res) => {
    // validate params, must have an id passed in
    const params = pluck(['id'], req.params).end()
    if (!params.id) return res.status(200).json({ success: false, message: helper.strings.invalidParameters })

    sqlModels.Product.findOne({ where: { id: params.id } })
      .then(product => product.destroy())
      .then(() => {
        return res.status(200).json({ success: true, message: helper.strings.productSuccessfullyDeleted })
      })
      .catch(err => {
        helper.methods.handleErrors(err, res)
      })
  }
}