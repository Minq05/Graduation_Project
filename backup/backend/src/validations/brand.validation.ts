import { NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'
import Joi from 'joi'
import ApiError from '~/utils/ApiError'
import { Request, Response } from 'express'

const objectIdSchema = Joi.string()
  .required()
  .trim()
  .pattern(/^[0-9a-fA-F]{24}$/)
  .messages({
    'string.pattern.base': 'ID phải là object hợp lệ',
    'any.required': 'ID bắt buộc '
  })
const createBrandValidation = async (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    name: Joi.string().required().min(3).max(255).trim().messages({
      'string.empty': 'Tên không được để trống',
      'any.required': 'Tên bắt buộc'
    }),
    slug: Joi.forbidden().messages({
      'any.unknown': 'Slug không được phép truyền vào'
    }),
    avatar: Joi.string().uri().optional().messages({
      'string.uri': 'Ảnh đại diện phải là URL hợp lệ'
    }),
    isPublic: Joi.boolean().required().messages({
      'any.required': 'Trạng thái là bắt buộc',
      'boolean.base': 'Trạng thái phải là true hoặc false'
    }),
    categoryBrandId: objectIdSchema.label('categoryBrandId').optional()
  })
  try {
    await schema.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Xác thực dữ liệu thất bại'
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, message))
  }
}
const fetchAllBrandValidation = async (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    current: Joi.number().optional().default(1).min(1),
    pageSize: Joi.number().optional().default(10).min(1).max(100),
    qs: Joi.string().optional()
  })
  try {
    await schema.validateAsync(req.query, { abortEarly: false })
    next()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Xác thực dữ liệu thất bại'
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, message))
  }
}
const fetchBrandByIdValidation = async (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    brandID: objectIdSchema
  })

  try {
    await schema.validateAsync(req.params, { abortEarly: false })
    next()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Xác thực dữ liệu thất bại'
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, message))
  }
}
const updateBrandValidation = async (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    name: Joi.string().optional().trim().min(2).max(255),
    slug: Joi.string().optional().trim().max(255),
    isPublic: Joi.boolean().optional(),
    avatar: Joi.string().optional().uri(),
    categoryBrandId: objectIdSchema.optional().label('categoryBrandId')
  })

  try {
    await schema.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Xác thực dữ liệu thất bại'
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, message))
  }
}

const deleteBrandValidation = async (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    brandID: objectIdSchema
  })

  try {
    await schema.validateAsync(req.params, { abortEarly: false })
    next()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Xác thực dữ liệu thất bại'
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, message))
  }
}

export const brandValidation = {
  createBrandValidation,
  fetchAllBrandValidation,
  fetchBrandByIdValidation,
  updateBrandValidation,
  deleteBrandValidation
}
