import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

export interface GHNAddressData {
  fullName: string
  phone: string
  provinceName: string
  districtName: string
  wardName: string
  address: string
}

interface GHNAddressSelectorProps {
  onChange: (data: GHNAddressData) => void
  initialData?: GHNAddressData
}

export const GHNAddressSelector = ({ onChange, initialData }: GHNAddressSelectorProps) => {
  // Form fields
  const [fullName, setFullName] = useState(initialData?.fullName || '')
  const [phone, setPhone] = useState(initialData?.phone || '')
  const [provinceName, setProvinceName] = useState(initialData?.provinceName || '')
  const [districtName, setDistrictName] = useState(initialData?.districtName || '')
  const [wardName, setWardName] = useState(initialData?.wardName || '')
  const [address, setAddress] = useState(initialData?.address || '')

  // Xử lý số điện thoại
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Chỉ cho phép nhập số
    if (/^\d*$/.test(value)) {
      setPhone(value)
    }
  }

  // Update parent component when address data changes
  useEffect(() => {
    onChange({
      fullName,
      phone,
      provinceName,
      districtName,
      wardName,
      address
    })
  }, [fullName, phone, provinceName, districtName, wardName, address, onChange])

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="province">Tỉnh/Thành phố</Label>
          <Input
            id="province"
            value={provinceName}
            onChange={(e) => setProvinceName(e.target.value)}
            className="mt-1"
            placeholder="Nhập tỉnh/thành phố"
            required
          />
        </div>

        <div>
          <Label htmlFor="district">Quận/Huyện</Label>
          <Input
            id="district"
            value={districtName}
            onChange={(e) => setDistrictName(e.target.value)}
            className="mt-1"
            placeholder="Nhập quận/huyện"
            required
          />
        </div>

        <div>
          <Label htmlFor="ward">Phường/Xã</Label>
          <Input
            id="ward"
            value={wardName}
            onChange={(e) => setWardName(e.target.value)}
            className="mt-1"
            placeholder="Nhập phường/xã"
            required
          />
        </div>
      </div>

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
