import { Request, Response, NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'
import Joi from 'joi'
import ApiError from '~/utils/ApiError'

const objectIdSchema = Joi.string()
  .required()
  .trim()
  .pattern(/^[0-9a-fA-F]{24}$/)
  .message('ID phải là ObjectId hợp lệ')

const createCategoryValidation = async (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    name: Joi.string().required().trim().min(2).max(255).messages({
      'string.empty': 'Tên danh mục không được để trống',
      'any.required': 'Tên danh mục là trường bắt buộc'
    }),
    description: Joi.string().optional().trim().max(500),
    slug: Joi.string().optional().trim().max(255),
    image: Joi.string().optional().trim().uri().max(500),
    isPublic: Joi.boolean().optional()
  })

  try {
    await schema.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Xác thực dữ liệu thất bại'
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, message))
  }
}

const fetchAllCategoriesValidation = async (req: Request, res: Response, next: NextFunction) => {
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

const fetchCategoryByIdValidation = async (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    categoryId: objectIdSchema
  })

  try {
    await schema.validateAsync(req.params, { abortEarly: false })
    next()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Xác thực dữ liệu thất bại'
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, message))
  }
}

const updateCategoryValidation = async (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    name: Joi.string().optional().trim().min(2).max(255),
    description: Joi.string().optional().trim().max(500),
    slug: Joi.string().optional().trim().max(255),
    icon: Joi.string().optional().trim().uri().max(500),
    isPublic: Joi.boolean().optional()
  })

  try {
    await schema.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Xác thực dữ liệu thất bại'
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, message))
  }
}

const deleteCategoryValidation = async (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    categoryId: objectIdSchema
  })

  try {
    await schema.validateAsync(req.params, { abortEarly: false })
    next()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Xác thực dữ liệu thất bại'
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, message))
  }
}

export const categoryValidation = {
  createCategoryValidation,
  fetchAllCategoriesValidation,
  fetchCategoryByIdValidation,
  updateCategoryValidation,
  deleteCategoryValidation
}
