import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import VietnamAddressAPI from '@/components/address/VietnamAddressAPI'

export interface VietnamAddressData {
  fullName: string
  phone: string
  provinceCode: string
  provinceName: string
  districtCode: string
  districtName: string
  wardCode: string
  wardName: string
  address: string
}

interface VietnamAddressShippingProps {
  onChange: (data: VietnamAddressData) => void
  initialData?: VietnamAddressData
}

export const VietnamAddressShipping = ({ onChange, initialData }: VietnamAddressShippingProps) => {
  const [fullName, setFullName] = useState(initialData?.fullName || '')
  const [phone, setPhone] = useState(initialData?.phone || '')
  const [address, setAddress] = useState(initialData?.address || '')
  const [addressData, setAddressData] = useState({
    provinceCode: initialData?.provinceCode || '',
    provinceName: initialData?.provinceName || '',
    districtCode: initialData?.districtCode || '',
    districtName: initialData?.districtName || '',
    wardCode: initialData?.wardCode || '',
    wardName: initialData?.wardName || ''
  })

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (/^\d*$/.test(value)) {
      setPhone(value)
    }
  }

  const handleAddressChange = (data: any) => {
    setAddressData(data)
  }

  useEffect(() => {
    onChange({
      fullName,
      phone,
      ...addressData,
      address
    })
  }, [fullName, phone, addressData, address, onChange])

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="fullName">Họ và tên</Label>
          <Input
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1"
            placeholder="Nhập họ và tên"
            required
          />
        </div>
        <div>
          <Label htmlFor="phone">Số điện thoại</Label>
          <Input
            id="phone"
            value={phone}
            onChange={handlePhoneChange}
            className="mt-1"
            placeholder="Nhập số điện thoại"
            maxLength={10}
            required
          />
          {phone && phone.length > 0 && phone.length < 10 && (
            <p className="text-red-500 text-xs mt-1">Số điện thoại phải có 10 số</p>
          )}
        </div>
      </div>

      <VietnamAddressAPI
        value={addressData}
        onChange={handleAddressChange}
      />

      <div>
        <Label htmlFor="address">Địa chỉ cụ thể</Label>
        <Input
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="mt-1"
          placeholder="Số nhà, tên đường, tòa nhà, v.v."
          required
        />
      </div>
    </div>
  )
}