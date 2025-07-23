import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import Joi from 'joi'
import ApiError from '~/utils/ApiError'

const createWishlistValidation = async (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    productId: Joi.string().required().trim().messages({
      'string.base': 'productId phải là chuỗi',
      'string.empty': 'productId không được để trống',
      'any.required': 'productId là trường bắt buộc'
    })
  })

  try {
    await schema.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const fetchWishlistByUserValidation = async (req: Request, res: Response, next: NextFunction) => {
  const querySchema = Joi.object({
    current: Joi.number().optional().default(1).min(1),
    pageSize: Joi.number().optional().default(10).min(1).max(100),
    qs: Joi.string().optional()
  }).unknown(true)

  try {
    await querySchema.validateAsync(req.query, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const deleteWishlistValidation = async (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    wishlistId: Joi.string().required().trim().messages({
      'string.base': 'wishlistId phải là chuỗi',
      'string.empty': 'wishlistId không được để trống',
      'any.required': 'wishlistId là trường bắt buộc'
    })
  })

  try {
    await schema.validateAsync(req.params, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const checkWishlistValidation = async (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    productId: Joi.string().required().trim().messages({
      'string.base': 'productId phải là chuỗi',
      'string.empty': 'productId không được để trống',
      'any.required': 'productId là trường bắt buộc'
    })
  })

  try {
    await schema.validateAsync(req.params, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

export const wishlistValidation = {
  createWishlistValidation,
  fetchWishlistByUserValidation,
  deleteWishlistValidation,
  checkWishlistValidation
}
