import express from 'express'
import { Nuxt, Builder } from 'nuxt'
import path  from 'path'
import bodyParser from 'body-parser'
import cors from 'cors'
import sqlModel from './models'
import routes from './routes'

const app = express()
const host = process.env.HOST || '127.0.0.1'
const port = process.env.PORT || 3000

app.set('port', port)

// Import and Set Nuxt.js options
let config = require('../nuxt.config.js')
const dev = process.env.NODE_ENV !== 'production'
config.dev = dev;

(async () => {
  try {
    // app.use(cors())

    // app.use(bodyParser.json())
    // app.use(bodyParser.urlencoded({ extended: false }))

    app.use('/api', routes)

    // Init Nuxt.js
    const nuxt = new Nuxt(config)
    
    // Build only in dev mode
    if (config.dev) {
      const builder = new Builder(nuxt)
      builder.build()
    }
    
    // Give nuxt middleware to express
    app.use(nuxt.render)
    
    await sqlModel.sequelize.sync()
    
    app.listen(port, (err) => {
      if (err) throw err
      console.log('> Ready on http://localhost:3000')
    })  
  } catch (err) {
    console.error(err.stack)
    process.exit(1)
  }
})()
