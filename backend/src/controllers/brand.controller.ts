import { NextFunction } from 'express'
import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { brandService } from '~/services/brand.service'
import ApiError from '~/utils/ApiError'
import sendApiResponse from '~/utils/response.message'

const createBrand = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await brandService.handleCreateBrand(req.body)

    if (!result) {
      return sendApiResponse(res, StatusCodes.BAD_REQUEST, {
        statusCode: StatusCodes.BAD_REQUEST,
        message: 'Có lỗi xảy ra trong quá trình tạo brand'
      })
    }

    return sendApiResponse(res, StatusCodes.CREATED, {
      statusCode: StatusCodes.CREATED,
      message: 'Tạo brand thành công',
      data: result
    })
  } catch (error: any) {
    console.log('Lỗi bắt được trong controller:', error)
    if (error instanceof ApiError) {
      return next(error)
    }
    return next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error.message || 'Internal error'))
  }
}
const fetchAllBrand = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { current, pageSize, qs } = req.query
    const parsedCurrentPage = typeof current === 'string' ? parseInt(current, 10) : 1
    const parsedLimit = typeof pageSize === 'string' ? parseInt(pageSize, 10) : 10
    const parsedQs =
      typeof qs === 'string'
        ? qs
        : Array.isArray(qs)
          ? qs.join(',')
          : typeof qs === 'object' && qs !== null
            ? JSON.stringify(qs)
            : ''

    const result = await brandService.handleFetchAllBrand({
      currentPage: parsedCurrentPage,
      limit: parsedLimit,
      qs: parsedQs
    })

    if (!result) {
      sendApiResponse(res, StatusCodes.BAD_REQUEST, {
        statusCode: StatusCodes.BAD_REQUEST,
        message: 'Có lỗi xảy ra trong quá trình lấy danh sách brand',
        error: {
          code: StatusCodes.BAD_REQUEST,
          details: 'Có lỗi xảy ra trong quá trình lấy danh sách brand'
        }
      })
    } else {
      sendApiResponse(res, StatusCodes.OK, {
        statusCode: StatusCodes.OK,
        message: 'Lấy danh sách brand thành công',
        data: result
      })
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình thực hiện'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}
const fetchBrandById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { brandID } = req.params
    const result = await brandService.handleFetchBrandById(brandID)
    if (!result) {
      sendApiResponse(res, StatusCodes.BAD_REQUEST, {
        statusCode: StatusCodes.BAD_REQUEST,
        message: 'Không tìm thấy brand',
        error: {
          code: StatusCodes.BAD_REQUEST,
          details: 'Không tìm thấy brand'
        }
      })
    } else {
      sendApiResponse(res, StatusCodes.OK, {
        statusCode: StatusCodes.OK,
        message: 'Lấy brand thành công',
        data: result
      })
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình thực hiện'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}
const updateBrand = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { brandID } = req.params
    const result = await brandService.handleUpdateBrand(brandID, req.body)
    if (!result) {
      sendApiResponse(res, StatusCodes.BAD_REQUEST, {
        statusCode: StatusCodes.BAD_REQUEST,
        message: 'Có lỗi xảy ra trong quá trình cập nhật Brand',
        error: {
          code: StatusCodes.BAD_REQUEST,
          details: 'Có lỗi xảy ra trong quá trình cập nhật Brand'
        }
      })
    } else {
      sendApiResponse(res, StatusCodes.OK, {
        statusCode: StatusCodes.OK,
        message: 'Cập nhật Brand thành công',
        data: result
      })
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình thực hiện'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const deleteBrand = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { brandID } = req.params
    const result = await brandService.handleDeleteBrand(brandID)
    if (!result) {
      sendApiResponse(res, StatusCodes.BAD_REQUEST, {
        statusCode: StatusCodes.BAD_REQUEST,
        message: 'Có lỗi xảy ra trong quá trình xóa brand',
        error: {
          code: StatusCodes.BAD_REQUEST,
          details: 'Có lỗi xảy ra trong quá trình xóa brand'
        }
      })
    } else {
      sendApiResponse(res, StatusCodes.OK, {
        statusCode: StatusCodes.OK,
        message: 'Xóa brand thành công',
        data: result
      })
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình thực hiện'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const getAllBrands = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await brandService.handleGetAllBrands()
    sendApiResponse(res, StatusCodes.OK, {
      statusCode: StatusCodes.OK,
      message: 'Lấy tất cả brand thành công',
      data: result
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình thực hiện'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

export const brandController = {
  createBrand,
  fetchAllBrand,
  fetchBrandById,
  updateBrand,
  deleteBrand,
  getAllBrands
}
