export const ORDER_STATUS = [
  { key: 'pending', label: 'Chờ xác nhận' },
  { key: 'confirmed', label: 'Đã xác nhận' },
  { key: 'processing', label: 'Đang xử lý' },
  { key: 'shipped', label: 'Đang giao hàng' },
  { key: 'delivered', label: 'Đã giao hàng' },
  { key: 'completed', label: 'Đã hoàn thành' },
  { key: 'cancelled', label: 'Đã hủy' },
  { key: 'refunded', label: 'Đã hoàn tiền' }
]
export const getStatusColor = (status: string) => {
  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
    processing: 'bg-purple-100 text-purple-800 border-purple-200',
    shipped: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    delivered: 'bg-green-100 text-green-800 border-green-200',
    completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
    refunded: 'bg-gray-100 text-gray-800 border-gray-200'
  }
  return statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-200'
}
export const getPaymentStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    paid: 'bg-green-100 text-green-800 border-green-200',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    failed: 'bg-red-100 text-red-800 border-red-200'
  }
  return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200'
}
export const getShippingMethodLabel = (method: string) => {
  switch (method) {
  case 'standard':
  case 'Giao hàng tiêu chuẩn':
    return 'Giao hàng tiêu chuẩn'
  case 'express':
  case 'Giao hàng nhanh':
    return 'Giao hàng nhanh'
  default:
    return method
  }
}

export const getPaymentMethodLabel = (method: string) => {
  switch (method) {
  case 'cash':
  case 'Thanh toán khi nhận hàng':
    return 'Thanh toán khi nhận hàng'
  case 'momo':
  case 'Thanh toán MoMo':
    return 'Thanh toán MoMo'
  case 'vnpay':
  case 'Thanh toán VNPAY':
    return 'Thanh toán VNPAY'
  default:
    return method
  }
}
export const CANCEL_REASONS = [
  'Tôi muốn thay đổi địa chỉ giao hàng',
  'Tôi muốn thay đổi sản phẩm trong đơn hàng',
  'Tôi đặt nhầm đơn hàng',
  'Người bán yêu cầu huỷ đơn',
  'Tôi tìm được giá tốt hơn ở nơi khác',
  'Tôi không còn nhu cầu mua nữa',
  'Khác'
]


export const REFUND_REASONS = [
  'Tôi nhận được sai sản phẩm',
  'Sản phẩm bị hư hỏng hoặc không hoạt động',
  'Thiếu sản phẩm trong gói hàng',
  'Hàng giao trễ so với cam kết',
  'Người bán không phản hồi hoặc hỗ trợ',
  'Khác'
]

