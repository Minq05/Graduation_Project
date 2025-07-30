import React from 'react'
import { formatCurrencyVND } from '@/utils/utils'

interface ShippingPriceDisplayProps {
  provinceName: string | undefined
  shippingMethod: string
}

export const ShippingPriceDisplay: React.FC<ShippingPriceDisplayProps> = ({
  provinceName,
  shippingMethod
}) => {
  // Bảng giá vận chuyển theo tỉnh thành
  const getShippingPrice = (): number => {
    // Nếu không có tỉnh thành, sử dụng giá mặc định
    if (!provinceName) {
      return shippingMethod === 'standard' ? 30000 :
        shippingMethod === 'express-ghn' ? 45000 : 60000
    }

    // Giá cơ bản theo tỉnh thành
    let basePrice = 30000

    // Miền Nam (giá thấp)
    const southProvinces = ['Hồ Chí Minh', 'Bình Dương', 'Đồng Nai', 'Bà Rịa - Vũng Tàu', 'Long An', 'Tiền Giang']
    // Miền Trung (giá trung bình)
    const centralProvinces = ['Đà Nẵng', 'Huế', 'Quảng Nam', 'Quảng Ngãi', 'Bình Định', 'Khánh Hòa', 'Lâm Đồng']
    // Miền Bắc (giá cao)
    const northProvinces = ['Hà Nội', 'Hải Phòng', 'Quảng Ninh', 'Hải Dương', 'Bắc Ninh', 'Hưng Yên']

    if (northProvinces.includes(provinceName)) {
      basePrice = 35000
    } else if (centralProvinces.includes(provinceName)) {
      basePrice = 50000
    } else if (southProvinces.includes(provinceName)) {
      basePrice = 70000
    } else {
      // Các tỉnh khác
      basePrice = 60000
    }

    // Tính giá theo phương thức vận chuyển
    if (shippingMethod === 'express-ghn') {
      return basePrice * 1.5 // Phí giao hàng nhanh = 1.5 lần phí tiêu chuẩn
    } else if (shippingMethod === 'express') {
      return basePrice * 2 // Phí giao hàng hỏa tốc = 2 lần phí tiêu chuẩn
    } else {
      return basePrice // Phí giao hàng tiêu chuẩn
    }
  }

  // Tính giá vận chuyển
  const price = getShippingPrice()

  // Hiển thị giá với màu khác nếu có tỉnh thành
  const className = provinceName ? "font-semibold text-green-600" : ""

  return <span className={className}>{formatCurrencyVND(price)}</span>
}
