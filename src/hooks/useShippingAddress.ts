import { useState } from 'react'
import { AddressData } from '@/components/shipping/address-selector'

export interface ShippingAddressState {
  addressType: 'same' | 'different'
  addressData: AddressData | null
}

export const useShippingAddress = (initialState?: ShippingAddressState) => {
  const [addressType, setAddressType] = useState<'same' | 'different'>(
    initialState?.addressType || 'same'
  )

  const [addressData, setAddressData] = useState<AddressData | null>(
    initialState?.addressData || null
  )

  const handleAddressTypeChange = (type: 'same' | 'different') => {
    setAddressType(type)
  }

  const handleAddressDataChange = (data: AddressData) => {
    setAddressData(data)
  }

  const isAddressValid = () => {
    if (addressType === 'same') {
      return true // Sử dụng địa chỉ thanh toán, luôn hợp lệ
    }

    // Kiểm tra địa chỉ giao hàng khác có đầy đủ thông tin không
    if (!addressData) return false

    return (
      !!addressData.fullNameCode &&
      !!addressData.phoneCode &&
      !!addressData.provinceCode &&
      !!addressData.districtCode &&
      !!addressData.wardCode &&
      !!addressData.streetAddressCode
    )
  }

  // Chuyển đổi mã quận/huyện từ chuỗi sang số
  const getDistrictId = () => {
    if (!addressData?.districtCode) return null
    // Giả sử mã quận/huyện có thể chuyển đổi trực tiếp thành số
    // Trong thực tế, bạn có thể cần một bảng ánh xạ hoặc API để lấy ID
    return parseInt(addressData.districtCode.replace(/\D/g, '')) || null
  }

  return {
    addressType,
    addressData,
    setAddressType: handleAddressTypeChange,
    setAddressData: handleAddressDataChange,
    isAddressValid,
    getDistrictId,
  }
}
