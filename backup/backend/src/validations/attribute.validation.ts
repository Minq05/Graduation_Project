import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import Joi from 'joi'
import ApiError from '~/utils/ApiError'

const createAttributeValidation = async (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    name: Joi.string().required().trim().min(2).max(50).messages({
      'string.base': 'Tên thuộc tính phải là chuỗi',
      'string.empty': 'Tên thuộc tính không được để trống',
      'string.min': 'Tên thuộc tính tối thiểu 2 ký tự',
      'string.max': 'Tên thuộc tính tối đa 50 ký tự',
      'any.required': 'Tên thuộc tính là trường bắt buộc'
    }),

    slug: Joi.string()
      .optional()
      .trim()
      .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .message('Slug không hợp lệ')
  })

  try {
    await schema.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra'
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage))
  }
}

const fetchAllAttributesValidation = async (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    current: Joi.number().optional().default(1).min(1),
    pageSize: Joi.number().optional().default(10).min(1).max(100),
    qs: Joi.string().optional()
  })
  try {
    await schema.validateAsync(req.query, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra'
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage))
  }
}

const fetchInfoAttributeValidation = async (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    attributeId: Joi.string()
      .required()
      .trim()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .message('attributeId phải là một MongoDB ObjectId hợp lệ')
  })
  try {
    await schema.validateAsync(req.params, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra'
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage))
  }
}

const updateAttributeValidation = async (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    name: Joi.string().required().trim().min(2).max(50).messages({
      'string.base': 'Tên thuộc tính phải là chuỗi',
      'string.empty': 'Tên thuộc tính không được để trống',
      'string.min': 'Tên thuộc tính tối thiểu 2 ký tự',
      'string.max': 'Tên thuộc tính tối đa 50 ký tự',
      'any.required': 'Tên thuộc tính là trường bắt buộc'
    }),

    slug: Joi.string()
      .optional()
      .trim()
      .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .message('Slug không hợp lệ')
  })
  try {
    await schema.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra'
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage))
  }
}

const deleteAttributeValidation = fetchInfoAttributeValidation

export const attributeValidation = {
  createAttributeValidation,
  fetchAllAttributesValidation,
  fetchInfoAttributeValidation,
  updateAttributeValidation,
  deleteAttributeValidation
}
