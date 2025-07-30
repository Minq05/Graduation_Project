import Joi from 'joi'

/**
 * Validation schema for shipping fee calculation
 */
export const shippingFeeSchema = Joi.object({
  // Required fields
  to_district_id: Joi.number().required().messages({
    'any.required': 'Mã quận/huyện nhận hàng là bắt buộc',
    'number.base': 'Mã quận/huyện phải là số'
  }),
  to_ward_code: Joi.string().required().messages({
    'any.required': 'Mã phường/xã nhận hàng là bắt buộc',
    'string.base': 'Mã phường/xã phải là chuỗi'
  }),

  // Optional fields
  from_district_id: Joi.number().messages({
    'number.base': 'Mã quận/huyện gửi hàng phải là số'
  }),
  weight: Joi.number().min(1).max(30000).messages({
    'number.base': 'Cân nặng phải là số',
    'number.min': 'Cân nặng tối thiểu là 1g',
    'number.max': 'Cân nặng tối đa là 30kg (30000g)'
  }),
  length: Joi.number().min(1).max(200).messages({
    'number.base': 'Chiều dài phải là số',
    'number.min': 'Chiều dài tối thiểu là 1cm',
    'number.max': 'Chiều dài tối đa là 200cm'
  }),
  width: Joi.number().min(1).max(200).messages({
    'number.base': 'Chiều rộng phải là số',
    'number.min': 'Chiều rộng tối thiểu là 1cm',
    'number.max': 'Chiều rộng tối đa là 200cm'
  }),
  height: Joi.number().min(1).max(200).messages({
    'number.base': 'Chiều cao phải là số',
    'number.min': 'Chiều cao tối thiểu là 1cm',
    'number.max': 'Chiều cao tối đa là 200cm'
  }),
  insurance_value: Joi.number().min(0).messages({
    'number.base': 'Giá trị bảo hiểm phải là số',
    'number.min': 'Giá trị bảo hiểm không được âm'
  }),
  service_id: Joi.number().messages({
    'number.base': 'Mã dịch vụ phải là số'
  }),
  products: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().required(),
        quantity: Joi.number().integer().min(1).required()
      })
    )
    .messages({
      'array.base': 'Danh sách sản phẩm phải là mảng'
    })
})

/**
 * Validation schema for available services query
 */
export const availableServicesSchema = Joi.object({
  fromDistrictId: Joi.number().messages({
    'number.base': 'Mã quận/huyện gửi hàng phải là số'
  }),
  toDistrictId: Joi.number().required().messages({
    'any.required': 'Mã quận/huyện nhận hàng là bắt buộc',
    'number.base': 'Mã quận/huyện phải là số'
  })
})
