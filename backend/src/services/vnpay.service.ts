import crypto from 'crypto'
import { vnpayConfig } from '~/config/vnpay'

export const createVnpayPaymentUrl = ({
  amount,
  orderId,
  orderInfo,
  ipAddr
}: {
  amount: number
  orderId: string
  orderInfo: string
  ipAddr: string
}) => {
  try {
    // Validation
    if (!amount || amount <= 0) {
      throw new Error('Số tiền không hợp lệ')
    }
    if (!orderId) {
      throw new Error('Mã đơn hàng không hợp lệ')
    }
    if (!orderInfo) {
      throw new Error('Thông tin đơn hàng không hợp lệ')
    }
    if (!vnpayConfig.tmnCode || !vnpayConfig.hashSecret) {
      throw new Error('Cấu hình VNPay chưa đầy đủ')
    }

    console.log('VNPay Config:', {
      tmnCode: vnpayConfig.tmnCode,
      url: vnpayConfig.url,
      returnUrl: vnpayConfig.returnUrl,
      hasSecret: !!vnpayConfig.hashSecret
    })

    const date = new Date()
    const createDate = date
      .toISOString()
      .replace(/[-:TZ.]/g, '')
      .slice(0, 14)

    // Sử dụng đúng biến từ config
    const vnp_Params: Record<string, string> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: vnpayConfig.tmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: orderId,
      vnp_OrderInfo: orderInfo.replace(/\s+/g, '_'),
      vnp_OrderType: 'other',
      vnp_Amount: (amount * 100).toString(), // Đảm bảo là string
      vnp_ReturnUrl: vnpayConfig.returnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate
    }

    // Sắp xếp tham số theo alphabet
    const sortedParams = Object.keys(vnp_Params)
      .sort()
      .reduce(
        (acc, key) => {
          acc[key] = vnp_Params[key]
          return acc
        },
        {} as Record<string, string>
      )

    // Tạo chuỗi ký theo chuẩn VNPAY - encode URL trong chuỗi ký
    const signData = Object.keys(sortedParams)
      .map((key) => `${key}=${encodeURIComponent(sortedParams[key])}`)
      .join('&')

    console.log('Sign Data:', signData)
    console.log('Hash Secret:', vnpayConfig.hashSecret)

    // Tạo secure hash
    const secureHash = crypto.createHmac('sha512', vnpayConfig.hashSecret).update(signData).digest('hex')

    console.log('Generated Hash:', secureHash)

    // Thêm secure hash vào params
    sortedParams['vnp_SecureHash'] = secureHash

    // Tạo URL với encode chính xác
    const queryString = Object.keys(sortedParams)
      .map((key) => `${key}=${encodeURIComponent(sortedParams[key])}`)
      .join('&')

    const paymentUrl = `${vnpayConfig.url}?${queryString}`

    console.log('Final payment URL:', paymentUrl)

    if (!paymentUrl || !paymentUrl.includes('vnp_SecureHash')) {
      throw new Error('Không thể tạo URL thanh toán hợp lệ')
    }

    return paymentUrl
  } catch (error) {
    console.error('Error creating VNPay payment URL:', error)
    throw error
  }
}

export const verifyVnpayReturn = (vnpayParams: any) => {
  console.log('VNPAY Return Params:', vnpayParams)

  const secureHash = vnpayParams['vnp_SecureHash']
  const paramsCopy = { ...vnpayParams }
  delete paramsCopy['vnp_SecureHash']
  delete paramsCopy['vnp_SecureHashType']

  // Sắp xếp tham số theo alphabet và decode URL
  const sortedParams = Object.keys(paramsCopy)
    .sort()
    .reduce(
      (acc, key) => {
        if (paramsCopy[key] !== '' && paramsCopy[key] !== null && paramsCopy[key] !== undefined) {
          acc[key] = decodeURIComponent(paramsCopy[key])
        }
        return acc
      },
      {} as Record<string, string>
    )

  // Tạo chuỗi ký theo chuẩn VNPAY - KHÔNG encode lại
  const signData = Object.keys(sortedParams)
    .map((key) => `${key}=${sortedParams[key]}`)
    .join('&')

  console.log('Verify Sign Data:', signData)
  console.log('Received Hash:', secureHash)

  // Tạo secure hash để so sánh
  const checkSum = crypto.createHmac('sha512', vnpayConfig.hashSecret).update(signData).digest('hex')

  console.log('Calculated Hash:', checkSum)
  console.log('Hash Match:', secureHash === checkSum)

  return {
    isValid: secureHash === checkSum,
    responseCode: vnpayParams['vnp_ResponseCode'],
    data: {
      orderId: vnpayParams['vnp_TxnRef'],
      amount: parseInt(vnpayParams['vnp_Amount']) / 100,
      orderInfo: vnpayParams['vnp_OrderInfo'],
      transactionNo: vnpayParams['vnp_TransactionNo'],
      bankCode: vnpayParams['vnp_BankCode'],
      payDate: vnpayParams['vnp_PayDate']
    }
  }
}
