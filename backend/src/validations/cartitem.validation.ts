import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import Joi from 'joi'
import ApiError from '~/utils/ApiError'

const createCartItemValidation = async (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    cartId: Joi.string().trim().length(24).hex().required().label('cartId').messages({
      'string.base': 'cartId phải là chuỗi',
      'string.length': 'cartId phải có độ dài 24 ký tự',
      'string.hex': 'cartId phải là chuỗi hex hợp lệ',
      'any.required': 'cartId là trường bắt buộc'
    }),
    productId: Joi.string().trim().length(24).hex().required().label('productId').messages({
      'string.base': 'productId phải là chuỗi',
      'string.length': 'productId phải có độ dài 24 ký tự',
      'string.hex': 'productId phải là chuỗi hex hợp lệ',
      'any.required': 'productId là trường bắt buộc'
    }),
    variantId: Joi.string().trim().length(24).hex().required().label('variantId').messages({
      'string.base': 'variantId phải là chuỗi',
      'string.length': 'variantId phải có độ dài 24 ký tự',
      'string.hex': 'variantId phải là chuỗi hex hợp lệ',
      'any.required': 'variantId là trường bắt buộc'
    }),
    quantity: Joi.number().integer().min(1).required().messages({
      'number.base': 'Số lượng phải là số',
      'number.min': 'Số lượng tối thiểu là 1',
      'any.required': 'Số lượng là trường bắt buộc'
    }),
    price: Joi.number().min(0).required().messages({
      'number.base': 'Giá phải là số',
      'number.min': 'Giá không được âm',
      'any.required': 'Giá là trường bắt buộc'
    })
  })

  try {
    await schema.validateAsync(req.body, { abortEarly: false, stripUnknown: true })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error instanceof Error ? error.message : 'Lỗi khi tạo cart item'))
  }
}

const updateCartItemValidation = async (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    quantity: Joi.number().integer().min(1).optional().messages({
      'number.base': 'Số lượng phải là số',
      'number.min': 'Số lượng tối thiểu là 1'
    }),
    price: Joi.number().min(0).optional().messages({
      'number.base': 'Giá phải là số',
      'number.min': 'Giá không được âm'
    })
  })

  try {
    await schema.validateAsync(req.body, { abortEarly: false, stripUnknown: true })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error instanceof Error ? error.message : 'Lỗi khi cập nhật cart item'))
  }
}

const deleteCartItemValidation = async (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    cartItemId: Joi.string().trim().length(24).hex().required().label('cartItemId').messages({
      'string.base': 'cartItemId phải là chuỗi',
      'string.length': 'cartItemId phải có độ dài 24 ký tự',
      'string.hex': 'cartItemId phải là chuỗi hex hợp lệ',
      'any.required': 'cartItemId là trường bắt buộc'
    })
  })

  try {
    await schema.validateAsync(req.params, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error instanceof Error ? error.message : 'Lỗi khi xoá cart item'))
  }
}

const fetchAllCartItemsValidation = async (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    cartId: Joi.string().trim().length(24).hex().required().label('cartId').messages({
      'string.base': 'cartId phải là chuỗi',
      'string.length': 'cartId phải có độ dài 24 ký tự',
      'string.hex': 'cartId phải là chuỗi hex hợp lệ',
      'any.required': 'cartId là trường bắt buộc'
    })
  })

  try {
    await schema.validateAsync(req.query, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error instanceof Error ? error.message : 'Lỗi khi lấy danh sách cart item'))
  }
}

const fetchInfoCartItemValidation = async (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    cartItemId: Joi.string().trim().length(24).hex().required().label('cartItemId').messages({
      'string.base': 'cartItemId phải là chuỗi',
      'string.length': 'cartItemId phải có độ dài 24 ký tự',
      'string.hex': 'cartItemId phải là chuỗi hex hợp lệ',
      'any.required': 'cartItemId là trường bắt buộc'
    })
  })

  try {
    await schema.validateAsync(req.params, { abortEarly: false })
    next()
  } catch (error) {
    next( new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error instanceof Error ? error.message : 'Lỗi khi lấy thông tin cart item' ))
  }
}

export const cartItemValidation = {
  createCartItemValidation,
  updateCartItemValidation,
  deleteCartItemValidation,
  fetchAllCartItemsValidation,
  fetchInfoCartItemValidation
}
