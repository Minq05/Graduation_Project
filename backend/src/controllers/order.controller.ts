import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { orderService } from '~/services/order.service'
import ApiError from '~/utils/ApiError'
import sendApiResponse from '~/utils/response.message'
import OrderModel from '~/models/order.model'
import OrderItemModel from '~/models/orderItems.model'

const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await orderService.handleCreateOrder(req.body)
    if (result) {
      sendApiResponse(res, StatusCodes.CREATED, {
        statusCode: StatusCodes.CREATED,
        message: 'Tạo đơn hàng thành công',
        data: result
      })
    } else {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Có lỗi xảy ra trong quá trình tạo đơn hàng')
    }
  } catch (error) {
    const err = error as ErrorWithStatus
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình thực hiện'
    const statusCode = err.statusCode ?? StatusCodes.UNPROCESSABLE_ENTITY
    const customError = new ApiError(statusCode, errorMessage)
    next(customError)
  }
}

const fetchAllOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params
    const { page = 1, limit = 10, sort = '-createdAt', status } = req.query

    const result = await orderService.handleFetchAllOrders(userId, {
      page: Number(page),
      limit: Number(limit),
      sort: String(sort),
      status: status?.toString()
    })

    if (result) {
      sendApiResponse(res, StatusCodes.OK, {
        statusCode: StatusCodes.OK,
        message: 'Lấy danh sách đơn hàng thành công',
        data: result // ⬅️ đã bao gồm items
      })
    } else {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Có lỗi xảy ra trong quá trình lấy danh sách đơn hàng')
    }
  } catch (error) {
    const err = error as ErrorWithStatus
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình thực hiện'
    const statusCode = err.statusCode ?? StatusCodes.UNPROCESSABLE_ENTITY
    const customError = new ApiError(statusCode, errorMessage)
    next(customError)
  }
}

const fetchOrderInfo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await orderService.handleFetchOrder(req.params.orderId)
    if (result) {
      sendApiResponse(res, StatusCodes.OK, {
        statusCode: StatusCodes.OK,
        message: 'Lấy thông tin chi tiết đơn hàng thành công',
        data: result
      })
    } else {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Có lỗi xảy ra trong quá trình lấy thông tin đơn hàng')
    }
  } catch (error) {
    const err = error as ErrorWithStatus
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình thực hiện'
    const statusCode = err.statusCode ?? StatusCodes.UNPROCESSABLE_ENTITY
    const customError = new ApiError(statusCode, errorMessage)
    next(customError)
  }
}

const updateStatusOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.params
    const { status, reason } = req.body
    const result = await orderService.handleUpdateStatusOrder(orderId, status, reason)
    if (result) {
      sendApiResponse(res, StatusCodes.OK, {
        statusCode: StatusCodes.OK,
        message: 'Cập nhật trạng thái đơn hàng thành công',
        data: result
      })
    } else {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Có lỗi xảy ra trong quá trình cập nhật trạng thái đơn hàng')
    }
  } catch (error) {
    const err = error as ErrorWithStatus
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình thực hiện'
    const statusCode = err.statusCode ?? StatusCodes.UNPROCESSABLE_ENTITY
    const customError = new ApiError(statusCode, errorMessage)
    next(customError)
  }
}

const fetchItemOfOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.params
    const result = await orderService.handleFetchItemOfOrder(orderId)
    if (result) {
      sendApiResponse(res, StatusCodes.OK, {
        statusCode: StatusCodes.OK,
        message: 'Lấy sản phẩm trong đơn hàng thành công',
        data: result
      })
    } else {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Có lỗi xảy ra trong quá trình lấy sản phẩm trong đơn hàng')
    }
  } catch (error) {
    const err = error as ErrorWithStatus
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình thực hiện'
    const statusCode = err.statusCode ?? StatusCodes.UNPROCESSABLE_ENTITY
    const customError = new ApiError(statusCode, errorMessage)
    next(customError)
  }
}

const cancelOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.params
    const { reason } = req.body
    const result = await orderService.handleCancelOrder(orderId, reason) // truyền reason vào
    if (result) {
      sendApiResponse(res, StatusCodes.OK, {
        statusCode: StatusCodes.OK,
        message: 'Hủy đơn hàng thành công',
        data: result
      })
    } else {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Có lỗi xảy ra trong quá trình hủy đơn hàng')
    }
  } catch (error) {
    const err = error as ErrorWithStatus
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình thực hiện'
    const statusCode = err.statusCode ?? StatusCodes.UNPROCESSABLE_ENTITY
    const customError = new ApiError(statusCode, errorMessage)
    next(customError)
  }
}

// API mới để lấy tất cả đơn hàng cho Admin
const fetchAllOrdersForAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Fetching all orders for admin, query:', req.query)

    // Trả về tất cả đơn hàng mà không cần filter, sắp xếp theo thời gian tạo mới nhất trước
    const allOrders = await OrderModel.find({})
      .sort({ createdAt: -1 }) // Sắp xếp giảm dần theo thời gian tạo
      .populate('userId', 'fullName name email phone')
      .populate('addressId', 'province district ward address')
      .populate('discountId', 'name value type startDate endDate')
      .lean()
      .exec()

    console.log('All orders found:', allOrders.length)

    // Lấy thêm thông tin các sản phẩm trong đơn hàng
    const ordersWithItems = await Promise.all(
      allOrders.map(async (order) => {
        const items = await OrderItemModel.find({ orderId: order._id })
          .populate('productId')
          .populate('variantId')
          .lean()
          .exec()
        return { ...order, items }
      })
    )

    const result = {
      meta: {
        current: 1,
        pageSize: 100,
        pages: 1,
        total: allOrders.length
      },
      results: ordersWithItems
    }

    sendApiResponse(res, StatusCodes.OK, {
      statusCode: StatusCodes.OK,
      message: 'Lấy danh sách tất cả đơn hàng thành công',
      data: result
    })
  } catch (error) {
    console.error('Error in fetchAllOrdersForAdmin:', error)
    const err = error as ErrorWithStatus
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình thực hiện'
    const statusCode = err.statusCode ?? StatusCodes.UNPROCESSABLE_ENTITY
    const customError = new ApiError(statusCode, errorMessage)
    next(customError)
  }
}

export const orderController = {
  createOrder,
  fetchOrderInfo,
  updateStatusOrder,
  fetchAllOrders,
  fetchItemOfOrder,
  cancelOrder,
  fetchAllOrdersForAdmin
}
