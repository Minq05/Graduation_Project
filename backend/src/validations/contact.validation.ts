import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import Joi from 'joi'
import ApiError from '~/utils/ApiError'

// Schema kiểm tra ObjectId MongoDB
const objectIdSchema = Joi.string()
  .trim()
  .pattern(/^[0-9a-fA-F]{24}$/)
  .required()
  .messages({
    'string.pattern.base': 'ID phải là ObjectId hợp lệ',
    'any.required': 'ID là bắt buộc'
  })

// Tạo liên hệ
const createContactValidation = async (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    name: Joi.string().trim().required().messages({
      'string.empty': 'Tên không được để trống',
      'any.required': 'Tên là trường bắt buộc'
    }),
    email: Joi.string().trim().email().required().messages({
      'string.empty': 'Email không được để trống',
      'string.email': 'Email không hợp lệ',
      'any.required': 'Email là trường bắt buộc'
    }),
    phone: Joi.string().trim().required().optional(),
    message: Joi.string().trim().required().messages({
      'string.empty': 'Nội dung tin nhắn không được để trống',
      'any.required': 'Nội dung tin nhắn là trường bắt buộc'
    })
  })

  try {
    await schema.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình xử lý'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

// Sửa liên hệ
const updateContactValidation = async (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    name: Joi.string().trim().required().messages({
      'string.empty': 'Tên không được để trống',
      'any.required': 'Tên là trường bắt buộc'
    }),
    email: Joi.string().trim().email().required().messages({
      'string.empty': 'Email không được để trống',
      'string.email': 'Email không hợp lệ',
      'any.required': 'Email là trường bắt buộc'
    }),
    phone: Joi.string().trim().required().optional(),
    message: Joi.string().trim().required().messages({
      'string.empty': 'Nội dung tin nhắn không được để trống',
      'any.required': 'Nội dung tin nhắn là trường bắt buộc'
    })
  })

  try {
    await schema.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình xử lý'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

// Lấy danh sách liên hệ (có phân trang, lọc)
const fetchAllContactValidation = async (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
    qs: Joi.string().optional()
  })

  try {
    await schema.validateAsync(req.query, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình xử lý'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}


// Lấy thông tin một liên hệ
const fetchInfoContactValidation = async (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    contactId: objectIdSchema.label('contactId')
  })

  try {
    await schema.validateAsync(req.params, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình xử lý'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

// Xoá liên hệ
const deleteContactValidation = async (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    contactId: objectIdSchema.label('contactId')
  })

  try {
    await schema.validateAsync(req.params, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình xử lý'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

export const contactValidation = {
  createContactValidation,
  fetchAllContactValidation,
  fetchInfoContactValidation,
  deleteContactValidation,
  updateContactValidation
}
