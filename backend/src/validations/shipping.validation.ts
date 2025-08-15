import Joi from 'joi'

const calculateShippingFee = Joi.object({
  fromAddress: Joi.string().required().min(10).max(200).messages({
    'string.empty': 'Địa chỉ gửi không được để trống!',
    'string.min': 'Địa chỉ gửi phải có ít nhất 10 ký tự!',
    'string.max': 'Địa chỉ gửi không được vượt quá 200 ký tự!',
    'any.required': 'Địa chỉ gửi là bắt buộc!'
  }),
  toAddress: Joi.string().required().min(10).max(200).messages({
    'string.empty': 'Địa chỉ nhận không được để trống!',
    'string.min': 'Địa chỉ nhận phải có ít nhất 10 ký tự!',
    'string.max': 'Địa chỉ nhận không được vượt quá 200 ký tự!',
    'any.required': 'Địa chỉ nhận là bắt buộc!'
  }),
  weight: Joi.number().required().min(0.1).max(50).messages({
    'number.base': 'Trọng lượng phải là số!',
    'number.min': 'Trọng lượng phải lớn hơn 0.1kg!',
    'number.max': 'Trọng lượng không được vượt quá 50kg!',
    'any.required': 'Trọng lượng là bắt buộc!'
  }),
  shippingMethod: Joi.string().required().valid('standard', 'express', 'same_day').messages({
    'string.empty': 'Phương thức vận chuyển không được để trống!',
    'any.only': 'Phương thức vận chuyển không hợp lệ!',
    'any.required': 'Phương thức vận chuyển là bắt buộc!'
  })
})

export const shippingValidation = {
  calculateShippingFee
}