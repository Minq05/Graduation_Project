import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { productVariantService } from '~/services/product-variant.service'
import ApiError from '~/utils/ApiError'
import sendApiResponse from '~/utils/response.message'

const createProductVariant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await productVariantService.handleCreateProductVariant(req.body)
    if (!result) {
      sendApiResponse(res, StatusCodes.BAD_REQUEST, {
        statusCode: StatusCodes.BAD_REQUEST,
        message: 'Có lỗi xảy ra trong quá trình tạo biến thể sản phẩm!',
        error: {
          code: StatusCodes.BAD_REQUEST,
          details: 'Có lỗi xảy ra trong quá trình tạo biến thể sản phẩm!'
        }
      })
    } else {
      sendApiResponse(res, StatusCodes.CREATED, {
        statusCode: StatusCodes.CREATED,
        message: 'Tạo biến thể sản phẩm thành công!',
        data: result
      })
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình thực hiện!'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const fetchAllProductVariants = async (req: Request, res: Response, next: NextFunction) => {
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
    const result = await productVariantService.handleFetchAllProductVariants({
      currentPage: parsedCurrentPage,
      limit: parsedLimit,
      qs: parsedQs
    })
    if (!result) {
      sendApiResponse(res, StatusCodes.BAD_REQUEST, {
        statusCode: StatusCodes.BAD_REQUEST,
        message: 'Có lỗi xảy ra trong quá trình lấy danh sách biến thể sản phẩm!',
        error: {
          code: StatusCodes.BAD_REQUEST,
          details: 'Có lỗi xảy ra trong quá trình lấy danh sách biến thể sản phẩm!'
        }
      })
    } else {
      sendApiResponse(res, StatusCodes.OK, {
        statusCode: StatusCodes.OK,
        message: 'Lấy danh sách biến thể sản phẩm thành công!',
        data: result
      })
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình thực hiện!'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const fetchInfoProductVariant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { variantId } = req.params
    const result = await productVariantService.handleFetchInfoProductVariant(variantId)
    if (!result) {
      sendApiResponse(res, StatusCodes.BAD_REQUEST, {
        statusCode: StatusCodes.BAD_REQUEST,
        message: 'Có lỗi xảy ra trong quá trình lấy thông tin biến thể sản phẩm!',
        error: {
          code: StatusCodes.BAD_REQUEST,
          details: 'Có lỗi xảy ra trong quá trình lấy thông tin biến thể sản phẩm!'
        }
      })
    } else {
      sendApiResponse(res, StatusCodes.OK, {
        statusCode: StatusCodes.OK,
        message: 'Lấy thông tin biến thể sản phẩm thành công!',
        data: result
      })
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình thực hiện!'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const updateProductVariant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { variantId } = req.params
    const result = await productVariantService.handleUpdateProductVariant(variantId, req.body)
    if (!result) {
      sendApiResponse(res, StatusCodes.BAD_REQUEST, {
        statusCode: StatusCodes.BAD_REQUEST,
        message: 'Có lỗi xảy ra trong quá trình cập nhật biến thể sản phẩm!',
        error: {
          code: StatusCodes.BAD_REQUEST,
          details: 'Có lỗi xảy ra trong quá trình cập nhật biến thể sản phẩm!'
        }
      })
    } else {
      sendApiResponse(res, StatusCodes.OK, {
        statusCode: StatusCodes.OK,
        message: 'Cập nhật biến thể sản phẩm thành công!',
        data: result
      })
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình thực hiện!'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const deleteProductVariant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { variantId } = req.params
    const result = await productVariantService.handleDeleteProductVariant(variantId)
    if (!result) {
      sendApiResponse(res, StatusCodes.BAD_REQUEST, {
        statusCode: StatusCodes.BAD_REQUEST,
        message: 'Có lỗi xảy ra trong quá trình xóa biến thể sản phẩm!',
        error: {
          code: StatusCodes.BAD_REQUEST,
          details: 'Có lỗi xảy ra trong quá trình xóa biến thể sản phẩm!'
        }
      })
    } else {
      sendApiResponse(res, StatusCodes.OK, {
        statusCode: StatusCodes.OK,
        message: 'Xóa biến thể sản phẩm thành công!',
        data: result
      })
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình thực hiện!'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

export const productVariantController = {
  createProductVariant,
  fetchAllProductVariants,
  fetchInfoProductVariant,
  updateProductVariant,
  deleteProductVariant
}
