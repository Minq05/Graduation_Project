import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { ghnService } from '~/services/ghn.service'
import ApiError from '~/utils/ApiError'
import sendApiResponse from '~/utils/response.message'
import OrderModel from '~/models/order.model'
import OrderItemModel from '~/models/orderItems.model'
import UserModel from '~/models/user.model'
import AddressModel from '~/models/address.model'

/**
 * Get all provinces from GHN
 */
const getProvinces = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const provinces = await ghnService.getProvinces()
    sendApiResponse(res, StatusCodes.OK, {
      statusCode: StatusCodes.OK,
      message: 'Lấy danh sách tỉnh/thành phố thành công',
      data: provinces
    })
  } catch (error) {
    const err = error as ErrorWithStatus
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi lấy danh sách tỉnh/thành phố'
    const statusCode = err.statusCode ?? StatusCodes.INTERNAL_SERVER_ERROR
    const customError = new ApiError(statusCode, errorMessage)
    next(customError)
  }
}

/**
 * Get districts by province ID
 */
const getDistricts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { provinceId } = req.params
    if (!provinceId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Thiếu mã tỉnh/thành phố')
    }

    const districts = await ghnService.getDistricts(Number(provinceId))
    sendApiResponse(res, StatusCodes.OK, {
      statusCode: StatusCodes.OK,
      message: 'Lấy danh sách quận/huyện thành công',
      data: districts
    })
  } catch (error) {
    const err = error as ErrorWithStatus
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi lấy danh sách quận/huyện'
    const statusCode = err.statusCode ?? StatusCodes.INTERNAL_SERVER_ERROR
    const customError = new ApiError(statusCode, errorMessage)
    next(customError)
  }
}

/**
 * Get wards by district ID
 */
const getWards = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { districtId } = req.params
    if (!districtId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Thiếu mã quận/huyện')
    }

    const wards = await ghnService.getWards(Number(districtId))
    sendApiResponse(res, StatusCodes.OK, {
      statusCode: StatusCodes.OK,
      message: 'Lấy danh sách phường/xã thành công',
      data: wards
    })
  } catch (error) {
    const err = error as ErrorWithStatus
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi lấy danh sách phường/xã'
    const statusCode = err.statusCode ?? StatusCodes.INTERNAL_SERVER_ERROR
    const customError = new ApiError(statusCode, errorMessage)
    next(customError)
  }
}

/**
 * Calculate shipping fee
 */
const calculateShippingFee = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const shippingData = req.body
    if (!shippingData.to_district_id || !shippingData.to_ward_code) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Thiếu thông tin địa chỉ giao hàng')
    }

    // Default values for shop location (from_district_id)
    const fromDistrictId = shippingData.from_district_id || 1454 // Default to Quận 1, HCMC

    // Default values for package dimensions if not provided
    const packageData = {
      weight: shippingData.weight || 500, // Default 500g
      length: shippingData.length || 20,  // Default 20cm
      width: shippingData.width || 20,    // Default 20cm
      height: shippingData.height || 10   // Default 10cm
    }

    const shippingFeeData = {
      from_district_id: fromDistrictId,
      to_district_id: shippingData.to_district_id,
      to_ward_code: shippingData.to_ward_code,
      ...packageData,
      insurance_value: shippingData.insurance_value || 0,
      service_id: shippingData.service_id || 0
    }

    const fee = await ghnService.calculateShippingFee(shippingFeeData)
    sendApiResponse(res, StatusCodes.OK, {
      statusCode: StatusCodes.OK,
      message: 'Tính phí vận chuyển thành công',
      data: fee
    })
  } catch (error) {
    const err = error as ErrorWithStatus
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi tính phí vận chuyển'
    const statusCode = err.statusCode ?? StatusCodes.INTERNAL_SERVER_ERROR
    const customError = new ApiError(statusCode, errorMessage)
    next(customError)
  }
}

/**
 * Create shipping order with GHN
 */
const createShippingOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.params
    if (!orderId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Thiếu mã đơn hàng')
    }

    // Get order information
    const order = await OrderModel.findById(orderId)
    if (!order) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy đơn hàng')
    }

    // Get user information
    const user = await UserModel.findById(order.userId)
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy thông tin người dùng')
    }

    // Get address information
    let addressData: any = {}
    if (order.addressId) {
      const address = await AddressModel.findById(order.addressId)
      if (address) {
        addressData = address.toObject()
      }
    } else if (order.addressFree) {
      addressData = order.addressFree
    } else {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Không có thông tin địa chỉ giao hàng')
    }

    // Get order items
    const orderItems = await OrderItemModel.find({ orderId: order._id })
      .populate('productId')
      .populate('variantId')
      .lean()

    if (!orderItems.length) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Đơn hàng không có sản phẩm')
    }

    // Prepare items for GHN
    const items = orderItems.map((item: any) => ({
      name: item.productId?.name || 'Sản phẩm',
      code: item.variantId?.sku || item._id.toString(),
      quantity: item.quantity,
      price: item.price,
      weight: 200 // Default weight per item (grams)
    }))

    // Calculate total weight (grams)
    const totalWeight = items.reduce((sum, item) => sum + (item.weight * item.quantity), 0)

    // Log address data for debugging
    console.log('Address data:', addressData);
    console.log('User data:', user);
    
    // Hardcoded values for testing in sandbox environment
    const toDistrictId = 1442; // Quận 2, HCMC
    const toWardCode = '21211'; // Phường An Phú
    
    // Prepare shipping order data
    const shippingOrderData = {
      payment_type_id: order.paymentMethod === 'cash' ? 2 : 1, // 2: COD, 1: Paid
      note: order.note || '',
      required_note: 'KHONGCHOXEMHANG', // Default: Do not allow checking goods
      client_order_code: order._id.toString(),
      to_name: user.fullName || user.name || 'Khách hàng',
      to_phone: user.phone || '0987654321', // Default phone if not available
      to_address: addressData.address || '123 Đường test',
      to_ward_code: addressData.wardCode || toWardCode, // Use hardcoded value if not available
      to_district_id: parseInt(addressData.districtId) || toDistrictId, // Use hardcoded value if not available
      cod_amount: order.paymentMethod === 'cash' ? order.totalPrice : 0,
      content: `Đơn hàng ${order._id}`,
      weight: totalWeight || 500,
      length: 20, // Default dimensions (cm)
      width: 20,
      height: 10,
      service_id: 53320, // Standard service
      service_type_id: 2, // Standard service type
      items
    }
    
    // Log shipping order data for debugging
    console.log('Shipping order data:', shippingOrderData);

    // Create shipping order with GHN
    const shippingOrder = await ghnService.createOrder(shippingOrderData)

    // Update order with shipping information
    const updatedOrder = await OrderModel.findByIdAndUpdate(
      orderId,
      {
        shipping: {
          orderCode: shippingOrder.order_code,
          expectedDeliveryTime: shippingOrder.expected_delivery_time,
          fee: shippingOrder.fee.main_service,
          statusCode: 'ready_to_pick',
          statusName: 'Đã tiếp nhận'
        },
        status: 'processing', // Update order status to processing
        paymentStatus: order.paymentMethod === 'cash' ? 'unpaid' : order.paymentStatus // Ensure payment status is consistent
      },
      { new: true }
    )

    sendApiResponse(res, StatusCodes.OK, {
      statusCode: StatusCodes.OK,
      message: 'Tạo đơn vận chuyển thành công',
      data: {
        shippingOrder,
        order: updatedOrder
      }
    })
  } catch (error) {
    const err = error as ErrorWithStatus
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi tạo đơn vận chuyển'
    const statusCode = err.statusCode ?? StatusCodes.INTERNAL_SERVER_ERROR
    const customError = new ApiError(statusCode, errorMessage)
    next(customError)
  }
}

/**
 * Get shipping order status
 */
const getShippingOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.params
    if (!orderId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Thiếu mã đơn hàng')
    }

    // Get order information
    const order = await OrderModel.findById(orderId)
    if (!order) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy đơn hàng')
    }

    if (!order.shipping?.orderCode) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Đơn hàng chưa được tạo vận chuyển với GHN')
    }

    // Get shipping order status from GHN
    const status = await ghnService.getOrderStatus(order.shipping.orderCode)

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
    const orderStatus = shippingToOrderStatusMap[status.status] || 'processing'
    
    // Xác định trạng thái thanh toán dựa trên trạng thái vận chuyển
    let paymentStatus = order.paymentStatus
    if (status.status === 'delivered' && order.paymentMethod === 'cash') {
      paymentStatus = 'paid'
    }
    
    // Update order with latest shipping status, order status and payment status
    const updatedOrder = await OrderModel.findByIdAndUpdate(
      orderId,
      {
        'shipping.statusCode': status.status,
        'shipping.statusName': status.status_name,
        status: orderStatus,
        paymentStatus: paymentStatus
      },
      { new: true }
    )

    sendApiResponse(res, StatusCodes.OK, {
      statusCode: StatusCodes.OK,
      message: 'Lấy trạng thái vận chuyển thành công',
      data: {
        shippingStatus: status,
        order: updatedOrder
      }
    })
  } catch (error) {
    const err = error as ErrorWithStatus
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi lấy trạng thái vận chuyển'
    const statusCode = err.statusCode ?? StatusCodes.INTERNAL_SERVER_ERROR
    const customError = new ApiError(statusCode, errorMessage)
    next(customError)
  }
}

/**
 * Cancel shipping order
 */
const cancelShippingOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.params
    if (!orderId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Thiếu mã đơn hàng')
    }

    // Get order information
    const order = await OrderModel.findById(orderId)
    if (!order) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy đơn hàng')
    }

    if (!order.shipping?.orderCode) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Đơn hàng chưa được tạo vận chuyển với GHN')
    }

    // Cancel shipping order with GHN
    const result = await ghnService.cancelOrder(order.shipping.orderCode)

    // Update order status and payment status
    const updatedOrder = await OrderModel.findByIdAndUpdate(
      orderId,
      {
        status: 'cancelled',
        reason: req.body.reason || 'Hủy bởi người dùng',
        'shipping.statusCode': 'cancel',
        'shipping.statusName': 'Đã hủy',
        paymentStatus: 'cancelled' // Update payment status to cancelled
      },
      { new: true }
    )

    sendApiResponse(res, StatusCodes.OK, {
      statusCode: StatusCodes.OK,
      message: 'Hủy đơn vận chuyển thành công',
      data: {
        result,
        order: updatedOrder
      }
    })
  } catch (error) {
    const err = error as ErrorWithStatus
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi hủy đơn vận chuyển'
    const statusCode = err.statusCode ?? StatusCodes.INTERNAL_SERVER_ERROR
    const customError = new ApiError(statusCode, errorMessage)
    next(customError)
  }
}

export const ghnController = {
  getProvinces,
  getDistricts,
  getWards,
  calculateShippingFee,
  createShippingOrder,
  getShippingOrderStatus,
  cancelShippingOrder
}