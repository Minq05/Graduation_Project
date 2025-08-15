import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import Joi from 'joi'
import ApiError from '~/utils/ApiError'

export const createFlashSaleItemValidation = async (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    flashSaleId: Joi.string().trim().length(24).hex().required().label('flashSaleId').messages({
      'string.base': 'flashSaleId phải là chuỗi',
      'string.length': 'flashSaleId phải có độ dài 24 ký tự',
      'string.hex': 'flashSaleId phải là chuỗi hex hợp lệ',
      'any.required': 'flashSaleId là trường bắt buộc'
    }),
    productId: Joi.string().trim().length(24).hex().required().label('productId').messages({
      'string.base': 'productId phải là chuỗi',
      'string.length': 'productId phải có độ dài 24 ký tự',
      'string.hex': 'productId phải là chuỗi hex hợp lệ',
      'any.required': 'productId là trường bắt buộc'
    }),
    variantId: Joi.string().trim().length(24).hex().optional().label('variantId').messages({
      'string.base': 'variantId phải là chuỗi',
      'string.length': 'variantId phải có độ dài 24 ký tự',
      'string.hex': 'variantId phải là chuỗi hex hợp lệ'
    }),
    discountPercent: Joi.number().min(0).max(100).required().messages({
      'number.base': 'discountPercent phải là số',
      'number.min': 'discountPercent tối thiểu là 0',
      'number.max': 'discountPercent tối đa là 100',
      'any.required': 'discountPercent là trường bắt buộc'
    }),
    limitQuantity: Joi.number().min(1).required().messages({
      'number.base': 'limitQuantity phải là số',
      'number.min': 'limitQuantity tối thiểu là 1',
      'any.required': 'limitQuantity là trường bắt buộc'
    })
  })
  try {
    await schema.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình xử lý'
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage))
  }
}

export const fetchAllFlashSaleItemsValidation = async (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    flashSaleId: Joi.string().trim().length(24).hex().optional(),
    current: Joi.number().optional().default(1).min(1),
    pageSize: Joi.number().optional().default(10).min(1).max(100)
  })
  try {
    await schema.validateAsync(req.query, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình xử lý'
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage))
  }
}

export const fetchInfoFlashSaleItemValidation = async (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    itemId: Joi.string().trim().length(24).hex().required().label('itemId').messages({
      'string.base': 'itemId phải là chuỗi',
      'string.length': 'itemId phải có độ dài 24 ký tự',
      'string.hex': 'itemId phải là chuỗi hex hợp lệ',
      'any.required': 'itemId là trường bắt buộc'
    })
  })
  try {
    await schema.validateAsync(req.params, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình xử lý'
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage))
  }
}

export const updateFlashSaleItemValidation = async (req: Request, res: Response, next: NextFunction) => {
  const paramsSchema = Joi.object({
    itemId: Joi.string().trim().length(24).hex().required().label('itemId').messages({
      'string.base': 'itemId phải là chuỗi',
      'string.length': 'itemId phải có độ dài 24 ký tự',
      'string.hex': 'itemId phải là chuỗi hex hợp lệ',
      'any.required': 'itemId là trường bắt buộc'
    })
  })
  const bodySchema = Joi.object({
    discountPercent: Joi.number().min(0).max(100).optional().messages({
      'number.base': 'discountPercent phải là số',
      'number.min': 'discountPercent tối thiểu là 0',
      'number.max': 'discountPercent tối đa là 100'
    }),
    limitQuantity: Joi.number().min(1).optional().messages({
      'number.base': 'limitQuantity phải là số',
      'number.min': 'limitQuantity tối thiểu là 1'
    })
  })
  try {
    await paramsSchema.validateAsync(req.params, { abortEarly: false })
    await bodySchema.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình xử lý'
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage))
  }
}

export const deleteFlashSaleItemValidation = async (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    itemId: Joi.string().trim().length(24).hex().required().label('itemId').messages({
      'string.base': 'itemId phải là chuỗi',
      'string.length': 'itemId phải có độ dài 24 ký tự',
      'string.hex': 'itemId phải là chuỗi hex hợp lệ',
      'any.required': 'itemId là trường bắt buộc'
    })
  })
  try {
    await schema.validateAsync(req.params, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình xử lý'
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage))
  }
}
