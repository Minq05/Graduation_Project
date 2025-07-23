import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { cartService } from '~/services/cart.service'
import ApiError from '~/utils/ApiError'
import sendApiResponse from '~/utils/response.message'

const createCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await cartService.handleCreateCart(req.body)

    sendApiResponse(res, StatusCodes.CREATED, {
      statusCode: StatusCodes.CREATED,
      message: 'Tạo giỏ hàng thành công',
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

const addItemToCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cartId } = req.params
    const result = await cartService.handleAddItemToCart(cartId, req.body)

    sendApiResponse(res, StatusCodes.CREATED, {
      statusCode: StatusCodes.CREATED,
      message: 'Thêm sản phẩm vào giỏ hàng thành công',
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

const fetchInfoCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cartId } = req.params
    const result = await cartService.handleFetchCartInfo(cartId)

    sendApiResponse(res, StatusCodes.OK, {
      statusCode: StatusCodes.OK,
      message: 'Lấy thông tin giỏ hàng thành công',
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

const updateCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cartId } = req.params
    const { cartItemId, newQuantity } = req.body
    const result = await cartService.handleUpdateCart(cartId, cartItemId, newQuantity)

    sendApiResponse(res, StatusCodes.OK, {
      statusCode: StatusCodes.OK,
      message: 'Cập nhật giỏ hàng thành công',
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

const deleteCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cartId } = req.params
    const result = await cartService.handleDeleteCart(cartId)

    sendApiResponse(res, StatusCodes.OK, {
      statusCode: StatusCodes.OK,
      message: 'Xóa giỏ hàng thành công',
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

const clearCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cartId } = req.params
    const result = await cartService.handleDeleteProductFromCart(cartId)

    sendApiResponse(res, StatusCodes.OK, {
      statusCode: StatusCodes.OK,
      message: 'Xóa tất cả sản phẩm trong giỏ hàng thành công',
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

const fetchCartByUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params
    const result = await cartService.handleFetchCartByUser(userId)
    sendApiResponse(res, StatusCodes.OK, {
      statusCode: StatusCodes.OK,
      message: 'Lấy giỏ hàng của người dùng thành công',
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

const deleteItemFromCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cartId, itemId } = req.params
    const result = await cartService.handleDeleteItemFromCart(cartId, itemId)
    sendApiResponse(res, StatusCodes.OK, {
      statusCode: StatusCodes.OK,
      message: 'Xóa mục khỏi giỏ hàng thành công',
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

export const cartController = {
  createCart,
  fetchInfoCart,
  updateCart,
  deleteCart,
  addItemToCart,
  clearCart,
  fetchCartByUser,
  deleteItemFromCart
}
