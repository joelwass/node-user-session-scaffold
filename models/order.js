const constants = require('../helper/constants')
const customer = require('./customer')

module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    products: {
      type: DataTypes.JSON,
      required: true,
      defaultValue: {}
    },
    customerId: {
      type: DataTypes.STRING,
      required: false
    },
    completed: {
      type: DataTypes.BOOLEAN,
      required: true,
      defaultValue: false
    },
    paid: {
      type: DataTypes.BOOLEAN,
      required: true,
      defaultValue: false
    },
    shipped: {
      type: DataTypes.BOOLEAN,
      required: true,
      defaultValue: false
    },
    price: {
      type: DataTypes.STRING,
      required: true
    },
    price_dollars: {
      type: DataTypes.INTEGER,
      required: true
    },
    price_cents: {
      type: DataTypes.INTEGER,
      required: true
    },
    discount: {
      type: DataTypes.STRING,
      required: true,
      defaultValue: '0.00'
    },
    discount_dollars: {
      type: DataTypes.INTEGER,
      required: true,
      defaultValue: 0
    },
    discount_cents: {
      type: DataTypes.INTEGER,
      required: true,
      defaultValue: 0
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    paidDate: {
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
    ]
  })

  return Order
}
