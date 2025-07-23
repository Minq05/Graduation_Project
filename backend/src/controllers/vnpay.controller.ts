import { Request, Response, NextFunction } from 'express'
import { createVnpayPaymentUrl, verifyVnpayReturn } from '~/services/vnpay.service'

export const vnpayController = {
  createPayment: (req, res, next) => {
    try {
      console.log('VNPay create payment request:', req.body)
      const { amount, orderId, orderInfo } = req.body
      const ipAddr = req.headers['x-forwarded-for']?.toString() || req.socket.remoteAddress || '127.0.0.1'

      if (!amount || !orderId || !orderInfo) {
        console.log('Missing payment info:', { amount, orderId, orderInfo })
        return res.status(400).json({ 
          success: false,
          message: 'Thiếu thông tin thanh toán',
          error: 'MISSING_PAYMENT_INFO'
        })
      }

      const paymentUrl = createVnpayPaymentUrl({
        amount: Number(amount),
        orderId: orderId.toString(),
        orderInfo: orderInfo.toString(),
        ipAddr: ipAddr.toString()
      })

      console.log('Generated payment URL:', paymentUrl)
      
      if (!paymentUrl) {
        return res.status(500).json({ 
          success: false,
          message: 'Không thể tạo URL thanh toán',
          error: 'PAYMENT_URL_GENERATION_FAILED'
        })
      }

      return res.json({ 
        success: true,
        paymentUrl,
        message: 'Tạo URL thanh toán thành công'
      })
    } catch (error) {
      console.error('VNPay create payment error:', error)
      return res.status(500).json({ 
        success: false,
        message: 'Lỗi hệ thống khi tạo thanh toán',
        error: error.message
      })
    }
  },

  vnpayReturn: async (req, res, next) => {
    try {
      console.log('VNPay return query params:', req.query)
      const vnpayParams = req.query
      const result = verifyVnpayReturn(vnpayParams)
      
      console.log('Verify result:', result)
      
      // Cập nhật trạng thái đơn hàng nếu thanh toán thành công
      if (result.responseCode === '00') {
        try {
          // Import OrderModel để cập nhật trạng thái đơn hàng
          const OrderModel = require('../models/order.model').default
          const OrderItemModel = require('../models/orderItems.model').default
          
          // Lấy orderId từ kết quả trả về
          const orderId = result.data?.orderId
          
          if (orderId) {
            // Kiểm tra xem đơn hàng có tồn tại không
            const order = await OrderModel.findById(orderId)
            console.log('Found order:', order ? 'Yes' : 'No')
            
            if (order) {
              // Cập nhật trạng thái đơn hàng thành đã thanh toán
              const updatedOrder = await OrderModel.findByIdAndUpdate(
                orderId,
                { 
                  paymentStatus: 'paid',
                },
                { new: true }
              )
              console.log(`Đã cập nhật trạng thái đơn hàng ${orderId} thành công`, updatedOrder)
              
              // Kiểm tra các sản phẩm trong đơn hàng
              const orderItems = await OrderItemModel.find({ orderId })
              console.log(`Đơn hàng ${orderId} có ${orderItems.length} sản phẩm`)
            } else {
              console.error(`Không tìm thấy đơn hàng với ID ${orderId}`)
            }
          }
        } catch (updateError) {
          console.error('Lỗi khi cập nhật trạng thái đơn hàng:', updateError)
        }
        
        return res.json({
          success: true,
          message: 'Thanh toán thành công',
          data: result.data,
          verified: result.isValid
        })
      } else {
        return res.json({
          success: false,
          message: 'Thanh toán thất bại',
          code: result.responseCode,
          data: result.data,
          verified: result.isValid
        })
      }
    } catch (error) {
      console.error('VNPay return error:', error)
      return res.status(500).json({
        success: false,
        message: 'Lỗi hệ thống khi xác thực thanh toán'
      })
    }
  },

  vnpayIPN: async (req, res, next) => {
    try {
      console.log('VNPay IPN received:', req.query)
      const vnpayParams = req.query
      const result = verifyVnpayReturn(vnpayParams)
      
      if (result.responseCode === '00') {
        try {
          // Import OrderModel để cập nhật trạng thái đơn hàng
          const OrderModel = require('../models/order.model').default
          
          // Lấy orderId từ kết quả trả về
          const orderId = result.data?.orderId
          
          if (orderId) {
            // Cập nhật trạng thái đơn hàng thành đã thanh toán
            await OrderModel.findByIdAndUpdate(
              orderId,
              { 
                paymentStatus: 'paid',
              },
              { new: true }
            )
            console.log(`Đã cập nhật trạng thái đơn hàng ${orderId} thành công qua IPN`)
          }
        } catch (updateError) {
          console.error('Lỗi khi cập nhật trạng thái đơn hàng qua IPN:', updateError)
        }
        
        return res.json({ RspCode: '00', Message: 'success' })
      } else {
        console.log('Payment failed for order:', result.data?.orderId)
        return res.json({ RspCode: '01', Message: 'failed' })
      }
    } catch (error) {
      console.error('VNPay IPN error:', error)
      return res.json({ RspCode: '99', Message: 'error' })
    }
  }
}
