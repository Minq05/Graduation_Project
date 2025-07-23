import dotenv from 'dotenv'
import path from 'path'
import Joi from 'joi'

const envFile = `.env.${process.env.NODE_ENV || 'development'}`
dotenv.config({ path: path.join(process.cwd(), envFile) })

const envVarsSchema = Joi.object()
  .keys({
    APP_PORT: Joi.number().default(8080),
    APP_HOST: Joi.string().default('localhost'),

    CODE_EXPIRES: Joi.string().default('5m'),

    // MongoDB
    MONGODB_URI: Joi.string().required().description('MongoDB URI'),
    MONGODB_PASSWORD: Joi.string().required().description('MongoDB Password'),
    MONGODB_USERNAME: Joi.string().required().description('MongoDB Username'),
    MONGODB_DB_NAME: Joi.string().required().description('MongoDB Name'),

    // Access Token
    JWT_ACCESS_TOKEN_SECRET: Joi.string().required().description('JWT Access Token Secret'),
    JWT_ACCESS_TOKEN_EXPIRES: Joi.string().default('100d').description('JWT Access Token Expiration'),
    JWT_REFRESH_TOKEN_SECRET: Joi.string().required().description('JWT Refresh Token Secret'),
    JWT_REFRESH_TOKEN_EXPIRES: Joi.string().default('100d').description('JWT Refresh Token Expiration'),

    // Email
    ENABLE_SEND_EMAIL_VERIFY: Joi.boolean().default(true),
    EMAIL_HOST: Joi.string().default('smtp.gmail.com').description('Email Host'),
    EMAIL_PREVIEW: Joi.boolean().default(false),
    EMAIL_EXPIRES: Joi.string().default('5m'),
    EMAIL_AUTH_USER: Joi.string().required().description('Email Auth User'),
    EMAIL_AUTH_PASS: Joi.string().required().description('Email Auth Password'),

    // Multer
    FILE_SIZE: Joi.number().default(1000).description('Max file size (KB)'),
    FILE_TYPE: Joi.string().default('jpeg,jpg,png').description('Allowed file types'),
    FILE_LIMIT: Joi.number().default(5).description('Max number of files'),

    // Throttler
    THROTTLER_TTL: Joi.number().default(60000).description('Throttle TTL (ms)'),
    THROTTLER_LIMIT: Joi.number().default(10).description('Max requests per TTL'),

    // Google OAuth
    OAUTH_GOOGLE_ID: Joi.string().required().description('Google OAuth Client ID'),
    OAUTH_GOOGLE_SECRET: Joi.string().required().description('Google OAuth Client Secret'),
    OAUTH_GOOGLE_REDIRECT_URL: Joi.string().required().description('Google OAuth Redirect URL')
  })
  .unknown()

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env)

if (error) {
  throw new Error(`Config validation error: ${error.message}`)
}

const configEnv = {
  app: {
    port: envVars.APP_PORT,
    host: envVars.APP_HOST
  },
  buildMode: process.env.BUILD_MODE || 'development',
  codeExpires: envVars.CODE_EXPIRES,
  mongoose: {
    uri: envVars.MONGODB_URI,
    username: envVars.MONGODB_USERNAME,
    password: envVars.MONGODB_PASSWORD,
    dbName: envVars.MONGODB_DB_NAME
  },
  jwt: {
    accessTokenSecret: envVars.JWT_ACCESS_TOKEN_SECRET,
    accessTokenExpires: envVars.JWT_ACCESS_TOKEN_EXPIRES,
    refreshTokenSecret: envVars.JWT_REFRESH_TOKEN_SECRET,
    refreshTokenExpires: envVars.JWT_REFRESH_TOKEN_EXPIRES
  },
  cookie: {
    secret: envVars.COOKIE_SECRET
  },
  email: {
    enableVerify: envVars.ENABLE_SEND_EMAIL_VERIFY,
    host: envVars.EMAIL_HOST,
    preview: envVars.EMAIL_PREVIEW,
    expires: envVars.EMAIL_EXPIRES,
    auth: {
      user: envVars.EMAIL_AUTH_USER,
      pass: envVars.EMAIL_AUTH_PASS
    }
  },
  multer: {
    fileSize: envVars.FILE_SIZE,
    fileType: envVars.FILE_TYPE.split(','),
    fileLimit: envVars.FILE_LIMIT
  },
  throttler: {
    ttl: envVars.THROTTLER_TTL,
    limit: envVars.THROTTLER_LIMIT
  },
  oauth: {
    googleId: envVars.OAUTH_GOOGLE_ID,
    googleSecret: envVars.OAUTH_GOOGLE_SECRET,
    googleRedirectUrl: envVars.OAUTH_GOOGLE_REDIRECT_URL
  }
}

export default configEnv
