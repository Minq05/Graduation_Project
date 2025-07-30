import express from 'express'
import bodyParser from 'body-parser'
import configViewEngine from './config/viewEngine'
import connection from './config/connection'
import cors from 'cors'
import { APIs_v1 } from './routes/v1'
import { errorHandlingMiddleware } from './middlewares/errorHandlingMiddleware'
import { corsOptions } from './config/cors'
import { requestLimiter } from './middlewares/limiter'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import configEnv from './config/env'
import path from 'path'
import { initFlashSaleCronJobs } from './utils/cron'

const app = express()

// config cors
app.use(cors(corsOptions))

// parse urlencoded request body
app.use(bodyParser.urlencoded({ extended: false }))

// parse json request body
app.use(bodyParser.json())

// config cookie parser
app.use(cookieParser(configEnv.cookie.secret))

// config request limiter
app.use(requestLimiter)

// config security HTTP headers
app.use(helmet())

//config template engine
configViewEngine(app)

app.use('/uploads', cors(corsOptions), (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
    next()
  },
  express.static(path.join(__dirname, '../public/uploads')))

app.use('/api/v1', APIs_v1)
// config static file
app.use('/', async (req, res) => {
  return res.render('home')
})

// Handle error Middleware
app.use(errorHandlingMiddleware)

// Start server
;(async () => {
  try {
    await connection()
    app.listen(configEnv.app.port, configEnv.app.host, () => {
      console.log(`🚀 Sever running on http://${configEnv.app.host}:${configEnv.app.port}`)

      // Khởi tạo các tác vụ cron cho flash sale
      initFlashSaleCronJobs()

      // Khởi tạo tất cả cron jobs từ database
      const { cronJobService } = require('./services/cron_job.service')
      cronJobService.initAllCronJobs()
    })
  } catch (error) {
    console.log('🚀 async connection ~ ; ~ error:', error)
  }
})()
