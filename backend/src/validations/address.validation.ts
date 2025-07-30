import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import Joi from 'joi'
import ApiError from '~/utils/ApiError'

const metaDataRefSchema = Joi.object({
  _id: Joi.string()
    .required()
    .trim()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .message('ID phải là ObjectId hợp lệ'),
  email: Joi.string().required().email().trim().message('Email không hợp lệ')
})

const createAddressValidation = async (req: Request, res: Response, next: NextFunction) => {
  const addressValidationSchema = Joi.object({
    userId: Joi.string()
      .required()
      .trim()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .message('ID người dùng phải là ObjectId hợp lệ'),
    province: Joi.string().optional().min(2).max(100).trim(),
    district: Joi.string().optional().min(2).max(100).trim(),
    ward: Joi.string().optional().min(2).max(100).trim(),
    address: Joi.string().optional().min(5).max(255).trim(),
    isPrimary: Joi.boolean().optional(),
    createdBy: metaDataRefSchema.optional(),
    updatedBy: metaDataRefSchema.optional(),
    deletedBy: metaDataRefSchema.optional()
  })

  try {
    const { userId } = req.params
    const dataValidate = {
      ...req.body,
      userId: userId.trim()
    }
    await addressValidationSchema.validateAsync(dataValidate, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const updateAddressValidation = async (req: Request, res: Response, next: NextFunction) => {
  const addressValidationSchema = Joi.object({
    userId: Joi.string()
      .required()
      .trim()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .message('ID người dùng phải là ObjectId hợp lệ'),
    province: Joi.string().optional().min(2).max(100).trim(),
    district: Joi.string().optional().min(2).max(100).trim(),
    ward: Joi.string().optional().min(2).max(100).trim(),
    address: Joi.string().optional().min(5).max(255).trim(),
    isPrimary: Joi.boolean().optional()
  })

  try {
    const { userId } = req.params
    const dataValidate = {
      ...req.body,
      userId: userId.trim()
    }
    await addressValidationSchema.validateAsync(dataValidate, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

export const addressValidation = {
  createAddressValidation,
  updateAddressValidation
}
