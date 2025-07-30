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

  email: Joi.string().email().optional().trim()
})

const createVariantAttributeValidation = async (req: Request, res: Response, next: NextFunction) => {
  const variantAttributeValidationSchema = Joi.object({
    variantId: Joi.string()
      .required()
      .trim()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .message('variantId phải là một MongoDB ObjectId hợp lệ'),
    attributeId: Joi.string()
      .required()
      .trim()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .message('attributeId phải là một MongoDB ObjectId hợp lệ'),
    value: Joi.string().required().trim().min(1).max(255).messages({
      'string.base': 'Giá trị thuộc tính phải là chuỗi',
      'string.empty': 'Giá trị thuộc tính không được để trống',
      'any.required': 'Giá trị thuộc tính là trường bắt buộc',
      'string.min': 'Giá trị thuộc tính tối thiểu 1 ký tự',
      'string.max': 'Giá trị thuộc tính tối đa 255 ký tự'
    }),
    createdBy: metaDataRefSchema.optional(),
    updatedBy: metaDataRefSchema.optional(),
    deletedByInfo: metaDataRefSchema.optional()
  })

  try {
    await variantAttributeValidationSchema.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const fetchAllVariantAttributesValidation = async (req: Request, res: Response, next: NextFunction) => {
  const fetchAllVariantAttributesValidationSchema = Joi.object({
    current: Joi.number().optional().default(1).min(1),
    pageSize: Joi.number().optional().default(10).min(1).max(100),
    qs: Joi.string().optional()
  })
  try {
    await fetchAllVariantAttributesValidationSchema.validateAsync(req.query, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const fetchInfoVariantAttributeValidation = async (req: Request, res: Response, next: NextFunction) => {
  const fetchInfoVariantAttributeValidationSchema = Joi.object({
    variantAttributeId: Joi.string()
      .required()
      .trim()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .message('variantAttributeId phải là một MongoDB ObjectId hợp lệ')
  })
  try {
    await fetchInfoVariantAttributeValidationSchema.validateAsync(req.params, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const updateVariantAttributeValidation = async (req: Request, res: Response, next: NextFunction) => {
  const variantAttributeValidationSchema = Joi.object({
    variantId: Joi.string()
      .required()
      .trim()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .message('variantId phải là một MongoDB ObjectId hợp lệ'),
    attributeId: Joi.string()
      .required()
      .trim()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .message('attributeId phải là một MongoDB ObjectId hợp lệ'),
    value: Joi.string().required().trim().min(1).max(255).messages({
      'string.base': 'Giá trị thuộc tính phải là chuỗi',
      'string.empty': 'Giá trị thuộc tính không được để trống',
      'any.required': 'Giá trị thuộc tính là trường bắt buộc',
      'string.min': 'Giá trị thuộc tính tối thiểu 1 ký tự',
      'string.max': 'Giá trị thuộc tính tối đa 255 ký tự'
    }),
    createdBy: metaDataRefSchema.optional(),
    updatedBy: metaDataRefSchema.optional(),
    deletedByInfo: metaDataRefSchema.optional()
  })

  try {
    await variantAttributeValidationSchema.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const deleteVariantAttributeValidation = async (req: Request, res: Response, next: NextFunction) => {
  const deleteVariantAttributeValidationSchema = Joi.object({
    variantAttributeId: Joi.string()
      .required()
      .trim()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .message('variantAttributeId phải là một MongoDB ObjectId hợp lệ')
  })
  try {
    await deleteVariantAttributeValidationSchema.validateAsync(req.params, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

export const variantAttributeValidation = {
  createVariantAttributeValidation,
  fetchAllVariantAttributesValidation,
  fetchInfoVariantAttributeValidation,
  updateVariantAttributeValidation,
  deleteVariantAttributeValidation
}
