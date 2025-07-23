import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { wishlistService } from '~/services/wishlist.service'
import ApiError from '~/utils/ApiError'
import sendApiResponse from '~/utils/response.message'

const createWishlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?._id
    const { productId } = req.body

    if (!userId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Không tìm thấy thông tin người dùng')
    }

    const result = await wishlistService.handleCreateWishlist({ userId, productId })
    sendApiResponse(res, StatusCodes.CREATED, {
      statusCode: StatusCodes.CREATED,
      message: 'Thêm vào danh sách yêu thích thành công!',
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

const fetchWishlistByUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?._id
    const { current, pageSize, qs } = req.query

    if (!userId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Không tìm thấy thông tin người dùng')
    }

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

    const result = await wishlistService.handleFetchWishlistByUser({
      userId,
      currentPage: parsedCurrentPage,
      limit: parsedLimit,
      qs: parsedQs
    })

    sendApiResponse(res, StatusCodes.OK, {
      statusCode: StatusCodes.OK,
      message: 'Lấy danh sách yêu thích thành công!',
      data: result
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình thực hiện!'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const deleteWishlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { wishlistId } = req.params
    const result = await wishlistService.handleDeleteWishlist(wishlistId)

    sendApiResponse(res, StatusCodes.OK, {
      statusCode: StatusCodes.OK,
      message: 'Xóa sản phẩm khỏi danh sách yêu thích thành công!',
      data: result
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình thực hiện!'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const deleteWishlistByProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?._id
    const { productId } = req.params

    if (!userId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Không tìm thấy thông tin người dùng')
    }

    const result = await wishlistService.handleDeleteWishlistByProduct(userId, productId)

    sendApiResponse(res, StatusCodes.OK, {
      statusCode: StatusCodes.OK,
      message: 'Xóa sản phẩm khỏi danh sách yêu thích thành công!',
      data: result
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình thực hiện!'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const checkWishlist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?._id
    const { productId } = req.params

    if (!userId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Không tìm thấy thông tin người dùng')
    }

    const result = await wishlistService.handleCheckWishlist(userId, productId)

    sendApiResponse(res, StatusCodes.OK, {
      statusCode: StatusCodes.OK,
      message: 'Kiểm tra danh sách yêu thích thành công!',
      data: result
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình thực hiện!'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

export const wishlistController = {
  createWishlist,
  fetchWishlistByUser,
  deleteWishlist,
  deleteWishlistByProduct,
  checkWishlist
}
