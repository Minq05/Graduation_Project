import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import Joi from 'joi'
import ApiError from '~/utils/ApiError'

const signupValidation = async (req: Request, res: Response, next: NextFunction) => {
  const signupValidationSchema = Joi.object({
    email: Joi.string().email().required().trim().messages({
      'string.email': 'Email không hợp lệ',
      'string.empty': 'Email không được để trống',
      'any.required': 'Email là bắt buộc'
    }),
    password: Joi.string()
      .required()
      .min(6)
      .max(255)
      .trim()
      .pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/)
      .messages({
        'string.empty': 'Mật khẩu không được để trống',
        'any.required': 'Mật khẩu là bắt buộc',
        'string.min': 'Mật khẩu phải có ít nhất 6 ký tự',
        'string.max': 'Mật khẩu không được vượt quá 255 ký tự',
        'string.pattern.base': 'Mật khẩu cần ít nhất 1 chữ hoa, 1 chữ số và 1 ký tự đặc biệt'
      })
  })

  try {
    await signupValidationSchema.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const signinValidation = async (req: Request, res: Response, next: NextFunction) => {
  const signinValidationSchema = Joi.object({
    email: Joi.string().email().required().trim().messages({
      'string.email': 'Email không hợp lệ',
      'string.empty': 'Email không được để trống',
      'any.required': 'Email là bắt buộc'
    }),
    password: Joi.string().required().min(6).max(255).trim().messages({
      'string.empty': 'Mật khẩu không được để trống',
      'any.required': 'Mật khẩu là bắt buộc',
      'string.min': 'Mật khẩu phải có ít nhất 6 ký tự',
      'string.max': 'Mật khẩu không được vượt quá 255 ký tự'
    })
  })

  try {
    await signinValidationSchema.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const verifyValidation = async (req: Request, res: Response, next: NextFunction) => {
  const verifyValidationSchema = Joi.object({
    code: Joi.string().min(6).max(6).required().trim().messages({
      'string.min': 'Mã kích hoạt phải có 6 ký tự',
      'string.max': 'Mã kích hoạt không được vượt quá 6 ký tự',
      'string.empty': 'Mã kích hoạt không được để trống',
      'any.required': 'Mã kích hoạt là bắt buộc'
    }),
    email: Joi.string().email().required().trim().messages({
      'string.email': 'Email không hợp lệ',
      'string.empty': 'Email không được để trống',
      'any.required': 'Email là bắt buộc'
    })
  })

  try {
    await verifyValidationSchema.validateAsync({ email: req.query.email, code: req.body.code }, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const forgotPasswordValidation = async (req: Request, res: Response, next: NextFunction) => {
  const forgotPasswordValidationSchema = Joi.object({
    email: Joi.string().email().required().trim().messages({
      'string.email': 'Email không hợp lệ',
      'string.empty': 'Email không được để trống',
      'any.required': 'Email là bắt buộc'
    })
  })

  try {
    await forgotPasswordValidationSchema.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const resetPasswordValidation = async (req: Request, res: Response, next: NextFunction) => {
  const resetPasswordValidationSchema = Joi.object({
    email: Joi.string().email().required().trim().messages({
      'string.email': 'Email không hợp lệ',
      'string.empty': 'Email không được để trống',
      'any.required': 'Email là bắt buộc'
    }),
    password: Joi.string().required().min(6).max(255).trim().messages({
      'string.empty': 'Mật khẩu không được để trống',
      'any.required': 'Mật khẩu là bắt buộc',
      'string.min': 'Mật khẩu phải có ít nhất 6 ký tự',
      'string.max': 'Mật khẩu không được vượt quá 255 ký tự'
    }),
    code: Joi.string().length(6).required().trim().messages({
      'string.length': 'Mã xác minh phải đúng 6 ký tự',
      'string.empty': 'Mã xác minh không được để trống',
      'any.required': 'Mã xác minh là bắt buộc'
    })
  })

  try {
    await resetPasswordValidationSchema.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const reSendCodeValidation = async (req: Request, res: Response, next: NextFunction) => {
  const reSendCodeValidationSchema = Joi.object({
    email: Joi.string().email().required().trim().messages({
      'string.email': 'Email không hợp lệ',
      'string.empty': 'Email không được để trống',
      'any.required': 'Email là bắt buộc'
    })
  })
  try {
    await reSendCodeValidationSchema.validateAsync(req.query, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const changePasswordValidation = async (req: Request, res: Response, next: NextFunction) => {
  const changePasswordSchema = Joi.object({
    currentPassword: Joi.string().required().min(6).max(255).trim().messages({
      'string.empty': 'Mật khẩu hiện tại không được để trống',
      'any.required': 'Mật khẩu hiện tại là bắt buộc',
      'string.min': 'Mật khẩu hiện tại phải có ít nhất 6 ký tự',
      'string.max': 'Mật khẩu hiện tại không được vượt quá 255 ký tự'
    }),
    newPassword: Joi.string().required().min(6).max(255).trim().messages({
      'string.empty': 'Mật khẩu mới không được để trống',
      'any.required': 'Mật khẩu mới là bắt buộc',
      'string.min': 'Mật khẩu mới phải có ít nhất 6 ký tự',
      'string.max': 'Mật khẩu mới không được vượt quá 255 ký tự'
    })
  })

  try {
    await changePasswordSchema.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi kiểm tra dữ liệu'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}
export const authValidation = {
  signupValidation,
  signinValidation,
  verifyValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  reSendCodeValidation,
  changePasswordValidation
}
