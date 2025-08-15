import { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

interface AddressSelectorProps {
  onAddressChange: (address: {
    province: string
    district: string
    ward: string
    provinceCode?: string
    districtCode?: string
    wardCode?: string
  }) => void
  defaultValues?: {
    provinceCode?: string
    districtCode?: string
    wardCode?: string
  }
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

const AddressSelector = ({ onAddressChange, defaultValues }: AddressSelectorProps) => {
  const [provinces, setProvinces] = useState<Province[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [wards, setWards] = useState<Ward[]>([])
  
  const [selectedProvince, setSelectedProvince] = useState<string>('')
  const [selectedDistrict, setSelectedDistrict] = useState<string>('')
  const [selectedWard, setSelectedWard] = useState<string>('')
  
  const [loadingProvinces, setLoadingProvinces] = useState(false)
  const [loadingDistricts, setLoadingDistricts] = useState(false)
  const [loadingWards, setLoadingWards] = useState(false)

  // Load danh sách tỉnh thành khi component mount
  useEffect(() => {
    const loadProvinces = async () => {
      setLoadingProvinces(true)
      try {
        const response = await fetch('https://provinces.open-api.vn/api/p/')
        const provinceData = await response.json()
        setProvinces(provinceData)
        
        // Set giá trị mặc định nếu có
        if (defaultValues?.provinceCode) {
          setSelectedProvince(defaultValues.provinceCode)
        }
      } catch (error) {
        console.error('Error loading provinces:', error)
      } finally {
        setLoadingProvinces(false)
      }
    }
    
    loadProvinces()
  }, [])

  // Load danh sách quận/huyện khi chọn tỉnh
  useEffect(() => {
    const loadDistricts = async () => {
      if (selectedProvince) {
        setLoadingDistricts(true)
        try {
          const response = await fetch(`https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`)
          const data = await response.json()
          setDistricts(data.districts || [])
          setWards([])
          setSelectedDistrict('')
          setSelectedWard('')
          
          // Set giá trị mặc định nếu có
          if (defaultValues?.districtCode && selectedProvince === defaultValues.provinceCode) {
            setSelectedDistrict(defaultValues.districtCode)
          }
        } catch (error) {
          console.error('Error loading districts:', error)
        } finally {
          setLoadingDistricts(false)
        }
      }
    }
    
    loadDistricts()
  }, [selectedProvince])

  // Load danh sách phường/xã khi chọn quận/huyện
  useEffect(() => {
    const loadWards = async () => {
      if (selectedDistrict) {
        setLoadingWards(true)
        try {
          const response = await fetch(`https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`)
          const data = await response.json()
          setWards(data.wards || [])
          setSelectedWard('')
          
          // Set giá trị mặc định nếu có
          if (defaultValues?.wardCode && selectedDistrict === defaultValues.districtCode) {
            setSelectedWard(defaultValues.wardCode)
          }
        } catch (error) {
          console.error('Error loading wards:', error)
        } finally {
          setLoadingWards(false)
        }
      }
    }
    
    loadWards()
  }, [selectedDistrict])

  // Gọi callback khi có thay đổi địa chỉ
  useEffect(() => {
    if (selectedProvince && selectedDistrict && selectedWard) {
      const province = provinces.find(p => p.code === selectedProvince)
      const district = districts.find(d => d.code === selectedDistrict)
      const ward = wards.find(w => w.code === selectedWard)
      
      onAddressChange({
        province: province?.name || '',
        district: district?.name || '',
        ward: ward?.name || '',
        provinceCode: selectedProvince,
        districtCode: selectedDistrict,
        wardCode: selectedWard
      })
    }
  }, [selectedProvince, selectedDistrict, selectedWard, provinces, districts, wards])

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="province">Tỉnh/Thành phố *</Label>
        <Select value={selectedProvince} onValueChange={setSelectedProvince}>
          <SelectTrigger>
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
        <Label htmlFor="district">Quận/Huyện *</Label>
        <Select 
          value={selectedDistrict} 
          onValueChange={setSelectedDistrict}
          disabled={!selectedProvince}
        >
          <SelectTrigger>
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
        <Label htmlFor="ward">Phường/Xã *</Label>
        <Select 
          value={selectedWard} 
          onValueChange={setSelectedWard}
          disabled={!selectedDistrict}
        >
          <SelectTrigger>
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
  )
}

export default AddressSelector