import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { notificationService } from '~/services/notification.service'
import ApiError from '~/utils/ApiError'
import sendApiResponse from '~/utils/response.message'

const createNotification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await notificationService.handleCreateNotification(req.body)
    if (!result) {
      sendApiResponse(res, StatusCodes.BAD_REQUEST, {
        statusCode: StatusCodes.BAD_REQUEST,
        message: 'Có lỗi xảy ra trong quá trình tạo thông báo',
        error: {
          code: StatusCodes.BAD_REQUEST,
          details: 'Có lỗi xảy ra trong quá trình tạo thông báo'
        }
      })
    } else {
      sendApiResponse(res, StatusCodes.CREATED, {
        statusCode: StatusCodes.CREATED,
        message: 'Tạo thông báo thành công',
        data: result
      })
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình thực hiện'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const fetchAllNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { current = '1', pageSize = '10', ...restQuery } = req.query
    const parsedCurrentPage = parseInt(current as string, 10)
    const parsedLimit = parseInt(pageSize as string, 10)
    const queryString = new URLSearchParams(restQuery as Record<string, string>).toString()

    const result = await notificationService.handleFetchAllNotifications({
      currentPage: parsedCurrentPage,
      limit: parsedLimit,
      qs: queryString
    })
    if (!result) {
      sendApiResponse(res, StatusCodes.BAD_REQUEST, {
        statusCode: StatusCodes.BAD_REQUEST,
        message: 'Có lỗi xảy ra trong quá trình lấy danh sách thông báo',
        error: {
          code: StatusCodes.BAD_REQUEST,
          details: 'Có lỗi xảy ra trong quá trình lấy danh sách thông báo'
        }
      })
    } else {
      sendApiResponse(res, StatusCodes.OK, {
        statusCode: StatusCodes.OK,
        message: 'Lấy danh sách thông báo thành công',
        data: result
      })
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình thực hiện'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const fetchNotificationById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { notificationId } = req.params
    const result = await notificationService.handleFetchNotificationById(notificationId)
    if (!result) {
      sendApiResponse(res, StatusCodes.BAD_REQUEST, {
        statusCode: StatusCodes.BAD_REQUEST,
        message: 'Không tìm thấy thông báo',
        error: {
          code: StatusCodes.BAD_REQUEST,
          details: 'Không tìm thấy thông báo'
        }
      })
    } else {
      sendApiResponse(res, StatusCodes.OK, {
        statusCode: StatusCodes.OK,
        message: 'Lấy thông báo thành công',
        data: result
      })
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình thực hiện'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const deleteNotification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { notificationId } = req.params
    const result = await notificationService.handleDeleteNotification(notificationId)
    if (!result) {
      sendApiResponse(res, StatusCodes.BAD_REQUEST, {
        statusCode: StatusCodes.BAD_REQUEST,
        message: 'Có lỗi xảy ra trong quá trình xóa thông báo',
        error: {
          code: StatusCodes.BAD_REQUEST,
          details: 'Có lỗi xảy ra trong quá trình xóa thông báo'
        }
      })
    } else {
      sendApiResponse(res, StatusCodes.OK, {
        statusCode: StatusCodes.OK,
        message: 'Xóa thông báo thành công',
        data: result
      })
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình thực hiện'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}
const updateNotification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { notificationId } = req.params
    const updateData = req.body

    const result = await notificationService.handleUpdateNotification(notificationId, updateData)

    if (!result) {
      sendApiResponse(res, StatusCodes.NOT_FOUND, {
        statusCode: StatusCodes.NOT_FOUND,
        message: 'Không tìm thấy thông báo để cập nhật',
        error: {
          code: StatusCodes.NOT_FOUND,
          details: 'ID thông báo không tồn tại hoặc không hợp lệ'
        }
      })
    } else {
      sendApiResponse(res, StatusCodes.OK, {
        statusCode: StatusCodes.OK,
        message: 'Cập nhật thông báo thành công',
        data: result
      })
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình cập nhật'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}


export const notificationController = {
  createNotification,
  fetchAllNotifications,
  fetchNotificationById,
  deleteNotification,
  updateNotification
}
