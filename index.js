const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const winston = require('./config/winston')
const sqlModel = require('./models')
const routes = require('./routes')

const app = express()
const host = process.env.HOST || '127.0.0.1'
const port = process.env.PORT || 3001

app.set('port', port)

const dev = process.env.NODE_ENV !== 'production';

(async () => {
  try {
    app.use(cors())

    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({ extended: false }))

    app.use(morgan('combined', { stream: winston.stream }))

    app.use('/api/v1', routes)
    
    await sqlModel.sequelize.sync({ force: true })

    // error handler
    app.use((err, req, res, next) => {
      winston.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

      if (dev) {
        return res.status(err.status || 500).json({ message: err.message, stack: err.stack })
      }
      return res.status(500)
    })
    
    app.listen(port, (err) => {
      if (err) throw err
      console.log('> Ready on http://localhost:' + port)
    })  
  } catch (err) {
    console.error(err.stack)
    process.exit(1)
  }
})()
