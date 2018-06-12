const bcrypt = require('bcrypt')
const helper = require('../helper')

module.exports = (sequelize, DataTypes) => {
  const Customer = sequelize.define('Customer', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      required: true,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      required: true
    },
    firstName: {
      type: DataTypes.STRING,
      required: true
    },
    lastName: {
      type: DataTypes.STRING,
      required: true
    },
    address: {
      type: DataTypes.STRING,
      required: true
    },
    address2: {
      type: DataTypes.STRING,
      required: true
    },
    city: {
      type: DataTypes.STRING,
      required: true
    },
    state: {
      type: DataTypes.STRING,
      required: true
    },
    zip: {
      type: DataTypes.STRING,
      required: true
    },
    birthday: {
      type: DataTypes.DATE
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    meta: {
      type: DataTypes.JSON
    }
  }, {
    freezeTableName: true,
    indexes: [
      {
        unique: true,
        fields: ['id']
      }
    ],
    hooks: {
      beforeCreate: (customer, options) => {
        return bcrypt.hash(customer.password, 10)
          .then(encryptedPassword => {
            customer.password = encryptedPassword
          })
          .catch(err => {
            return Promise.reject(err)
          })
      },
      beforeUpdate: (customer, options) => {
        if (!customer.changed('password')) {
          return
        }

        return bcrypt.hash(customer.password, 10)
          .then(encryptedPassword => {
            customer.password = encryptedPassword
          })
          .catch(err => {
            return Promise.reject(err)
          })
      }
    }
  })

  Customer.authenticate = body => {
    let user
    console.log('')
    console.log(body)
    return Customer.findOne({ where: { email: body.email } })
      .then(localUser => {
        if (!localUser) return Promise.reject(new helper.CustomError(helper.strings.sorryWeCantFindEmail))
        user = localUser
        return bcrypt.compare(body.password, user.password)
      })
      .then(result => {
        if (!result) return Promise.reject(new helper.CustomError(helper.strings.passwordInvalid))
        return Promise.resolve(user)
      })
      .catch(err => {
        return Promise.reject(err)
      })
  }

  return Customer
}
