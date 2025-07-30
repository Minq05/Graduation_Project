import { comparePassword } from '~/utils/utils'
import { IAuth } from '~/controllers/auth.controller'
import UserModel from '~/models/user.model'
import { sendEmail } from '~/utils/sendEmail'
import { checkExpiredCode, generateCode, hashPassword, isExistObject } from '~/utils/utils'
import { generateToken, verifyToken } from '~/utils/jwt'
import configEnv from '~/config/env'
import { Response } from 'express'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { createLogger } from '~/config/logger'
import { cartService } from './cart.service'

const logger = createLogger(__filename)

const handleSignup = async (data: IAuth) => {
  await isExistObject(
    UserModel,
    { email: data.email },
    { checkExisted: true, errorMessage: 'Tài khoản đã tồn tại', statusCode: StatusCodes.CONFLICT }
  )

  const verifyCode = generateCode()

  const hashPass = await hashPassword(data.password as string)
  const result = await UserModel.create({
    ...data,
    password: hashPass,
    isVerified: false,
    role: 'user',
    verifyCode: verifyCode,
    verifyCodeExpired: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
  })

  if (result) {
    sendEmail(result.email, 'Kích hoạt tài khoản', 'mailer', {
      activationCode: verifyCode,
      author: result.fullName
    })
    const createCart = await cartService.handleCreateCart({ userId: result._id })
    if (!createCart) {
      throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Không thể tạo giỏ hàng, vui lòng thử lại sau')
    }

    return 'Tạo người dùng thành công'
  } else {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Không thể tạo người dùng, vui lòng thử lại sau')
  }
}

const handleVerifyEmail = async ({ email, code }: { email: string; code: string }) => {
  const res = await UserModel.findOne({ email })
  if (res) {
    if (res.isVerified) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email đã được xác thực trước đó')
    }
    if (res.verifyCodeExpired && !checkExpiredCode(res.verifyCodeExpired.toISOString())) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Mã xác thực đã hết hạn, vui lòng yêu cầu mã mới')
    } else if (res.verifyCode === code) {
      res.isVerified = true
      await res.save()
      return 'Xác thực email thành công'
    }
  } else {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Email không tồn tại trong hệ thống')
  }
}

const handleReSendCode = async (email: string) => {
  const verifyCode = generateCode()
  const user = await UserModel.findOne({ email })
  if (user) {
    if (user.isVerified) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email đã được xác thực trước đó')
    }
    user.verifyCode = verifyCode
    user.verifyCodeExpired = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
    await user.save()
    sendEmail(email, 'Kích hoạt tài khoản', 'mailer', {
      activationCode: verifyCode,
      author: user.fullName
    })
    return 'Mã xác thực mới đã được gửi đến email của bạn'
  } else {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Email không tồn tại trong hệ thống')
  }
}

const handleSignin = async (data: IAuth, response: Response) => {
  const user = await UserModel.findOne({ email: data.email })
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Người dùng không tồn tại')
  }
  if (!user.isVerified) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      'Tài khoản chưa được kích hoạt, vui lòng kiểm tra email để kích hoạt tài khoản'
    )
  }
  const isMatch = await comparePassword(data.password as string, user.password as string)
  if (!isMatch) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Mật khẩu không chính xác')
  }

  const token = generateToken({ _id: user._id, email: user.email, role: user.role }, configEnv.jwt.accessTokenExpires)
  const refreshToken = generateToken(
    { _id: user._id, email: user.email, role: user.role },
    configEnv.jwt.refreshTokenExpires
  )
  user.refreshToken = refreshToken
  user.refreshTokenExpired = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  await user.save()

  if (!token || !refreshToken) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Có lỗi xảy ra, vui lòng thử lại sau!')
  }

  response.clearCookie('refresh_token')
  response.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: configEnv.buildMode === 'production',
    sameSite: 'strict',
    signed: true,
    maxAge: 7 * 24 * 60 * 60 * 1000
  })

  return {
    user: {
      _id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role
    },
    access_token: token
  }
}

const handleSignout = async (userId: string) => {
  const user = await UserModel.findById(userId)
  if (!user) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Người dùng không tồn tại')
  }
  user.refreshToken = undefined
  user.refreshTokenExpired = undefined
  await user.save()
  return 'Đăng xuất thành công'
}

const handleRefreshToken = async (refreshToken: string, response: Response) => {
  const verify = verifyToken(refreshToken)

  if (!verify) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Phiên làm việc không hợp lệ hoặc đã hết hạn')
  }

  const user = await UserModel.findOne({ _id: verify._id })
  if (!user || !user.refreshToken || user.refreshToken !== refreshToken) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy tài khoản!')
  }

  const newRefreshToken = generateToken(
    { _id: user._id, email: user.email, role: user.role },
    configEnv.jwt.refreshTokenExpires
  )

  user.refreshToken = newRefreshToken
  user.refreshTokenExpired = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  await user.save()

  response.clearCookie('refresh_token')
  response.cookie('refresh_token', newRefreshToken, {
    httpOnly: true,
    secure: configEnv.buildMode === 'production',
    sameSite: 'strict',
    signed: true,
    maxAge: 7 * 24 * 60 * 60 * 1000
  })

  const newToken = generateToken(
    { _id: user._id, email: user.email, role: user.role },
    configEnv.jwt.accessTokenExpires
  )

  return { access_token: newToken }
}

const handleGetAccount = async (userId: string) => {
  const user = await UserModel.findOne({ _id: userId })

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy tài khoản!')
  }

  return {
    user: {
      _id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role
    }
  }
}

const handleForgotPassword = async (email: string) => {
  const user = await UserModel.findOne({ email })
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Email không tồn tại trong hệ thống')
  }

  const resetToken = generateCode()
  user.passwordResetToken = resetToken
  user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000) // 15 phút
  await user.save()

  await sendEmail(user.email, 'Mã xác minh đặt lại mật khẩu', 'mailer', {
    activationCode: resetToken,
    author: user.fullName
  })

  return 'Mã xác minh đã được gửi tới email'
}

const handleVerifyForgotPasswordCode = async ({ email, code }: { email: string; code: string }) => {
  const user = await UserModel.findOne({ email })
  if (!user || user.passwordResetToken !== String(code)) {
    throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Mã xác minh không đúng')
  }

  if (!user.passwordResetExpires || user.passwordResetExpires < new Date()) {
    throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Mã xác minh đã hết hạn')
  }

  return 'Xác minh mã thành công'
}

const handleResetPassword = async ({ email, password, code }: { email: string; password: string; code: string }) => {
  const user = await UserModel.findOne({ email })
  if (
    !user ||
    user.passwordResetToken !== code ||
    !user.passwordResetExpires ||
    user.passwordResetExpires < new Date()
  ) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Thông tin không hợp lệ hoặc mã đã hết hạn')
  }

  const hashedPassword = await hashPassword(password)
  user.password = hashedPassword
  user.passwordResetToken = undefined
  user.passwordResetExpires = undefined

  await user.save()
  return 'Đặt lại mật khẩu thành công'
}

const handleChangePassword = async (userId: string, currentPassword: string, newPassword: string) => {
  const user = await UserModel.findById(userId)
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Người dùng không tồn tại')
  }

  const isMatch = await comparePassword(currentPassword, user.password)
  if (!isMatch) {
    throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Mật khẩu hiện tại không đúng')
  }

  const hashedNewPassword = await hashPassword(newPassword)
  user.password = hashedNewPassword
  await user.save()

  return 'Đổi mật khẩu thành công'
}
export const authService = {
  handleSignup,
  handleVerifyEmail,
  handleReSendCode,
  handleSignin,
  handleSignout,
  handleRefreshToken,
  handleGetAccount,
  handleForgotPassword,
  handleVerifyForgotPasswordCode,
  handleResetPassword,
  handleChangePassword
}
