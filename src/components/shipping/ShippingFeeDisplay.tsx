import React, { useEffect, useState } from 'react'
import { formatCurrencyVND } from '@/utils/utils'
import { getShippingRateByProvince } from '@/services/shipping-service/shipping.utils'
import { Loader2 } from 'lucide-react'

interface ShippingFeeDisplayProps {
  provinceName: string | undefined
  shippingMethod: string
}

export const ShippingFeeDisplay: React.FC<ShippingFeeDisplayProps> = ({
  provinceName,
  shippingMethod
}) => {
  const [fee, setFee] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    setLoading(true)

    // Tính phí vận chuyển dựa trên tỉnh thành và phương thức
    const calculateFee = () => {
      console.log('Tính phí cho tỉnh:', provinceName)

      if (!provinceName) {
        // Giá mặc định nếu không có tỉnh thành
        const defaultFee = shippingMethod === 'standard' ? 30000 : 
          shippingMethod === 'express-ghn' ? 45000 : 60000
        console.log('Sử dụng giá mặc định:', defaultFee)
        setFee(defaultFee)
      } else {
        // Tính phí dựa trên tỉnh thành
        const calculatedFee = getShippingRateByProvince(provinceName, shippingMethod)
        console.log('Phí tính được cho', provinceName, ':', calculatedFee)
        setFee(calculatedFee)
      }

      setLoading(false)
    }

    // Tính ngay lập tức để thấy sự thay đổi
    calculateFee()
  }, [provinceName, shippingMethod])

  if (loading) {
    return (
      <span className="flex items-center text-blue-500">
        <Loader2 className="h-3 w-3 mr-2 animate-spin" />
        Đang tính...
      </span>
    )
  }

  // Hiển thị phí vận chuyển với màu khác nếu có tỉnh thành
  return <span className={provinceName ? "font-bold text-green-600" : ""}>{formatCurrencyVND(fee)}</span>
}
