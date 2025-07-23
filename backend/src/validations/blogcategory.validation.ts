import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import Joi from 'joi'
import ApiError from '~/utils/ApiError'

const metaDataRefSchema = Joi.object({
  _id: Joi.string()
    .required()
    .trim()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .message('ID không hợp lệ'),

  name: Joi.string().optional().trim().min(2).max(100).message('Tên danh mục không hợp lệ'),

  slug: Joi.string()
    .optional()
    .trim()
    .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .message('Slug không hợp lệ')
})

const createCateblogValidation = async (req: Request, res: Response, next: NextFunction) => {
  const cateblogValidationSchema = Joi.object({
    name: Joi.string().required().trim().messages({
      'string.name': 'Tên không hợp lệ',
      'string.empty': 'Tên không được để trống',
      'any.required': 'Tên là trường bắt buộc'
    }),
    slug: Joi.string().required().min(6).max(255).trim().messages({
      'string.empty': 'Slug không được để trống',
      'any.required': 'Slug là trường bắt buộc'
    }),
    createdBy: metaDataRefSchema.optional(),
    updatedBy: metaDataRefSchema.optional(),
    deletedBy: metaDataRefSchema.optional()
  })

  try {
    await cateblogValidationSchema.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const fetchAllCateblogValidation = async (req: Request, res: Response, next: NextFunction) => {
  const fetchAllCateblogValidationSchema = Joi.object({
    current: Joi.number().optional().default(1).min(1),
    pageSize: Joi.number().optional().default(10).min(1).max(100),
    qs: Joi.string().optional()
  })
  try {
    await fetchAllCateblogValidationSchema.validateAsync(req.query, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const fetchInfoCateblogValidation = async (req: Request, res: Response, next: NextFunction) => {
  const fetchInfoCateblogValidationSchema = Joi.object({
    cateblogId: Joi.string().required().trim().message('cateblogId phải là một MongoDB ObjectId hợp lệ')
  })
  try {
    await fetchInfoCateblogValidationSchema.validateAsync(req.params, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const updateCateblogValidation = async (req: Request, res: Response, next: NextFunction) => {
  const updateCateblogValidationSchema = Joi.object({
    name: Joi.string().optional().min(3).max(255).trim(),
    slug: Joi.string().optional().min(3).max(255).trim(),
    createdBy: metaDataRefSchema.forbidden(),
    updatedBy: metaDataRefSchema.optional(),
    deletedBy: metaDataRefSchema.optional()
  })
  try {
    await updateCateblogValidationSchema.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const deleteCateblogValidation = async (req: Request, res: Response, next: NextFunction) => {
  const deleteCateblogValidationSchema = Joi.object({
    cateblogId: Joi.string().required().trim().message('cateblogId phải là một MongoDB ObjectId hợp lệ')
  })
  try {
    await deleteCateblogValidationSchema.validateAsync(req.params, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

export const cateblogValidation = {
  createCateblogValidation,
  fetchAllCateblogValidation,
  fetchInfoCateblogValidation,
  updateCateblogValidation,
  deleteCateblogValidation
}
