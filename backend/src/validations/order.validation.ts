import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import Joi from 'joi'
import ApiError from '~/utils/ApiError'

const createOrderValidation = async (req: Request, res: Response, next: NextFunction) => {
  const createOrderValidationSchema = Joi.object({
    userId: Joi.string().trim().length(24).hex().required().label('userId').messages({
      'string.base': 'userId phải là chuỗi',
      'string.length': 'userId phải có độ dài 24 ký tự',
      'string.hex': 'userId phải là chuỗi hex hợp lệ',
      'any.required': 'userId là trường bắt buộc'
    }),
    addressId: Joi.string().trim().length(24).hex().allow(null).optional().label('addressId').messages({
      'string.base': 'addressId phải là chuỗi',
      'string.length': 'addressId phải có độ dài 24 ký tự',
      'string.hex': 'addressId phải là chuỗi hex hợp lệ',
      'any.required': 'addressId là trường bắt buộc'
    }),
    addressFree: Joi.alternatives().try(
      // Địa chỉ đầy đủ
      Joi.object({
        receiverName: Joi.string().required().messages({
          'string.base': 'Tên người nhận phải là chuỗi',
          'any.required': 'Tên người nhận không được để trống'
        }),
        receiverPhone: Joi.string().required().messages({
          'string.base': 'Số điện thoại người nhận phải là chuỗi',
          'any.required': 'Số điện thoại người nhận không được để trống'
        }),
        province: Joi.string().required().messages({
          'string.base': 'Tỉnh/Thành phố phải là chuỗi',
          'any.required': 'Tỉnh/Thành phố không được để trống'
        }),
        district: Joi.string().required().messages({
          'string.base': 'Huyện/Quận phải là chuỗi',
          'any.required': 'Huyện/Quận không được để trống'
        }),
        ward: Joi.string().required().messages({
          'string.base': 'Xã/Phường phải là chuỗi',
          'any.required': 'Xã/Phường không được để trống'
        }),
        address: Joi.string().required().messages({
          'string.base': 'Địa chỉ nhà phải là chuỗi',
          'any.required': 'Địa chỉ nhà không được để trống'
        })
      }),
      // Object rỗng hoặc null
      Joi.object().length(0),
      Joi.allow(null)
    )
      .label('addressFree')
      .messages({
        'object.base': 'addressFree phải là một object'
      }),
    totalPrice: Joi.number().required().min(0).messages({
      'number.base': 'totalPrice phải là số',
      'number.min': 'Tổng tiền phải lớn hơn hoặc bằng 0',
      'any.required': 'totalPrice là trường bắt buộc'
    }),
    shippingPrice: Joi.number().required().min(0).messages({
      'number.base': 'shippingPrice phải là số',
      'number.min': 'Phí vận chuyển phải lớn hơn hoặc bằng 0',
      'any.required': 'shippingPrice là trường bắt buộc'
    }),
    discountId: Joi.string().trim().length(24).hex().optional().label('discountId').messages({
      'string.base': 'discountId phải là chuỗi',
      'string.length': 'discountId phải có độ dài 24 ký tự',
      'string.hex': 'discountId phải là chuỗi hex hợp lệ',
      'any.required': 'discountId là trường bắt buộc'
    }),
    status: Joi.string()
      .valid('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded')
      .required()
      .default('pending')
      .label('status')
      .messages({
        'string.base': 'status phải là chuỗi',
        'any.only': 'status phải là một trong các giá trị: pending, confirmed, processing, shipped, delivered, completed, cancelled, refunded',
        'any.required': 'status là trường bắt buộc'
      }),
    shippingMethod: Joi.string().valid('standard', 'express').default('standard').label('shippingMethod').messages({
      'string.base': 'shippingMethod phải là chuỗi',
      'any.only': 'shippingMethod phải là một trong các giá trị: standard, express',
      'any.required': 'shippingMethod là trường bắt buộc'
    }),
    paymentMethod: Joi.string().valid('cash', 'vnpay', 'momo').default('cash').label('paymentMethod').messages({
      'string.base': 'paymentMethod phải là chuỗi',
      'any.only': 'paymentMethod phải là một trong các giá trị: cash, vnpay, momo',
      'any.required': 'paymentMethod là trường bắt buộc'
    }),
    paymentStatus: Joi.string()
      .valid('unpaid', 'pending', 'paid', 'failed')
      .default('pending')
      .label('paymentStatus')
      .messages({
        'string.base': 'paymentStatus phải là chuỗi',
        'any.only': 'paymentStatus phải là một trong các giá trị: unpaid, pending, paid, failed',
        'any.required': 'paymentStatus là trường bắt buộc'
      }),
    note: Joi.string().trim().max(500).label('note').messages({
      'string.base': 'note phải là chuỗi',
      'string.max': 'note không được vượt quá 500 ký tự',
      'any.required': 'note là trường bắt buộc'
    }),
    items: Joi.array()
      .items(
        Joi.object({
          productId: Joi.string().trim().length(24).hex().required().label('productId').messages({
            'string.base': 'productId phải là chuỗi',
            'string.length': 'productId phải có độ dài 24 ký tự',
            'string.hex': 'productId phải là chuỗi hex hợp lệ',
            'any.required': 'productId là trường bắt buộc'
          }),
          variantId: Joi.string().trim().length(24).hex().label('variantId').messages({
            'string.base': 'variantId phải là chuỗi',
            'string.length': 'variantId phải có độ dài 24 ký tự',
            'string.hex': 'variantId phải là chuỗi hex hợp lệ'
          }),
          quantity: Joi.number().required().min(1).messages({
            'number.base': 'quantity phải là số',
            'number.min': 'Số lượng phải lớn hơn 0',
            'any.required': 'quantity là trường bắt buộc'
          }),
          price: Joi.number().required().min(0).messages({
            'number.base': 'price phải là số',
            'number.min': 'Giá phải lớn hơn hoặc bằng 0',
            'any.required': 'price là trường bắt buộc'
          })
        })
      )
      .min(1)
      .required()
      .label('items')
      .messages({
        'array.base': 'items phải là mảng',
        'array.min': 'items không được để trống',
        'any.required': 'items là trường bắt buộc'
      })
  })

  try {
    await createOrderValidationSchema.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const fetchAllOrdersValidation = async (req: Request, res: Response, next: NextFunction) => {
  const fetchAllOrdersValidationSchema = Joi.object({
    userId: Joi.string().trim().length(24).hex().required().label('userId').messages({
      'string.base': 'userId phải là chuỗi',
      'string.length': 'userId phải có độ dài 24 ký tự',
      'string.hex': 'userId phải là chuỗi hex hợp lệ',
      'any.required': 'userId là trường bắt buộc'
    })
  })
  try {
    await fetchAllOrdersValidationSchema.validateAsync(req.params, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const fetchOrderInfoValidation = async (req: Request, res: Response, next: NextFunction) => {
  const fetchOrderInfoValidationSchema = Joi.object({
    orderId: Joi.string().trim().length(24).hex().required().label('orderId').messages({
      'string.base': 'orderId phải là chuỗi',
      'string.length': 'orderId phải có độ dài 24 ký tự',
      'string.hex': 'orderId phải là chuỗi hex hợp lệ',
      'any.required': 'orderId là trường bắt buộc'
    })
  })
  try {
    await fetchOrderInfoValidationSchema.validateAsync(req.params, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const updateStatusOrderValidation = async (req: Request, res: Response, next: NextFunction) => {
  const updateStatusOrderValidationSchema = Joi.object({
    orderId: Joi.string().trim().length(24).hex().required().label('orderId').messages({
      'string.base': 'orderId phải là chuỗi',
      'string.length': 'orderId phải có độ dài 24 ký tự',
      'string.hex': 'orderId phải là chuỗi hex hợp lệ',
      'any.required': 'orderId là trường bắt buộc'
    }),
    status: Joi.string()
      .valid(
        'pending',
        'confirmed',
        'processing',
        'shipped',
        'delivered',
        'completed',
        'cancelled',
        'refunded'
      )
      .required()
      .label('status')
      .messages({
        'string.base': 'status phải là chuỗi',
        'any.only': 'status phải là một trong các giá trị: pending, confirmed, processing, shipped, delivered, completed, cancelled, refunded',
        'any.required': 'status là trường bắt buộc'
      }),
    reason: Joi.when('status', {
      is: Joi.valid('cancelled', 'refunded'),
      then: Joi.string().trim().min(3).max(300).required().label('reason').messages({
        'string.base': 'Lý do phải là chuỗi',
        'string.min': 'Lý do phải ít nhất 3 ký tự',
        'string.max': 'Lý do không vượt quá 300 ký tự',
        'any.required': 'Lý do là bắt buộc khi hủy hoặc hoàn tiền'
      }),
      otherwise: Joi.forbidden()
    })
  })

  try {
    const { orderId } = req.params
    const { status, reason } = req.body
    await updateStatusOrderValidationSchema.validateAsync({ orderId, status, reason }, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const fetchItemOfOrderValidation = async (req: Request, res: Response, next: NextFunction) => {
  const fetchItemOfOrderValidationSchema = Joi.object({
    orderId: Joi.string().trim().length(24).hex().required().label('orderId').messages({
      'string.base': 'orderId phải là chuỗi',
      'string.length': 'orderId phải có độ dài 24 ký tự',
      'string.hex': 'orderId phải là chuỗi hex hợp lệ',
      'any.required': 'orderId là trường bắt buộc'
    })
  })
  try {
    await fetchItemOfOrderValidationSchema.validateAsync(req.params, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const cancelOrderValidation = async (req: Request, res: Response, next: NextFunction) => {
  const cancelOrderValidationSchema = Joi.object({
    orderId: Joi.string().trim().length(24).hex().required().label('orderId').messages({
      'string.base': 'orderId phải là chuỗi',
      'string.length': 'orderId phải có độ dài 24 ký tự',
      'string.hex': 'orderId phải là chuỗi hex hợp lệ',
      'any.required': 'orderId là trường bắt buộc'
    })
  })
  try {
    await cancelOrderValidationSchema.validateAsync(req.params, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

export const orderValidation = {
  createOrderValidation,
  fetchOrderInfoValidation,
  fetchAllOrdersValidation,
  updateStatusOrderValidation,
  fetchItemOfOrderValidation,
  cancelOrderValidation
}
