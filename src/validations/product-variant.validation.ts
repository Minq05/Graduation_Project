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

const createProductVariantValidation = async (req: Request, res: Response, next: NextFunction) => {
  const productVariantValidationSchema = Joi.object({
    productId: Joi.string()
      .required()
      .trim()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .message('productId phải là một MongoDB ObjectId hợp lệ'),
    sku: Joi.string().required().trim().min(2).max(50).messages({
      'string.base': 'SKU phải là chuỗi',
      'string.empty': 'SKU không được để trống',
      'any.required': 'SKU là trường bắt buộc',
      'string.min': 'SKU tối thiểu 2 ký tự',
      'string.max': 'SKU tối đa 50 ký tự'
    }),
    price: Joi.number().required().min(0).messages({
      'number.base': 'Giá biến thể phải là số',
      'number.min': 'Giá biến thể không được nhỏ hơn 0',
      'any.required': 'Giá biến thể là trường bắt buộc'
    }),
    stock: Joi.number().required().min(0).messages({
      'number.base': 'Số lượng tồn kho phải là số',
      'number.min': 'Số lượng tồn kho không được nhỏ hơn 0',
      'any.required': 'Số lượng tồn kho là trường bắt buộc'
    }),
    image: Joi.string().optional().uri().messages({
      'string.uri': 'image phải là URL hợp lệ'
    }),
    attributes: Joi.object().optional()
  })

  try {
    await productVariantValidationSchema.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const fetchAllProductVariantValidation = async (req: Request, res: Response, next: NextFunction) => {
  const fetchAllProductVariantValidationSchema = Joi.object({
    current: Joi.number().optional().default(1).min(1),
    pageSize: Joi.number().optional().default(10).min(1).max(100),
    qs: Joi.string().optional()
  })
  try {
    await fetchAllProductVariantValidationSchema.validateAsync(req.query, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const fetchInfoProductVariantValidation = async (req: Request, res: Response, next: NextFunction) => {
  const fetchInfoProductVariantValidationSchema = Joi.object({
    variantId: Joi.string()
      .required()
      .trim()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .message('variantId phải là một MongoDB ObjectId hợp lệ')
  })
  try {
    await fetchInfoProductVariantValidationSchema.validateAsync(req.params, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const updateProductVariantValidation = async (req: Request, res: Response, next: NextFunction) => {
  const productVariantValidationSchema = Joi.object({
    productId: Joi.string()
      .required()
      .trim()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .message('productId phải là một MongoDB ObjectId hợp lệ'),
    sku: Joi.string().required().trim().min(2).max(50).messages({
      'string.base': 'SKU phải là chuỗi',
      'string.empty': 'SKU không được để trống',
      'any.required': 'SKU là trường bắt buộc',
      'string.min': 'SKU tối thiểu 2 ký tự',
      'string.max': 'SKU tối đa 50 ký tự'
    }),
    price: Joi.number().required().min(0).messages({
      'number.base': 'Giá biến thể phải là số',
      'number.min': 'Giá biến thể không được nhỏ hơn 0',
      'any.required': 'Giá biến thể là trường bắt buộc'
    }),
    stock: Joi.number().required().min(0).messages({
      'number.base': 'Số lượng tồn kho phải là số',
      'number.min': 'Số lượng tồn kho không được nhỏ hơn 0',
      'any.required': 'Số lượng tồn kho là trường bắt buộc'
    }),
    image: Joi.string().optional().uri().messages({
      'string.uri': 'image phải là URL hợp lệ'
    }),
    attributes: Joi.object().optional(),
    createdBy: metaDataRefSchema.optional(),
    updatedBy: metaDataRefSchema.optional(),
    deletedBy: metaDataRefSchema.optional()
  })

  try {
    await productVariantValidationSchema.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const deleteProductVariantValidation = async (req: Request, res: Response, next: NextFunction) => {
  const deleteProductVariantValidationSchema = Joi.object({
    variantId: Joi.string()
      .required()
      .trim()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .message('variantId phải là một MongoDB ObjectId hợp lệ')
  })
  try {
    await deleteProductVariantValidationSchema.validateAsync(req.params, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

export const productVariantValidation = {
  createProductVariantValidation,
  fetchAllProductVariantValidation,
  fetchInfoProductVariantValidation,
  updateProductVariantValidation,
  deleteProductVariantValidation
}
