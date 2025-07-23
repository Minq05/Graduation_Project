import { Request, Response, NextFunction } from 'express'
import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

const objectIdSchema = Joi.string()
  .required()
  .trim()
  .pattern(/^[0-9a-fA-F]{24}$/)
  .messages({
    'string.pattern.base': 'ID phải là ObjectId hợp lệ',
    'any.required': 'ID là trường bắt buộc'
  })

const createDiscountsValidation = async (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    code: Joi.string().required().trim().messages({
      'string.empty': 'Mã giảm giá không được để trống',
      'any.required': 'Mã giảm giá là bắt buộc'
    }),
    type: Joi.string().valid('%', 'Vnd').required().messages({
      'any.only': 'Loại giảm giá phải là "%" hoặc "Vnd"',
      'any.required': 'Loại giảm giá là bắt buộc'
    }),
    usage_limit: Joi.number().min(0).max(100).required().messages({
      'number.min': 'Giới hạn sử dụng phải lớn hơn hoặc bằng 0',
      'number.max': 'Giới hạn sử dụng phải nhỏ hơn hoặc bằng 100',
      'any.required': 'Giới hạn sử dụng là bắt buộc'
    }),
    usage_per_user: Joi.number().min(0).max(1).required().messages({
      'number.min': 'Số lần sử dụng mỗi người phải lớn hơn hoặc bằng 0',
      'number.max': 'Số lần sử dụng mỗi người phải nhỏ hơn hoặc bằng 1',
      'any.required': 'Số lần sử dụng mỗi người là bắt buộc'
    }),
    value: Joi.number().min(0).required().messages({
      'number.min': 'Giá trị giảm giá phải lớn hơn hoặc bằng 0',
      'any.required': 'Giá trị giảm giá là bắt buộc'
    }),
    min_order_value: Joi.number().min(0).required().messages({
      'number.min': 'Giá trị đơn hàng tối thiểu phải lớn hơn hoặc bằng 0',
      'any.required': 'Giá trị đơn hàng tối thiểu là bắt buộc'
    }),
    max_discount_amount: Joi.number().min(0).required().messages({
      'number.min': 'Số tiền giảm giá tối đa phải lớn hơn hoặc bằng 0',
      'any.required': 'Số tiền giảm giá tối đa là bắt buộc'
    }),
    status: Joi.string().valid('Sắp diễn ra', 'Đang diễn ra', 'Đã kết thúc').optional(),
    applies_category: Joi.array().items(Joi.string()).optional(),
    applies_product: Joi.array().items(Joi.string()).optional(),
    applies_variant: Joi.array().items(Joi.string()).optional(),
    startDate: Joi.date().iso().required().messages({
      'any.required': 'Ngày bắt đầu là bắt buộc',
      'date.base': 'Ngày bắt đầu không hợp lệ',
    }),
    endDate: Joi.date().iso().greater(Joi.ref('startDate')).required().messages({
      'any.required': 'Ngày kết thúc là bắt buộc',
      'date.base': 'Ngày kết thúc không hợp lệ',
      'date.greater': 'Ngày kết thúc phải lớn hơn ngày bắt đầu'
    }),

    description: Joi.string().required().optional()
  })

  try {
    await schema.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Xác thực dữ liệu thất bại'
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, message))
  }
}

const fetchAllDiscountsValidation = async (req: Request, res: Response, next: NextFunction) => {
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

const fetchDiscountsByIdValidation = async (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    discountsID: objectIdSchema
  })

  try {
    await schema.validateAsync(req.params, { abortEarly: false })
    next()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Xác thực dữ liệu thất bại'
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, message))
  }
}

const updateDiscountsValidation = async (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    code: Joi.string().required().trim().messages({
      'string.empty': 'Mã giảm giá không được để trống',
      'any.required': 'Mã giảm giá là bắt buộc'
    }),
    type: Joi.string().valid('%', 'Vnd').required().messages({
      'any.only': 'Loại giảm giá phải là "%" hoặc "Vnd"',
      'any.required': 'Loại giảm giá là bắt buộc'
    }),
    usage_limit: Joi.number().min(0).max(100).required().messages({
      'number.min': 'Giới hạn sử dụng phải lớn hơn hoặc bằng 0',
      'number.max': 'Giới hạn sử dụng phải nhỏ hơn hoặc bằng 100',
      'any.required': 'Giới hạn sử dụng là bắt buộc'
    }),
    usage_per_user: Joi.number().min(0).max(1).required().messages({
      'number.min': 'Số lần sử dụng mỗi người phải lớn hơn hoặc bằng 0',
      'number.max': 'Số lần sử dụng mỗi người phải nhỏ hơn hoặc bằng 1',
      'any.required': 'Số lần sử dụng mỗi người là bắt buộc'
    }),
    value: Joi.number().min(0).required().messages({
      'number.min': 'Giá trị giảm giá phải lớn hơn hoặc bằng 0',
      'any.required': 'Giá trị giảm giá là bắt buộc'
    }),
    min_order_value: Joi.number().min(0).required().messages({
      'number.min': 'Giá trị đơn hàng tối thiểu phải lớn hơn hoặc bằng 0',
      'any.required': 'Giá trị đơn hàng tối thiểu là bắt buộc'
    }),
    max_discount_amount: Joi.number().min(0).required().messages({
      'number.min': 'Số tiền giảm giá tối đa phải lớn hơn hoặc bằng 0',
      'any.required': 'Số tiền giảm giá tối đa là bắt buộc'
    }),
    status: Joi.string().valid('Sắp diễn ra', 'Đang diễn ra', 'Đã kết thúc').optional(),
    applies_category: Joi.array().items(Joi.string()).optional(),
    applies_product: Joi.array().items(Joi.string()).optional(),
    applies_variant: Joi.array().items(Joi.string()).optional(),
    startDate: Joi.date().iso().required().messages({
      'any.required': 'Ngày bắt đầu là bắt buộc',
      'date.base': 'Ngày bắt đầu không hợp lệ',
    }),
    endDate: Joi.date().iso().greater(Joi.ref('startDate')).required().messages({
      'any.required': 'Ngày kết thúc là bắt buộc',
      'date.base': 'Ngày kết thúc không hợp lệ',
      'date.greater': 'Ngày kết thúc phải lớn hơn ngày bắt đầu'
    }),

    description: Joi.string().required().optional()
  })

  try {
    await schema.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Xác thực dữ liệu thất bại'
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, message))
  }
}

const deleteDiscountsValidation = async (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    discountsID: objectIdSchema
  })

  try {
    await schema.validateAsync(req.params, { abortEarly: false })
    next()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Xác thực dữ liệu thất bại'
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, message))
  }
}

export const discountsValidation = {
  createDiscountsValidation,
  fetchAllDiscountsValidation,
  fetchDiscountsByIdValidation,
  updateDiscountsValidation,
  deleteDiscountsValidation
}
