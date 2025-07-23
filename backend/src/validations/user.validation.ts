import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import Joi from 'joi'
import ApiError from '~/utils/ApiError'

const metaDataRefSchema = Joi.object({
  _id: Joi.string()
    .required()
    .trim()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .message('ID phải là ObjectId hợp lệ'),
  email: Joi.string().required().email().trim().message('Email không hợp lệ')
})

const createUserValidation = async (req: Request, res: Response, next: NextFunction) => {
  const userValidationSchema = Joi.object({
    fullName: Joi.string().optional().min(3).max(255).trim(),
    email: Joi.string().email().required().trim().messages({
      'string.email': 'email không hợp lệ',
      'string.empty': 'email không được để trống',
      'any.required': 'email là trường bắt buộc'
    }),
    password: Joi.string().required().min(6).max(255).trim().messages({
      'string.empty': 'password không được để trống',
      'any.required': 'password là trường bắt buộc'
    }),
    phone: Joi.string().optional().min(10).max(15).trim(),
    address: Joi.string().optional().min(5).max(255).trim(),
    gender: Joi.string().optional().valid('male', 'female', 'other'),
    birthday: Joi.date().optional(),
    avatar: Joi.string().optional().uri(),
    verifyCode: Joi.string().optional().min(6).max(6).trim(),
    verifyCodeExpired: Joi.date().optional(),
    isVerified: Joi.boolean().optional(),
    role: Joi.string().optional().valid('user', 'admin'),
    refreshToken: Joi.string().optional().trim(),
    refreshTokenExpired: Joi.date().optional(),
    createdBy: metaDataRefSchema.optional(),
    updatedBy: metaDataRefSchema.optional(),
    deletedBy: metaDataRefSchema.optional()
  })

  try {
    await userValidationSchema.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const fetchAllUserValidation = async (req: Request, res: Response, next: NextFunction) => {
  const fetchAllUserValidationSchema = Joi.object({
    current: Joi.number().optional().default(1).min(1),
    pageSize: Joi.number().optional().default(10).min(1).max(100),
    qs: Joi.string().optional()
  })
  try {
    await fetchAllUserValidationSchema.validateAsync(req.query, { abortEarly: false, allowUnknown: true })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const fetchInfoUserValidation = async (req: Request, res: Response, next: NextFunction) => {
  const fetchInfoUserValidationSchema = Joi.object({
    userId: Joi.string()
      .required()
      .trim()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .message('userId phải là một MongoDB ObjectId hợp lệ')
  })
  try {
    await fetchInfoUserValidationSchema.validateAsync(req.params, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const updateUserValidation = async (req: Request, res: Response, next: NextFunction) => {
  const updateUserValidationSchema = Joi.object({
    fullName: Joi.string().optional().min(3).max(255).trim(),
    email: Joi.forbidden().messages({ 'any.unknown': 'email không được phép cập nhật' }),
    password: Joi.forbidden().messages({ 'any.unknown': 'password không được phép cập nhật' }),
    phone: Joi.string().optional().min(10).max(15).trim(),
    address: Joi.string().optional().min(5).max(255).trim(),
    gender: Joi.string().optional().valid('male', 'female', 'other'),
    birthday: Joi.date().optional(),
    avatar: Joi.string().optional().uri(),
    verifyCode: Joi.string().optional().min(6).max(6).trim(),
    verifyCodeExpired: Joi.date().optional(),
    isVerified: Joi.boolean().optional(),
    status: Joi.string().optional().valid('active', 'inactive', 'banned'),
    role: Joi.string().optional().valid('user', 'admin'),
    refreshToken: Joi.string().optional().trim(),
    refreshTokenExpired: Joi.date().optional(),
    createdBy: metaDataRefSchema.forbidden(),
    updatedBy: metaDataRefSchema.optional(),
    deletedBy: metaDataRefSchema.optional()
  })
  try {
    await updateUserValidationSchema.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const deleteUserValidation = async (req: Request, res: Response, next: NextFunction) => {
  const deleteUserValidationSchema = Joi.object({
    userId: Joi.string()
      .required()
      .trim()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .message('userId phải là một MongoDB ObjectId hợp lệ')
  })
  try {
    await deleteUserValidationSchema.validateAsync(req.params, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

export const userValidation = {
  createUserValidation,
  fetchAllUserValidation,
  fetchInfoUserValidation,
  updateUserValidation,
  deleteUserValidation
}
