import { Request, Response, NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'
import { discountService } from '~/services/discounts.service'
import ApiError from '~/utils/ApiError'
import sendApiResponse from '~/utils/response.message'

const createDiscounts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await discountService.handleCreateDiscounts(req.body)
    if (!result) {
      sendApiResponse(res, StatusCodes.BAD_REQUEST, {
        statusCode: StatusCodes.BAD_REQUEST,
        message: 'Có lỗi xảy ra trong quá trình tạo mã giảm giá',
        error: {
          code: StatusCodes.BAD_REQUEST,
          details: 'Có lỗi xảy ra trong quá trình tạo mã giảm giá'
        }
      })
    } else {
      sendApiResponse(res, StatusCodes.CREATED, {
        statusCode: StatusCodes.CREATED,
        message: 'Tạo mã giảm giá thành công',
        data: result
      })
    }
  } catch (error) {
    const err = error as ErrorWithStatus
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình thực hiện'
    const statusCode = err.statusCode ?? StatusCodes.UNPROCESSABLE_ENTITY
    const customError = new ApiError(statusCode, errorMessage)
    next(customError)
  }
}

const fetchAllDiscounts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { current, pageSize, qs } = req.query
    const currentPage = typeof current === 'string' ? parseInt(current, 10) : 1
    const limit = typeof pageSize === 'string' ? parseInt(pageSize, 10) : 10
    const queryString =
      typeof qs === 'string'
        ? qs
        : Array.isArray(qs)
          ? qs.join(',')
          : typeof qs === 'object' && qs !== null
            ? JSON.stringify(qs)
            : ''

    const result = await discountService.handleFetchAllDiscounts({
      currentPage,
      limit,
      qs: queryString
    })

    if (!result) {
      sendApiResponse(res, StatusCodes.BAD_REQUEST, {
        statusCode: StatusCodes.BAD_REQUEST,
        message: 'Có lỗi xảy ra trong quá trình lấy danh sách mã giảm giá',
        error: {
          code: StatusCodes.BAD_REQUEST,
          details: 'Có lỗi xảy ra trong quá trình lấy danh sách mã giảm giá'
        }
      })
    } else {
      sendApiResponse(res, StatusCodes.OK, {
        statusCode: StatusCodes.OK,
        message: 'Lấy danh sách mã giảm giá thành công',
        data: result
      })
    }
  } catch (error) {
    const err = error as ErrorWithStatus
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình thực hiện'
    const statusCode = err.statusCode ?? StatusCodes.UNPROCESSABLE_ENTITY
    const customError = new ApiError(statusCode, errorMessage)
    next(customError)
  }
}

const fetchDiscountsById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { discountsID } = req.params
    const result = await discountService.handleFetchDiscountsById(discountsID)
    if (!result) {
      sendApiResponse(res, StatusCodes.NOT_FOUND, {
        statusCode: StatusCodes.NOT_FOUND,
        message: 'Không tìm thấy mã giảm giá',
        error: {
          code: StatusCodes.NOT_FOUND,
          details: 'Không tìm thấy mã giảm giá'
        }
      })
    } else {
      sendApiResponse(res, StatusCodes.OK, {
        statusCode: StatusCodes.OK,
        message: 'Lấy mã giảm giá thành công',
        data: result
      })
    }
  } catch (error) {
    const err = error as ErrorWithStatus
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình thực hiện'
    const statusCode = err.statusCode ?? StatusCodes.UNPROCESSABLE_ENTITY
    const customError = new ApiError(statusCode, errorMessage)
    next(customError)
  }
}

const updateDiscounts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { discountsID } = req.params
    const result = await discountService.handleUpdateDiscounts(discountsID, req.body)
    if (!result) {
      sendApiResponse(res, StatusCodes.NOT_FOUND, {
        statusCode: StatusCodes.NOT_FOUND,
        message: 'Không tìm thấy mã giảm giá để cập nhật',
        error: {
          code: StatusCodes.NOT_FOUND,
          details: 'Không tìm thấy mã giảm giá để cập nhật'
        }
      })
    } else {
      sendApiResponse(res, StatusCodes.OK, {
        statusCode: StatusCodes.OK,
        message: 'Cập nhật mã giảm giá thành công',
        data: result
      })
    }
  } catch (error) {
    const err = error as ErrorWithStatus
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình thực hiện'
    const statusCode = err.statusCode ?? StatusCodes.UNPROCESSABLE_ENTITY
    const customError = new ApiError(statusCode, errorMessage)
    next(customError)
  }
}

const deleteDiscounts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { discountsID } = req.params
    const result = await discountService.handleDeleteDiscounts(discountsID)
    if (!result) {
      sendApiResponse(res, StatusCodes.NOT_FOUND, {
        statusCode: StatusCodes.NOT_FOUND,
        message: 'Không tìm thấy mã giảm giá để xoá',
        error: {
          code: StatusCodes.NOT_FOUND,
          details: 'Không tìm thấy mã giảm giá để xoá'
        }
      })
    } else {
      sendApiResponse(res, StatusCodes.OK, {
        statusCode: StatusCodes.OK,
        message: 'Xoá mã giảm giá thành công',
        data: result
      })
    }
  } catch (error) {
    const err = error as ErrorWithStatus
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình thực hiện'
    const statusCode = err.statusCode ?? StatusCodes.UNPROCESSABLE_ENTITY
    const customError = new ApiError(statusCode, errorMessage)
    next(customError)
  }
}

const applyDiscount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, orderValue } = req.body
    const result = await discountService.handleApplyDiscount(code, orderValue)
    sendApiResponse(res, StatusCodes.OK, {
      statusCode: StatusCodes.OK,
      message: 'Áp dụng mã giảm giá thành công',
      data: result
    })
  } catch (error) {
    const err = error as ErrorWithStatus
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình thực hiện'
    const statusCode = err.statusCode ?? StatusCodes.UNPROCESSABLE_ENTITY
    const customError = new ApiError(statusCode, errorMessage)
    next(customError)
  }
}

export const discountsController = {
  createDiscounts,
  fetchAllDiscounts,
  fetchDiscountsById,
  updateDiscounts,
  deleteDiscounts,
  applyDiscount
}
