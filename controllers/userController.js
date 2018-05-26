const sqlModels = require('../models')
const pluck = require('object-pluck')
const helper = require('../helper')

module.exports = {
  createUser: (req, res) => {
    // validate params, all required fields
    const params = pluck(['email', 'password', 'firstName', 'lastName', 'birthday'], req.body).end()
    if (Object.keys(params).length !== 5) return res.status(200).json({ success: false, message: helper.strings.invalidParameters })

    // convert time stamp
    params.birthday = new Date(parseInt(params.birthday)).toISOString()

    // validate password length
    if (params.password.length < 5) return res.status(200).json({ success: false, message: helper.strings.invalidPasswordParameter })

    return sqlModels.User.findOrCreate({ where: { email: params.email }, defaults: params })
      .then(result => {
        const didCreateNewUser = result[1]
        const user = result[0].toJSON()

        // delete the password so we're not sending it to the client
        delete user.password

        // if the user wasn't created new, this will return the old, found user with matching email address
        if (!didCreateNewUser) return res.status(200).json({ success: false, message: helper.strings.userAlreadyExists, user: user })
        else return res.status(200).json({ success: true, message: helper.strings.userCreatedSuccesfully, user: user })
      })
      .catch(err => {
        helper.methods.handleErrors(err, res)
      })
  },
  updateUser: (req, res) => {
    // validate params, email is required but all else are optional
    const params = pluck(['email', 'password', 'firstName', 'lastName', 'birthday', 'recommendationsGiven', 'recommendationsReceived', 'recommendationsGivenCorrect', 'recommendationsReceivedCorrect', 'meta'], req.body).end()
    if (!params.email) return res.status(200).json({ success: false, message: helper.strings.invalidParameters })

    // convert birthday
    if (params.birthday) params.birthday = new Date(parseInt(params.birthday)).toISOString()

    // find the user by the email
    sqlModels.User.findOne({ where: { id: req.currentUserId } })
      .then(user => {
        // check if a user was returned
        if (!user) throw new helper.CustomError(helper.strings.noUserExistingByThatEmail)
        // update the user properties
        Object.keys(params).forEach(updatedProperty => {
          user[updatedProperty] = params[updatedProperty]
        })
        return user.save()
      })
      .then(updatedUser => {
        const returnUser = updatedUser.toJSON()

        // delete the password so we're not sending it to the client
        delete returnUser.password

        return res.status(200).json({ success: true, message: helper.strings.userUpdatedSuccesfully, user: returnUser })
      })
      .catch(err => {
        helper.methods.handleErrors(err, res)
      })
  },
  getUsers: (req, res) => {
    sqlModels.User.findAll()
      .then(users => {
        // iterate over all users and remove password field
        const returnUsers = users.map(user => pluck(['id', 'firstName', 'lastName'], user.toJSON()).end())

        return res.status(200).json({ success: true, users: returnUsers })
      })
      .catch(err => {
        helper.methods.handleErrors(err, res)
      })
  },
  getUser: (req, res) => {
    // validate params, must have email in the query string
    const params = pluck(['email'], req.params).end()
    if (!params.email) return res.status(200).json({ success: false, message: helper.strings.invalidParameters })

    sqlModels.User.findOne({ where: { email: params.email } })
      .then(user => {
        const returnUser = user.toJSON()
        delete returnUser.password
        return res.status(200).json({ success: true, user: returnUser })
      })
      .catch(err => {
        helper.methods.handleErrors(err, res)
      })
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
