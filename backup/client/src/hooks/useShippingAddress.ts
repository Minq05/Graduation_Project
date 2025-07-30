import { useState } from 'react';
import { AddressData } from '@/components/shipping/address-selector';

export interface ShippingAddressState {
  addressType: 'same' | 'different';
  addressData: AddressData | null;
}

export const useShippingAddress = (initialState?: ShippingAddressState) => {
  const [addressType, setAddressType] = useState<'same' | 'different'>(
    initialState?.addressType || 'same'
  );
  
  const [addressData, setAddressData] = useState<AddressData | null>(
    initialState?.addressData || null
  );

  const handleAddressTypeChange = (type: 'same' | 'different') => {
    setAddressType(type);
  };

  const handleAddressDataChange = (data: AddressData) => {
    setAddressData(data);
  };

  const isAddressValid = () => {
    if (addressType === 'same') {
      return true; // Sử dụng địa chỉ thanh toán, luôn hợp lệ
    }
    
    // Kiểm tra địa chỉ giao hàng khác có đầy đủ thông tin không
    if (!addressData) return false;
    
    return (
      !!addressData.fullNameCode &&
      !!addressData.phoneCode &&
      !!addressData.provinceCode &&
      !!addressData.districtCode &&
      !!addressData.wardCode &&
      !!addressData.streetAddressCode
    );
  };

  return {
    addressType,
    addressData,
    setAddressType: handleAddressTypeChange,
    setAddressData: handleAddressDataChange,
    isAddressValid,
  };
};