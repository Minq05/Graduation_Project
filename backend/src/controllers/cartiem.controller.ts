import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { CartItemService } from '~/services/cartitem.service'
import ApiError from '~/utils/ApiError'
import sendApiResponse from '~/utils/response.message'

const createCartItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await CartItemService.handleCreateCartItem(req.body)
    sendApiResponse(res, StatusCodes.CREATED, {
      statusCode: StatusCodes.CREATED,
      message: 'Tạo mục giỏ hàng thành công',
      data: result
    })
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error instanceof Error ? error.message : 'Lỗi tạo giỏ hàng'))
  }
}

const fetchAllCartItem = async (req: Request, res: Response, next: NextFunction) => {
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

    const result = await CartItemService.handleFetchAllCartItems({
      currentPage,
      limit,
      qs: queryString
    })

    sendApiResponse(res, StatusCodes.OK, {
      statusCode: StatusCodes.OK,
      message: 'Lấy danh sách mục giỏ hàng thành công',
      data: result
    })
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error instanceof Error ? error.message : 'Lỗi lấy danh sách'))
  }
}

const fetchInfoCartItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cartItemId } = req.params
    const result = await CartItemService.handleFetchCartItemInfo(cartItemId)

    sendApiResponse(res, StatusCodes.OK, {
      statusCode: StatusCodes.OK,
      message: 'Lấy thông tin mục giỏ hàng thành công',
      data: result
    })
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error instanceof Error ? error.message : 'Lỗi lấy thông tin'))
  }
}

const updateCartItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cartItemId } = req.params
    const result = await CartItemService.handleUpdateCartItem(cartItemId, req.body)

    sendApiResponse(res, StatusCodes.OK, {
      statusCode: StatusCodes.OK,
      message: 'Cập nhật mục giỏ hàng thành công',
      data: result
    })
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error instanceof Error ? error.message : 'Lỗi cập nhật'))
  }
}

const deleteCartItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cartItemId } = req.params
    const result = await CartItemService.handleDeleteCartItem(cartItemId)

    sendApiResponse(res, StatusCodes.OK, {
      statusCode: StatusCodes.OK,
      message: 'Xóa mục giỏ hàng thành công',
      data: result
    })
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error instanceof Error ? error.message : 'Lỗi xoá mục'))
  }
}

export const CartItemController = {
  createCartItem,
  fetchAllCartItem,
  fetchInfoCartItem,
  updateCartItem,
  deleteCartItem
}
