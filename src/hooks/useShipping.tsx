import { useState, useEffect } from 'react'
import { getEstimatedDeliveryTime, getShippingRateByProvince } from '@/services/shipping-service/shipping.utils'

interface CartItem {
  id: string
  quantity: number
  weight?: number
}

// Định nghĩa lại interface AddressData thay vì import từ address-selector
export interface AddressData {
  provinceName: string
  districtName?: string
  wardName?: string
  address?: string
}

interface UseShippingProps {
  addressData: AddressData | null
  cartItems: CartItem[]
}

export const useShipping = ({ addressData, cartItems }: UseShippingProps) => {
  const [shippingMethod, setShippingMethod] = useState('standard')
  const [shippingFee, setShippingFee] = useState<number>(30000)
  const [loading, setLoading] = useState(false)

  // Tính phí vận chuyển khi thay đổi phương thức hoặc tỉnh thành
  useEffect(() => {
    setLoading(true)

    const timer = setTimeout(() => {
      if (!addressData?.provinceName) {
        // Nếu chưa có tỉnh thành, sử dụng giá mặc định
        setShippingFee(getDefaultShippingFee())
      } else {
        // Tính phí vận chuyển dựa trên tỉnh thành
        const fee = getShippingRateByProvince(addressData.provinceName, shippingMethod)
        setShippingFee(fee)
      }
      setLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [shippingMethod, addressData?.provinceName])

  // Lấy phí vận chuyển mặc định
  const getDefaultShippingFee = () => {
    switch (shippingMethod) {
    case 'standard': return 30000
    case 'express-ghn': return 45000
    case 'express': return 60000
    default: return 30000
    }
  }

  return {
    shippingMethod,
    setShippingMethod,
    shippingFee,
    loading,
    estimatedDeliveryTime: addressData?.provinceName
      ? getEstimatedDeliveryTime(addressData.provinceName, shippingMethod)
      : getEstimatedDeliveryTime('Hồ Chí Minh', shippingMethod)
  }
}
