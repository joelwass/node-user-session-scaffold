const Sequelize = require('sequelize')
const path = require('path')
const fs = require('fs')

const host = (typeof process.env.MYSQL_HOST === 'undefined') ? 'localhost' : process.env.MYSQL_HOST
const username = (typeof process.env.MYSQL_USERNAME === 'undefined') ? 'root' : process.env.MYSQL_USERNAME
const password = (typeof process.env.MYSQL_PASSWORD === 'undefined') ? '' : process.env.MYSQL_PASSWORD
const database = (typeof process.env.MYSQL_DB === 'undefined') ? 'recommend' : process.env.MYSQL_DB

const connection = new Sequelize(database, username, password, {
  host,
  dialect: 'mysql',
  dialectOptions: {
    ssl: false
  },
  operatorsAliases: false,
  logging: process.env.NODE_ENV === 'production' ? false : console.log,
  pool: { max: 5, min: 0, idle: 10000 }
})
let db = {}

fs.readdirSync(__dirname).filter(file => {
  return (file.indexOf('.') !== 0) && (file !== 'index.js')
}).forEach(file => {
  let model = connection.import(path.join('../', __dirname, file))
  db[model.name] = model
})

Object.keys(db).forEach((modelName) => {
  if ('associate' in db[modelName]) {
    db[modelName].associate(db)
  }
})

db.sequelize = connection
db.Sequelize = Sequelize

module.exports = db
