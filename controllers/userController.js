const sqlModels = require('../models')
const pluck = require('object-pluck')
const helper = require('../helper')
const config = require('../config')

module.exports = {
  createUser: (req, res) => {
    // validate params, all required fields
    const params = pluck(['email', 'firstName', 'lastName', 'password'], req.body).end()
    if (Object.keys(params).length !== 4) return res.status(200).json({ success: false, message: helper.strings.invalidParameters })

    return sqlModels.User.findOrCreate({ where: { email: params.email }, defaults: params })
    .then(result => {
      const didCreateNewUser = result[1]
      const user = result[0].toJSON()

      delete User.password

      // if the User wasn't created new, this will return the old, found User with matching email address
      if (!didCreateNewUser) return res.status(200).json({ success: false, message: helper.strings.userAlreadyExists, user, sessionId: req.authToken })
      else return res.status(200).json({ success: true, message: helper.strings.userCreatedSuccesfully, user, sessionId: req.authToken })
    })
    .catch(err => {
      helper.methods.handleErrors(err, res)
    })
  },
  updateUser: (req, res) => {
    // validate params, email is required but all else are optional
    const params = pluck(['email', 'password', 'firstName', 'lastName', 'birthday', 'address', 'address2', 'city', 'state', 'zip', 'meta'], req.body).end()
    if (!params.email) return res.status(200).json({ success: false, message: helper.strings.invalidParameters })

    // convert birthday
    if (params.birthday) params.birthday = new Date(parseInt(params.birthday)).toISOString()

    // find the User by the email
    sqlModels.User.findOne({ where: { email: params.email } })
      .then(user => {
        // check if a User was returned
        if (!user) throw new helper.CustomError(helper.strings.noUserExistingByThatEmail)
        // update the User properties
        Object.keys(params).forEach(updatedProperty => {
          user[updatedProperty] = params[updatedProperty]
        })
        return user.save()
      })
      .then(updatedUser => {
        return res.status(200).json({ success: true, message: helper.strings.userUpdatedSuccesfully, user: updatedUser, sessionId: req.authToken })
      })
      .catch(err => {
        helper.methods.handleErrors(err, res)
      })
  },
  getUsers: (req, res) => {
    // validate params. if we have a user id passed in then we will retrieve one user, otherwise we'll retrieve all
    const params = pluck(['id'], req.params).end()
    
    // an id was passed in
    if (params.id) {
      sqlModels.User.findOne({ where: { id: params.id } })
      .then(user => res.status(200).json({ success: true, user }))
      .catch(err => {
        helper.methods.handleErrors(err, res)
      })

    // no id was passed in, get all users
    } else {
      sqlModels.User.findAll()
      .then(users => res.status(200).json({ success: true, users }))
      .catch(err => {
        helper.methods.handleErrors(err, res)
      })
    }
  },
  deleteUser: (req, res) => {
    // validate params, must have an email passed in
    const params = pluck(['email'], req.params).end()
    if (!params.email) return res.status(200).json({ success: false, message: helper.strings.invalidParameters })

    sqlModels.User.findOne({ where: { email: params.email } })
      .then(user => user.destroy())
      .then(() => {
        return res.status(200).json({ success: true, message: helper.strings.userSuccessfullyDeleted })
      })
      .catch(err => {
        helper.methods.handleErrors(err, res)
      })
  }
}
