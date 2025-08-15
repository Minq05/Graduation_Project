import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { flashSaleService } from '~/services/flash_sale.service'
import ApiError from '~/utils/ApiError'
import sendApiResponse from '~/utils/response.message'

const createFlashSale = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await flashSaleService.handleCreateFlashSale(req.body)
    if (!result) {
      sendApiResponse(res, StatusCodes.BAD_REQUEST, {
        statusCode: StatusCodes.BAD_REQUEST,
        message: 'Có lỗi xảy ra trong quá trình tạo flash sale!',
        error: {
          code: StatusCodes.BAD_REQUEST,
          details: 'Có lỗi xảy ra trong quá trình tạo flash sale!'
        }
      })
    } else {
      sendApiResponse(res, StatusCodes.CREATED, {
        statusCode: StatusCodes.CREATED,
        message: 'Tạo flash sale thành công!',
        data: result
      })
    }
  } catch (error) {
    const err = error as Error & { statusCode?: number }
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình thực hiện'
    const statusCode = err.statusCode ?? StatusCodes.UNPROCESSABLE_ENTITY
    const customError = new ApiError(statusCode, errorMessage)
    next(customError)
  }
}

const fetchAllFlashSales = async (req: Request, res: Response, next: NextFunction) => {
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
    const result = await flashSaleService.handleFetchAllFlashSales({
      currentPage: parsedCurrentPage,
      limit: parsedLimit,
      qs: parsedQs
    })
    if (!result) {
      sendApiResponse(res, StatusCodes.BAD_REQUEST, {
        statusCode: StatusCodes.BAD_REQUEST,
        message: 'Có lỗi xảy ra trong quá trình lấy danh sách flash sale!',
        error: {
          code: StatusCodes.BAD_REQUEST,
          details: 'Có lỗi xảy ra trong quá trình lấy danh sách flash sale!'
        }
      })
    } else {
      sendApiResponse(res, StatusCodes.OK, {
        statusCode: StatusCodes.OK,
        message: 'Lấy danh sách flash sale thành công!',
        data: result
      })
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình thực hiện!'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const fetchInfoFlashSale = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { flashSaleId } = req.params
    const result = await flashSaleService.handleFetchInfoFlashSale(flashSaleId)
    if (!result) {
      sendApiResponse(res, StatusCodes.BAD_REQUEST, {
        statusCode: StatusCodes.BAD_REQUEST,
        message: 'Có lỗi xảy ra trong quá trình lấy thông tin flash sale!',
        error: {
          code: StatusCodes.BAD_REQUEST,
          details: 'Có lỗi xảy ra trong quá trình lấy thông tin flash sale!'
        }
      })
    } else {
      sendApiResponse(res, StatusCodes.OK, {
        statusCode: StatusCodes.OK,
        message: 'Lấy thông tin flash sale thành công!',
        data: result
      })
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình thực hiện!'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const updateFlashSale = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { flashSaleId } = req.params
    const result = await flashSaleService.handleUpdateFlashSale(flashSaleId, req.body)
    if (!result) {
      sendApiResponse(res, StatusCodes.BAD_REQUEST, {
        statusCode: StatusCodes.BAD_REQUEST,
        message: 'Có lỗi xảy ra trong quá trình cập nhật flash sale!',
        error: {
          code: StatusCodes.BAD_REQUEST,
          details: 'Có lỗi xảy ra trong quá trình cập nhật flash sale!'
        }
      })
    } else {
      sendApiResponse(res, StatusCodes.OK, {
        statusCode: StatusCodes.OK,
        message: 'Cập nhật flash sale thành công!',
        data: result
      })
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình thực hiện!'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const deleteFlashSale = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { flashSaleId } = req.params
    const result = await flashSaleService.handleDeleteFlashSale(flashSaleId)
    if (!result) {
      sendApiResponse(res, StatusCodes.BAD_REQUEST, {
        statusCode: StatusCodes.BAD_REQUEST,
        message: 'Có lỗi xảy ra trong quá trình xóa flash sale!',
        error: {
          code: StatusCodes.BAD_REQUEST,
          details: 'Có lỗi xảy ra trong quá trình xóa flash sale!'
        }
      })
    } else {
      sendApiResponse(res, StatusCodes.OK, {
        statusCode: StatusCodes.OK,
        message: 'Xóa flash sale thành công!',
        data: result
      })
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình thực hiện!'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

// Kích hoạt flash sale
const activateFlashSale = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { flashSaleId } = req.params
    const result = await flashSaleService.handleActivateFlashSale(flashSaleId)
    if (!result) {
      sendApiResponse(res, StatusCodes.BAD_REQUEST, {
        statusCode: StatusCodes.BAD_REQUEST,
        message: 'Có lỗi xảy ra trong quá trình kích hoạt flash sale!',
        error: {
          code: StatusCodes.BAD_REQUEST,
          details: 'Có lỗi xảy ra trong quá trình kích hoạt flash sale!'
        }
      })
    } else {
      sendApiResponse(res, StatusCodes.OK, {
        statusCode: StatusCodes.OK,
        message: 'Kích hoạt flash sale thành công!',
        data: result
      })
    }
  } catch (error) {
    const err = error as Error & { statusCode?: number }
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình thực hiện!'
    const statusCode = err.statusCode ?? StatusCodes.UNPROCESSABLE_ENTITY
    const customError = new ApiError(statusCode, errorMessage)
    next(customError)
  }
}

// Hủy kích hoạt flash sale
const deactivateFlashSale = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { flashSaleId } = req.params
    const result = await flashSaleService.handleDeactivateFlashSale(flashSaleId)
    if (!result) {
      sendApiResponse(res, StatusCodes.BAD_REQUEST, {
        statusCode: StatusCodes.BAD_REQUEST,
        message: 'Có lỗi xảy ra trong quá trình hủy kích hoạt flash sale!',
        error: {
          code: StatusCodes.BAD_REQUEST,
          details: 'Có lỗi xảy ra trong quá trình hủy kích hoạt flash sale!'
        }
      })
    } else {
      sendApiResponse(res, StatusCodes.OK, {
        statusCode: StatusCodes.OK,
        message: 'Hủy kích hoạt flash sale thành công!',
        data: result
      })
    }
  } catch (error) {
    const err = error as Error & { statusCode?: number }
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình thực hiện!'
    const statusCode = err.statusCode ?? StatusCodes.UNPROCESSABLE_ENTITY
    const customError = new ApiError(statusCode, errorMessage)
    next(customError)
  }
}

// Lấy sản phẩm Flash Sale đang hoạt động
const getActiveFlashSaleProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await flashSaleService.handleGetActiveFlashSaleProducts()
    sendApiResponse(res, StatusCodes.OK, {
      statusCode: StatusCodes.OK,
      message: 'Lấy danh sách sản phẩm Flash Sale thành công!',
      data: result
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình thực hiện!'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

// Kiểm tra giới hạn flash sale
const checkFlashSaleLimit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId, variantId, quantity } = req.body
    const result = await flashSaleService.handleCheckFlashSaleLimit(productId, variantId, quantity)
    sendApiResponse(res, StatusCodes.OK, {
      statusCode: StatusCodes.OK,
      message: 'Kiểm tra giới hạn flash sale thành công!',
      data: result
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình thực hiện!'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

export const flashSaleController = {
  createFlashSale,
  fetchAllFlashSales,
  fetchInfoFlashSale,
  updateFlashSale,
  deleteFlashSale,
  activateFlashSale,
  deactivateFlashSale,
  getActiveFlashSaleProducts,
  checkFlashSaleLimit
}
