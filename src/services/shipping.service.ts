interface ShippingCalculationParams {
  fromAddress: string
  toAddress: string
  weight: number
  shippingMethod: string
}

interface ShippingMethod {
  id: string
  name: string
  description: string
  baseRate: number
  ratePerKm: number
  maxWeight: number
}

// Danh sách phương thức vận chuyển
const SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: 'standard',
    name: 'Giao hàng tiêu chuẩn',
    description: 'Giao hàng trong 3-5 ngày',
    baseRate: 15000,
    ratePerKm: 2000,
    maxWeight: 30
  },
  {
    id: 'express',
    name: 'Giao hàng nhanh',
    description: 'Giao hàng trong 1-2 ngày',
    baseRate: 25000,
    ratePerKm: 3000,
    maxWeight: 20
  },
  {
    id: 'same_day',
    name: 'Giao hàng trong ngày',
    description: 'Giao hàng trong cùng ngày',
    baseRate: 50000,
    ratePerKm: 5000,
    maxWeight: 10
  }
]

// Hàm tính khoảng cách giả lập (thực tế có thể dùng Google Maps API)
const calculateDistance = async (fromAddress: string, toAddress: string): Promise<number> => {
  // Giả lập tính khoảng cách dựa trên độ dài địa chỉ
  // Trong thực tế, bạn nên sử dụng Google Maps Distance Matrix API
  const baseDistance = Math.abs(fromAddress.length - toAddress.length) * 2
  const randomFactor = Math.random() * 20 + 5 // 5-25km
  return Math.round(baseDistance + randomFactor)
}

const handleCalculateShippingFee = async (params: ShippingCalculationParams) => {
  const { fromAddress, toAddress, weight, shippingMethod } = params

  // Tìm phương thức vận chuyển
  const method = SHIPPING_METHODS.find(m => m.id === shippingMethod)
  if (!method) {
    throw new Error('Phương thức vận chuyển không hợp lệ!')
  }

  // Kiểm tra trọng lượng
  if (weight > method.maxWeight) {
    throw new Error(`Trọng lượng vượt quá giới hạn ${method.maxWeight}kg cho phương thức này!`)
  }

  // Tính khoảng cách
  const distance = await calculateDistance(fromAddress, toAddress)

  // Tính phí vận chuyển
  const baseFee = method.baseRate
  const distanceFee = distance * method.ratePerKm
  const weightFee = weight > 5 ? (weight - 5) * 2000 : 0 // Phí thêm cho trọng lượng > 5kg
  const totalFee = baseFee + distanceFee + weightFee

  return {
    distance,
    weight,
    shippingMethod: method,
    fees: {
      baseFee,
      distanceFee,
      weightFee,
      totalFee
    },
    estimatedDeliveryTime: method.description
  }
}

const handleGetShippingMethods = async () => {
  return SHIPPING_METHODS
}

export const shippingService = {
  handleCalculateShippingFee,
  handleGetShippingMethods
}