import { Request, Response, NextFunction } from 'express'
import { createVnpayPaymentUrl, verifyVnpayReturn } from '~/services/vnpay.service'
import OrderModel from '../models/order.model'
import OrderItemModel from '../models/orderItems.model'

export const vnpayController = {
  createPayment: (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('VNPay create payment request received')
      const { amount, orderId, orderInfo } = req.body
      const ipAddr = req.headers['x-forwarded-for']?.toString() || req.socket.remoteAddress || '127.0.0.1'

      if (!amount || !orderId || !orderInfo) {
        console.log('Missing payment info')
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

      console.log('Generated payment URL successfully')

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
    } catch (error: unknown) {
      console.error('VNPay create payment error occurred')
      return res.status(500).json({
        success: false,
        message: 'Lỗi hệ thống khi tạo thanh toán'
      })
    }
  },

  vnpayReturn: async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('VNPay return received')
      const vnpayParams = req.query
      const result = verifyVnpayReturn(vnpayParams)

      console.log('Verify completed')

      // Cập nhật trạng thái đơn hàng nếu thanh toán thành công
      if (result.responseCode === '00') {
        try {
          // Cập nhật trạng thái đơn hàng

          // Lấy orderId từ kết quả trả về
          const orderId = result.data?.orderId

          if (orderId) {
            // Kiểm tra xem đơn hàng có tồn tại không
            const order = await OrderModel.findById(orderId)
            console.log('Found order:', order ? 'Yes' : 'No')

            if (order) {
              // Cập nhật trạng thái đơn hàng thành đã thanh toán
              await OrderModel.findByIdAndUpdate(
                orderId,
                {
                  paymentStatus: 'paid'
                },
                { new: true }
              )
              console.log('Đã cập nhật trạng thái đơn hàng thành công')

              // Kiểm tra các sản phẩm trong đơn hàng
              const orderItems = await OrderItemModel.find({ orderId })
              console.log(`Đơn hàng có ${orderItems.length} sản phẩm`)
            } else {
              console.error('Không tìm thấy đơn hàng với ID được cung cấp')
            }
          }
        } catch (updateError: unknown) {
          console.error('Lỗi khi cập nhật trạng thái đơn hàng')
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
    } catch (error: unknown) {
      console.error('VNPay return error occurred')
      return res.status(500).json({
        success: false,
        message: 'Lỗi hệ thống khi xác thực thanh toán'
      })
    }
  },
  vnpayIPN: async (req: Request, res: Response, next: NextFunction) => {

    try {
      console.log('VNPay IPN received')
      const vnpayParams = req.query
      const result = verifyVnpayReturn(vnpayParams)

      if (result.responseCode === '00') {
        try {
          // Cập nhật trạng thái đơn hàng

          // Lấy orderId từ kết quả trả về
          const orderId = result.data?.orderId

          if (orderId) {
            // Cập nhật trạng thái đơn hàng thành đã thanh toán
            await OrderModel.findByIdAndUpdate(
              orderId,
              {
                paymentStatus: 'paid'
              },
              { new: true }
            )
            console.log('Đã cập nhật trạng thái đơn hàng thành công qua IPN')
          }
        } catch (updateError: unknown) {
          console.error('Lỗi khi cập nhật trạng thái đơn hàng qua IPN')
        }

        return res.json({ RspCode: '00', Message: 'success' })
      } else {
        console.log('Payment failed for order')
        return res.json({ RspCode: '01', Message: 'failed' })
      }
    } catch (error: unknown) {
      console.error('VNPay IPN error occurred')
      return res.json({ RspCode: '99', Message: 'error' })
    }
  }
}
