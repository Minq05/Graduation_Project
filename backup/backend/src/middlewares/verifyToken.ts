import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import jwt from 'jsonwebtoken'
import configEnv from '~/config/env'
import UserModel from '~/models/user.model'
import sendApiResponse from '~/utils/response.message'

const verifyAccessToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers['authorization']
  // console.log('[VerifyAccessToken] Header:', authHeader)
  // console.log('[VerifyAccessToken] URL:', req.originalUrl)
  // console.log('[VerifyAccessToken] Header:', req.headers['authorization'])

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendApiResponse(res, StatusCodes.UNAUTHORIZED, {
      statusCode: StatusCodes.UNAUTHORIZED,
      message: 'Thiếu token xác thực',
      error: {
        code: StatusCodes.UNAUTHORIZED,
        details: 'Thiếu token xác thực'
      }
    })
    return
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, configEnv.jwt.accessTokenSecret)

    const result = await UserModel.findById((decoded as any)._id).select('-password -__v')

    if (!result) {
      sendApiResponse(res, StatusCodes.FORBIDDEN, {
        statusCode: StatusCodes.FORBIDDEN,
        message: 'Tài khoản không tồn tại!',
        error: {
          code: StatusCodes.FORBIDDEN,
          details: 'Tài khoản không tồn tại!'
        }
      })
      return
    }

    if (
      typeof decoded === 'object' &&
      decoded !== null &&
      'role' in decoded &&
      'email' in decoded &&
      '_id' in decoded
    ) {
      req.user = {
        role: (decoded as any).role,
        email: (decoded as any).email,
        _id: (decoded as any)._id
      }
      next()
    } else {
      sendApiResponse(res, StatusCodes.UNAUTHORIZED, {
        statusCode: StatusCodes.UNAUTHORIZED,
        message: 'Token không hợp lệ',
        error: {
          code: StatusCodes.UNAUTHORIZED,
          details: 'Token không hợp lệ'
        }
      })
      return
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    sendApiResponse(res, StatusCodes.UNAUTHORIZED, {
      statusCode: StatusCodes.UNAUTHORIZED,
      message: 'Token không hợp lệ hoặc đã hết hạn',
      error: {
        code: StatusCodes.UNAUTHORIZED,
        details: 'Token không hợp lệ hoặc đã hết hạn'
      }
    })
    return
  }
}

export default verifyAccessToken
