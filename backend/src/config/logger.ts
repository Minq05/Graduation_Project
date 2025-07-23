import winston from 'winston'
import path from 'path'
import configEnv from './env'

const { format, transports } = winston
const { combine, timestamp, printf, colorize, label } = format

// Định nghĩa format base
const logFormat = printf(({ level, message, timestamp, label }) => {
  return `${timestamp} [${label}] [${level.toUpperCase()}]: ${message}`
})

// Hàm tạo logger cho một module cụ thể
export function createLogger(moduleFilename: string) {
  const moduleLabel = path.basename(moduleFilename, path.extname(moduleFilename))

  const logger = winston.createLogger({
    level: 'debug',
    format: combine(label({ label: moduleLabel }), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), logFormat),
    transports: [
      new transports.File({ filename: 'logs/error.log', level: 'error' }),
      new transports.File({ filename: 'logs/combined.log' })
    ]
  })

  if (configEnv.buildMode !== 'production') {
    logger.add(
      new transports.Console({
        format: combine(
          colorize(),
          label({ label: moduleLabel }),
          timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
          logFormat
        )
      })
    )
  }

  return logger
}
