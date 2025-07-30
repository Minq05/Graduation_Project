import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import Joi from 'joi'
import ApiError from '~/utils/ApiError'

const createReviewValidation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const reviewValidationSchema = Joi.object({
    userId: Joi.string()
      .required()
      .trim()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .message('ID người dùng phải là ObjectId hợp lệ'),
    productId: Joi.string()
      .required()
      .trim()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .message('ID sản phẩm phải là ObjectId hợp lệ'),
    orderId: Joi.string()
      .optional()
      .trim()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .message('ID đơn hàng phải là ObjectId hợp lệ'),
    rating: Joi.number()
      .required()
      .min(1)
      .max(5)
      .message('Đánh giá phải từ 1 đến 5 sao'),
    comment: Joi.string()
      .required()
      .trim()
      .min(5)
      .max(1000)
      .message('Nội dung đánh giá phải từ 5 đến 1000 ký tự'),
    images: Joi.array()
      .items(Joi.string().uri())
      .optional()
      .max(5)
      .message('Tối đa 5 hình ảnh')
  })

  try {
    await reviewValidationSchema.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Lỗi khi xác thực đánh giá'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const updateReviewStatusValidation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const reviewStatusSchema = Joi.object({
    reason: Joi.string().required().trim().min(5).max(200).message('Lý do từ chối là bắt buộc và phải từ 5-200 ký tự')
  })

  try {
    await reviewStatusSchema.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Lỗi khi xác thực trạng thái đánh giá'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const deleteReviewValidation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const deleteReviewSchema = Joi.object({
    reason: Joi.string().required().trim().min(10).max(500).message('Lý do xóa đánh giá là bắt buộc và phải từ 10-500 ký tự')
  })

  try {
    await deleteReviewSchema.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Lỗi khi xác thực lý do xóa đánh giá'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

export const reviewValidation = {
  createReviewValidation,
  updateReviewStatusValidation,
  deleteReviewValidation
}