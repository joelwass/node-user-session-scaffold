const constants = require('../helper/constants')

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
    ],
    hooks: {
      // afterUpdate: (recommendation, options) => {
      //   // figure out of the recommendation was correct or not
      //   const correctRecommendation = recommendation.prediction === recommendation.result
      //   // find the to_user and update the to_users recommendationsReceivedCorrect field and the from_users recomendation correct field
      //   sequelize.models.User.findOne({ where: { id: recommendation.to_user } })
      //     .then(user => {
      //       if (correctRecommendation) user.recommendationsReceivedCorrect++
      //       return user.save()
      //     })
      //     .then(() => sequelize.models.User.findOne({ where: { id: recommendation.from_user } }))
      //     .then(user => {
      //       if (correctRecommendation) user.recommendationsGivenCorrect++
      //       return user.save()
      //     })
      //     .catch(err => {
      //       return Promise.reject(err)
      //     })
      // },
      // beforeCreate: (recommendation, options) => {
      //   // update the from_users recommendations_given field and the to_users recommendations received field
      //   sequelize.models.User.findOne({ where: { id: recommendation.to_user } })
      //     .then(user => {
      //       user.recommendationsReceived++
      //       return user.save()
      //     })
      //     .then(() => sequelize.models.User.findOne({ where: { id: recommendation.from_user } }))
      //     .then(user => {
      //       user.recommendationsGiven++
      //       return user.save()
      //     })
      //     .catch(err => {
      //       return Promise.reject(err)
      //     })
      // }
    }
  })

  return Order
}
