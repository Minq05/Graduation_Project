import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { authService } from '~/services/auth.service'
import ApiError from '~/utils/ApiError'
import sendApiResponse from '~/utils/response.message'

export interface IAuth {
  email: string
  password: string
}

const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.handleSignup(req.body as IAuth)
    if (result) {
      sendApiResponse(res, StatusCodes.OK, {
        statusCode: StatusCodes.OK,
        message: 'Đăng ký thành công',
        data: 'Đăng ký thành công'
      })
    } else {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Có lỗi xảy ra trong quá trình đăng ký')
    }
  } catch (error) {
    const err = error as ErrorWithStatus
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình thực hiện'
    const statusCode = err.statusCode ?? StatusCodes.UNPROCESSABLE_ENTITY
    const customError = new ApiError(statusCode, errorMessage)
    next(customError)
  }
}

const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const email: string = req.query.email as string
    const code: string = req.body.code
    const result = await authService.handleVerifyEmail({ email, code })
    if (result) {
      sendApiResponse(res, StatusCodes.OK, {
        statusCode: StatusCodes.OK,
        message: 'Xác thực email thành công',
        data: result
      })
    } else {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Có lỗi xảy ra trong quá trình xác thực email')
    }
  } catch (error) {
    const err = error as ErrorWithStatus
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình thực hiện'
    const statusCode = err.statusCode ?? StatusCodes.UNPROCESSABLE_ENTITY
    const customError = new ApiError(statusCode, errorMessage)
    next(customError)
  }
}

const reSendCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const email: string = req.query.email as string
    const result = await authService.handleReSendCode(email)
    if (!result) {
      sendApiResponse(res, StatusCodes.NO_CONTENT, {
        statusCode: StatusCodes.NO_CONTENT,
        message: 'Gửi lại mã xác thực thành công',
        data: result
      })
    } else {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Có lỗi xảy ra trong quá trình gửi lại mã xác thực')
    }
  } catch (error) {
    const err = error as ErrorWithStatus
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình thực hiện'
    const statusCode = err.statusCode ?? StatusCodes.UNPROCESSABLE_ENTITY
    const customError = new ApiError(statusCode, errorMessage)
    next(customError)
  }
}

const signin = async (req: Request, res: Response, next: NextFunction) => {
  const data: IAuth = req.body as IAuth
  try {
    const result = await authService.handleSignin(data, res)
    if (result) {
      sendApiResponse(res, StatusCodes.OK, {
        statusCode: StatusCodes.OK,
        message: 'Đăng nhập thành công',
        data: result
      })
    } else {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Email hoặc mật khẩu không đúng')
    }
  } catch (error) {
    const err = error as ErrorWithStatus
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình thực hiện'
    const statusCode = err.statusCode ?? StatusCodes.UNPROCESSABLE_ENTITY
    const customError = new ApiError(statusCode, errorMessage)
    next(customError)
  }
}

const signout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.clearCookie('refresh_token')
    sendApiResponse(res, StatusCodes.OK, {
      statusCode: StatusCodes.OK,
      message: 'Đăng xuất thành công',
      data: 'Đăng xuất thành công'
    })
  } catch (error) {
    const err = error as ErrorWithStatus
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình thực hiện'
    const statusCode = err.statusCode ?? StatusCodes.UNPROCESSABLE_ENTITY
    const customError = new ApiError(statusCode, errorMessage)
    next(customError)
  }
}

const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.signedCookies['refresh_token']

    if (!refreshToken) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Phiên làm việc không hợp lệ hoặc đã hết hạn')
    }

    const result = await authService.handleRefreshToken(refreshToken, res)
    sendApiResponse(res, StatusCodes.OK, {
      statusCode: StatusCodes.OK,
      message: 'Làm mới token thành công',
      data: result
    })
  } catch (error) {
    const err = error as ErrorWithStatus
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình thực hiện'
    const statusCode = err.statusCode ?? StatusCodes.UNPROCESSABLE_ENTITY
    const customError = new ApiError(statusCode, errorMessage)
    next(customError)
  }
}

const account = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?._id as string
    const result = await authService.handleGetAccount(userId)
    if (result) {
      sendApiResponse(res, StatusCodes.OK, {
        statusCode: StatusCodes.OK,
        message: 'Lấy thông tin tài khoản thành công',
        data: result
      })
    } else {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy tài khoản')
    }
  } catch (error) {
    const err = error as ErrorWithStatus
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình thực hiện'
    const statusCode = err.statusCode ?? StatusCodes.UNPROCESSABLE_ENTITY
    const customError = new ApiError(statusCode, errorMessage)
    next(customError)
  }
}

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body
    const message = await authService.handleForgotPassword(email)
    return sendApiResponse(res, 200, { statusCode: 200, message })
  } catch (error) {
    next(error)
  }
}

export const verifyForgotPasswordCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = req.body
    const email = req.query.email as string
    const message = await authService.handleVerifyForgotPasswordCode({ email, code })
    return sendApiResponse(res, 200, { statusCode: 200, message })
  } catch (error) {
    next(error)
  }
}

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, code } = req.body
    const message = await authService.handleResetPassword({ email, password, code })
    return sendApiResponse(res, 200, { statusCode: 200, message })
  } catch (error) {
    next(error)
  }
}

const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?._id
    if (!userId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Không xác định được người dùng')
    }
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Vui lòng nhập đầy đủ thông tin')
    }

    const message = await authService.handleChangePassword(userId, currentPassword, newPassword)
    return sendApiResponse(res, StatusCodes.OK, {
      statusCode: StatusCodes.OK,
      message
    })
  } catch (error) {
    next(error)
  }
}
export const authController = {
  signup,
  verifyEmail,
  reSendCode,
  signin,
  signout,
  refreshToken,
  account,
  forgotPassword,
  verifyForgotPasswordCode,
  resetPassword,
  changePassword
}
