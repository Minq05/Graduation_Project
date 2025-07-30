import rateLimit from 'express-rate-limit'
import { StatusCodes } from 'http-status-codes'

export const requestLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 1000,
  message: 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.',
  headers: true,
  handler: (req, res) => {
    res.status(StatusCodes.TOO_MANY_REQUESTS).json({
      code: StatusCodes.TOO_MANY_REQUESTS,
      status: 'error',
      message: 'Bạn đã bị giới hạn vì gửi quá nhiều yêu cầu! Vui lòng thử lại sau.'
    })
  }
})
