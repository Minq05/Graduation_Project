import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import Joi from 'joi'
import ApiError from '~/utils/ApiError'

const createCartValidation = async (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    userId: Joi.string().trim().length(24).required().label('userId').messages({
      'string.base': 'userId phải là chuỗi',
      'string.length': 'userId phải có độ dài 24 ký tự',
      'any.required': 'userId là trường bắt buộc'
    })
  })
  try {
    await schema.validateAsync(req.body, { abortEarly: false, stripUnknown: true })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const addItemToCartValidation = async (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    cartId: Joi.string().trim().length(24).required().label('cartId').messages({
      'string.base': 'cartId phải là chuỗi',
      'string.length': 'cartId phải có độ dài 24 ký tự',
      'any.required': 'cartId là trường bắt buộc'
    }),
    productId: Joi.string().trim().length(24).required().label('productId').messages({
      'string.base': 'productId phải là chuỗi',
      'string.length': 'productId phải có độ dài 24 ký tự',
      'any.required': 'productId là trường bắt buộc'
    }),
    variantId: Joi.string().trim().min(1).required().label('variantId').messages({
      'string.base': 'variantId phải là chuỗi',
      'string.min': 'variantId phải có ít nhất 1 ký tự',
      'any.required': 'variantId là trường bắt buộc'
    }),
    quantity: Joi.number().integer().min(1).required().label('quantity').messages({
      'number.base': 'quantity phải là số',
      'number.integer': 'quantity phải là số nguyên',
      'number.min': 'quantity phải lớn hơn hoặc bằng 1',
      'any.required': 'quantity là trường bắt buộc'
    })
  })
  try {
    await schema.validateAsync(req.body, { abortEarly: false, stripUnknown: true })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Lỗi khi thêm sản phẩm vào giỏ hàng'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const updateCartValidation = async (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    cartId: Joi.string().trim().length(24).hex().optional().label('cartId').messages({
      'string.base': 'cartId phải là chuỗi',
      'string.length': 'cartId phải có độ dài 24 ký tự',
      'string.hex': 'cartId phải là chuỗi hex hợp lệ'
    }),
    cartItemId: Joi.string().trim().length(24).hex().required().label('cartItemId').messages({
      'string.base': 'cartItemId phải là chuỗi',
      'string.length': 'cartItemId phải có độ dài 24 ký tự',
      'string.hex': 'cartItemId phải là chuỗi hex hợp lệ',
      'any.required': 'cartItemId là trường bắt buộc'
    }),
    newQuantity: Joi.number().integer().min(0).required().label('newQuantity').messages({
      'number.base': 'newQuantity phải là số',
      'number.integer': 'newQuantity phải là số nguyên',
      'number.min': 'newQuantity phải lớn hơn hoặc bằng 0',
      'any.required': 'newQuantity là trường bắt buộc'
    })
  })

  try {
    await schema.validateAsync(req.body, { abortEarly: false, stripUnknown: true })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Lỗi khi cập nhật giỏ hàng'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const deleteCartValidation = async (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    cartId: Joi.string().trim().length(24).hex().required().label('cartId').messages({
      'string.base': 'cartId phải là chuỗi',
      'string.length': 'cartId phải có độ dài 24 ký tự',
      'string.hex': 'cartId phải là chuỗi hex hợp lệ',
      'any.required': 'cartId là trường bắt buộc'
    })
  })

  try {
    await schema.validateAsync(req.params, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi khi xóa cart item'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const clearCartValidation = async (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    cartId: Joi.string().trim().length(24).hex().required().label('cartId').messages({
      'string.base': 'cartId phải là chuỗi',
      'string.length': 'cartId phải có độ dài 24 ký tự',
      'string.hex': 'cartId phải là chuỗi hex hợp lệ',
      'any.required': 'cartId là trường bắt buộc'
    })
  })
  try {
    await schema.validateAsync(req.params, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Lỗi khi xóa giỏ hàng'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const deleteItemFromCartValidation = async (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    cartId: Joi.string().trim().length(24).hex().required().label('cartId').messages({
      'string.base': 'cartId phải là chuỗi',
      'string.length': 'cartId phải có độ dài 24 ký tự',
      'string.hex': 'cartId phải là chuỗi hex hợp lệ',
      'any.required': 'cartId là trường bắt buộc'
    }),
    itemId: Joi.string().trim().length(24).hex().required().label('itemId').messages({
      'string.base': 'itemId phải là chuỗi',
      'string.length': 'itemId phải có độ dài 24 ký tự',
      'string.hex': 'itemId phải là chuỗi hex hợp lệ',
      'any.required': 'itemId là trường bắt buộc'
    })
  })

  try {
    const { cartId, itemId } = req.params
    await schema.validateAsync({ cartId, itemId }, { abortEarly: false, stripUnknown: true })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Lỗi khi xóa sản phẩm khỏi giỏ hàng'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const fetchInfoCartValidation = async (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    cartId: Joi.string().trim().length(24).hex().required().label('cartId').messages({
      'string.base': 'cartId phải là chuỗi',
      'string.length': 'cartId phải có độ dài 24 ký tự',
      'string.hex': 'cartId phải là chuỗi hex hợp lệ',
      'any.required': 'cartId là trường bắt buộc'
    })
  })

  try {
    await schema.validateAsync(req.params, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Lỗi khi lấy thông tin cart'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

export const cartValidation = {
  createCartValidation,
  updateCartValidation,
  deleteCartValidation,
  fetchInfoCartValidation,
  addItemToCartValidation,
  clearCartValidation,
  deleteItemFromCartValidation
}
