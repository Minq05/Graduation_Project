import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import sendApiResponse from '~/utils/response.message'
import OrderModel from '~/models/order.model'

/**
 * Update shipping status
 */
const updateShippingStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.params
    const { statusCode } = req.body

    if (!orderId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Thiếu mã đơn hàng')
    }

    if (!statusCode) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Thiếu mã trạng thái vận chuyển')
    }

    // Get order information
    const order = await OrderModel.findById(orderId)
    if (!order) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy đơn hàng')
    }

    if (!order.shipping?.orderCode) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Đơn hàng chưa được tạo vận chuyển')
    }

    // Mapping for shipping status names in Vietnamese
    const statusNames: Record<string, string> = {
      'ready_to_pick': 'Chờ lấy hàng',
      'picking': 'Đang lấy hàng',
      'picked': 'Đã lấy hàng',
      'delivering': 'Đang giao hàng',
      'delivered': 'Đã giao hàng',
      'delivery_fail': 'Giao hàng thất bại',
      'waiting_to_return': 'Chờ trả hàng',
      'return': 'Đang trả hàng',
      'returned': 'Đã trả hàng',
      'cancel': 'Đã hủy',
      'exception': 'Ngoại lệ',
    }
    
    // Đồng bộ trạng thái đơn hàng theo trạng thái vận chuyển
    // Map trạng thái vận chuyển sang trạng thái đơn hàng cũ
    const shippingToOrderStatusMap: Record<string, string> = {
      'ready_to_pick': 'processing',
      'picking': 'processing',
      'picked': 'shipped',
      'delivering': 'shipped',
      'delivered': 'delivered',
      'delivery_fail': 'cancelled',
      'waiting_to_return': 'cancelled',
      'return': 'cancelled',
      'returned': 'cancelled',
      'cancel': 'cancelled',
      'exception': 'cancelled'
    }
    
    // Ánh xạ trạng thái vận chuyển sang trạng thái đơn hàng cũ
    const orderStatus = shippingToOrderStatusMap[statusCode] || 'processing'
    
    // Xác định trạng thái thanh toán dựa trên trạng thái vận chuyển
    let paymentStatus = order.paymentStatus
    if (statusCode === 'delivered' && order.paymentMethod === 'cash') {
      paymentStatus = 'paid'
    }

    // Update order with shipping status, order status and payment status
    const updatedOrder = await OrderModel.findByIdAndUpdate(
      orderId,
      {
        'shipping.statusCode': statusCode,
        'shipping.statusName': statusNames[statusCode] || 'Không xác định',
        status: orderStatus,
        paymentStatus: paymentStatus
      },
      { new: true }
    )

    sendApiResponse(res, StatusCodes.OK, {
      statusCode: StatusCodes.OK,
      message: 'Cập nhật trạng thái vận chuyển thành công',
      data: {
        order: updatedOrder
      }
    })
  } catch (error) {
    const err = error as ErrorWithStatus
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi cập nhật trạng thái vận chuyển'
    const statusCode = err.statusCode ?? StatusCodes.INTERNAL_SERVER_ERROR
    const customError = new ApiError(statusCode, errorMessage)
    next(customError)
  }
}

export const shippingController = {
  updateShippingStatus
}