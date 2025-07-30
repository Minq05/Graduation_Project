import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import Joi from 'joi'
import ApiError from '~/utils/ApiError'

const createNotificationValidation = async (req: Request, res: Response, next: NextFunction) => {
  const notificationValidationSchema = Joi.object({
    userId: Joi.string()
      .required()
      .trim()
      .custom((value, helpers) => {
        if (value === 'all') {
          return value
        }
        if (!/^[0-9a-fA-F]{24}$/.test(value)) {
          return helpers.error('any.invalid')
        }
        return value
      })
      .message('userId phải là "all" hoặc một MongoDB ObjectId hợp lệ'),
    title: Joi.string().required().min(1).max(255).trim(),
    content: Joi.string().required().trim(),
    isRead: Joi.boolean().optional(),
    // createdAt: Joi.date().optional(),
    // updatedAt: Joi.date().optional(),
    // deletedAt: Joi.date().optional(),
    // deleted: Joi.boolean().optional()
  })

  try {
    await notificationValidationSchema.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const fetchAllNotificationsValidation = async (req: Request, res: Response, next: NextFunction) => {
  const fetchAllNotificationsValidationSchema = Joi.object({
    current: Joi.number().optional().default(1).min(1),
    pageSize: Joi.number().optional().default(10).min(1).max(100),
    qs: Joi.string().optional()
  })
  try {
    await fetchAllNotificationsValidationSchema.validateAsync(req.query, { abortEarly: false, allowUnknown: true })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const fetchNotificationByIdValidation = async (req: Request, res: Response, next: NextFunction) => {
  const fetchNotificationByIdValidationSchema = Joi.object({
    notificationId: Joi.string()
      .required()
      .trim()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .message('notificationId phải là một MongoDB ObjectId hợp lệ')
  })
  try {
    await fetchNotificationByIdValidationSchema.validateAsync(req.params, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const deleteNotificationValidation = async (req: Request, res: Response, next: NextFunction) => {
  const deleteNotificationValidationSchema = Joi.object({
    notificationId: Joi.string()
      .required()
      .trim()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .message('notificationId phải là một MongoDB ObjectId hợp lệ')
  })
  try {
    await deleteNotificationValidationSchema.validateAsync(req.params, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

export const notificationValidation = {
  createNotificationValidation,
  fetchAllNotificationsValidation,
  fetchNotificationByIdValidation,
  deleteNotificationValidation
}
