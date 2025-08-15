import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

export interface AddressData {
  fullName: string
  phone: string
  provinceName: string
  districtName: string
  wardName: string
  address: string
  provinceCode?: string
  districtCode?: string
  wardCode?: string
}

interface Province {
  code: string
  name: string
}

interface District {
  code: string
  name: string
  province_code: string
}

interface Ward {
  code: string
  name: string
  district_code: string
}

interface AddressSelectorProps {
  onChange: (data: AddressData) => void
  initialData?: AddressData
}

export const AddressSelector = ({ onChange, initialData }: AddressSelectorProps) => {
  // Form fields
  const [fullName, setFullName] = useState(initialData?.fullName || '')
  const [phone, setPhone] = useState(initialData?.phone || '')
  const [selectedProvince, setSelectedProvince] = useState(initialData?.provinceCode || '')
  const [selectedDistrict, setSelectedDistrict] = useState(initialData?.districtCode || '')
  const [selectedWard, setSelectedWard] = useState(initialData?.wardCode || '')
  const [address, setAddress] = useState(initialData?.address || '')

  // Data states
  const [provinces, setProvinces] = useState<Province[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [wards, setWards] = useState<Ward[]>([])

  // Loading states
  const [loadingProvinces, setLoadingProvinces] = useState(false)
  const [loadingDistricts, setLoadingDistricts] = useState(false)
  const [loadingWards, setLoadingWards] = useState(false)

  // Fetch provinces on component mount
  useEffect(() => {
    fetchProvinces()
  }, [])

  // Fetch districts when province changes
  useEffect(() => {
    if (selectedProvince) {
      fetchDistricts(selectedProvince)
      setSelectedDistrict('')
      setSelectedWard('')
      setDistricts([])
      setWards([])
    }
  }, [selectedProvince])

  // Fetch wards when district changes
  useEffect(() => {
    if (selectedDistrict) {
      fetchWards(selectedDistrict)
      setSelectedWard('')
      setWards([])
    }
  }, [selectedDistrict])

  const fetchProvinces = async () => {
    setLoadingProvinces(true)
    try {
      const response = await fetch('https://provinces.open-api.vn/api/p/')
      const data = await response.json()
      setProvinces(data)
    } catch (error) {
      console.error('Error fetching provinces:', error)
    } finally {
      setLoadingProvinces(false)
    }
  }

  const fetchDistricts = async (provinceCode: string) => {
    setLoadingDistricts(true)
    try {
      const response = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`)
      const data = await response.json()
      setDistricts(data.districts || [])
    } catch (error) {
      console.error('Error fetching districts:', error)
    } finally {
      setLoadingDistricts(false)
    }
  }

  const fetchWards = async (districtCode: string) => {
    setLoadingWards(true)
    try {
      const response = await fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`)
      const data = await response.json()
      setWards(data.wards || [])
    } catch (error) {
      console.error('Error fetching wards:', error)
    } finally {
      setLoadingWards(false)
    }
  }

  // Handle phone input
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (/^\d*$/.test(value)) {
      setPhone(value)
    }
  }

  // Get names from codes
  const getProvinceName = (code: string) => {
    return provinces.find(p => p.code === code)?.name || ''
  }

  const getDistrictName = (code: string) => {
    return districts.find(d => d.code === code)?.name || ''
  }

  const getWardName = (code: string) => {
    return wards.find(w => w.code === code)?.name || ''
  }

  // Update parent component when address data changes
  useEffect(() => {
    onChange({
      fullName,
      phone,
      provinceName: getProvinceName(selectedProvince),
      districtName: getDistrictName(selectedDistrict),
      wardName: getWardName(selectedWard),
      address,
      provinceCode: selectedProvince,
      districtCode: selectedDistrict,
      wardCode: selectedWard
    })
  }, [fullName, phone, selectedProvince, selectedDistrict, selectedWard, address, provinces, districts, wards, onChange])

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
          <Select value={selectedProvince} onValueChange={setSelectedProvince}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder={loadingProvinces ? "Đang tải..." : "Chọn tỉnh/thành phố"} />
            </SelectTrigger>
            <SelectContent>
              {loadingProvinces ? (
                <div className="flex items-center justify-center p-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="ml-2">Đang tải...</span>
                </div>
              ) : (
                provinces.map((province) => (
                  <SelectItem key={province.code} value={province.code}>
                    {province.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="district">Quận/Huyện</Label>
          <Select 
            value={selectedDistrict} 
            onValueChange={setSelectedDistrict}
            disabled={!selectedProvince}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder={
                !selectedProvince ? "Chọn tỉnh/thành phố trước" :
                loadingDistricts ? "Đang tải..." : 
                "Chọn quận/huyện"
              } />
            </SelectTrigger>
            <SelectContent>
              {loadingDistricts ? (
                <div className="flex items-center justify-center p-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="ml-2">Đang tải...</span>
                </div>
              ) : (
                districts.map((district) => (
                  <SelectItem key={district.code} value={district.code}>
                    {district.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="ward">Phường/Xã</Label>
          <Select 
            value={selectedWard} 
            onValueChange={setSelectedWard}
            disabled={!selectedDistrict}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder={
                !selectedDistrict ? "Chọn quận/huyện trước" :
                loadingWards ? "Đang tải..." : 
                "Chọn phường/xã"
              } />
            </SelectTrigger>
            <SelectContent>
              {loadingWards ? (
                <div className="flex items-center justify-center p-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="ml-2">Đang tải...</span>
                </div>
              ) : (
                wards.map((ward) => (
                  <SelectItem key={ward.code} value={ward.code}>
                    {ward.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
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