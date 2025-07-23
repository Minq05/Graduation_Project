import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { attributeService } from '~/services/attribute.service'
import ApiError from '~/utils/ApiError'
import sendApiResponse from '~/utils/response.message'

const createAttribute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await attributeService.handleCreateAttribute(req.body)
    if (!result) {
      sendApiResponse(res, StatusCodes.BAD_REQUEST, {
        statusCode: StatusCodes.BAD_REQUEST,
        message: 'Có lỗi xảy ra trong quá trình tạo thuộc tính!'
      })
    } else {
      sendApiResponse(res, StatusCodes.CREATED, {
        statusCode: StatusCodes.CREATED,
        message: 'Tạo thuộc tính thành công!',
        data: result
      })
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình thực hiện!'
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage))
  }
}

const fetchAllAttributes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { current, pageSize, qs } = req.query
    const parsedCurrentPage = typeof current === 'string' ? parseInt(current, 10) : 1
    const parsedLimit = typeof pageSize === 'string' ? parseInt(pageSize, 10) : 10
    const parsedQs = typeof qs === 'string' ? qs : Array.isArray(qs) ? qs.join(',') : ''

    const result = await attributeService.handleFetchAllAttributes({
      currentPage: parsedCurrentPage,
      limit: parsedLimit,
      qs: parsedQs
    })

    if (!result) {
      sendApiResponse(res, StatusCodes.BAD_REQUEST, {
        statusCode: StatusCodes.BAD_REQUEST,
        message: 'Có lỗi xảy ra trong quá trình lấy danh sách thuộc tính!'
      })
    } else {
      sendApiResponse(res, StatusCodes.OK, {
        statusCode: StatusCodes.OK,
        message: 'Lấy danh sách thuộc tính thành công!',
        data: result
      })
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình thực hiện!'
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage))
  }
}

const fetchInfoAttribute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { attributeId } = req.params
    const result = await attributeService.handleFetchInfoAttribute(attributeId)

    if (!result) {
      sendApiResponse(res, StatusCodes.BAD_REQUEST, {
        statusCode: StatusCodes.BAD_REQUEST,
        message: 'Không tìm thấy thông tin thuộc tính!'
      })
    } else {
      sendApiResponse(res, StatusCodes.OK, {
        statusCode: StatusCodes.OK,
        message: 'Lấy thông tin thuộc tính thành công!',
        data: result
      })
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình thực hiện!'
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage))
  }
}

const updateAttribute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { attributeId } = req.params
    const result = await attributeService.handleUpdateAttribute(attributeId, req.body)

    if (!result) {
      sendApiResponse(res, StatusCodes.BAD_REQUEST, {
        statusCode: StatusCodes.BAD_REQUEST,
        message: 'Cập nhật thuộc tính thất bại!'
      })
    } else {
      sendApiResponse(res, StatusCodes.OK, {
        statusCode: StatusCodes.OK,
        message: 'Cập nhật thuộc tính thành công!',
        data: result
      })
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình thực hiện!'
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage))
  }
}

const deleteAttribute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { attributeId } = req.params
    const result = await attributeService.handleDeleteAttribute(attributeId)

    if (!result) {
      sendApiResponse(res, StatusCodes.BAD_REQUEST, {
        statusCode: StatusCodes.BAD_REQUEST,
        message: 'Xóa thuộc tính thất bại!'
      })
    } else {
      sendApiResponse(res, StatusCodes.OK, {
        statusCode: StatusCodes.OK,
        message: 'Xóa thuộc tính thành công!',
        data: result
      })
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình thực hiện!'
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage))
  }
}

export const attributeController = {
  createAttribute,
  fetchAllAttributes,
  fetchInfoAttribute,
  updateAttribute,
  deleteAttribute
}
