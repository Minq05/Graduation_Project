import { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

interface Province {
  code: number
  name: string
  division_type: string
  codename: string
  phone_code: number
}

interface District {
  code: number
  name: string
  division_type: string
  codename: string
  province_code: number
}

interface Ward {
  code: number
  name: string
  division_type: string
  codename: string
  district_code: number
}

interface AddressData {
  provinceCode: string
  provinceName: string
  districtCode: string
  districtName: string
  wardCode: string
  wardName: string
}

interface Props {
  onAddressChange?: (data: AddressData) => void
  disabled?: boolean
}

const VietnamAddressSelector = ({ onAddressChange, disabled = false }: Props) => {
  const [provinces, setProvinces] = useState<Province[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [wards, setWards] = useState<Ward[]>([])
  const [loading, setLoading] = useState(false)

  const [selectedProvince, setSelectedProvince] = useState('')
  const [selectedDistrict, setSelectedDistrict] = useState('')
  const [selectedWard, setSelectedWard] = useState('')

  // Fetch provinces on component mount
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        setLoading(true)
        const response = await fetch('https://provinces.open-api.vn/api/p/')
        const data = await response.json()
        setProvinces(data)
      } catch (error) {
        console.error('Error fetching provinces:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProvinces()
  }, [])

  // Fetch districts when province changes
  useEffect(() => {
    if (selectedProvince) {
      const fetchDistricts = async () => {
        try {
          setLoading(true)
          const response = await fetch(`https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`)
          const data = await response.json()
          setDistricts(data.districts || [])
          setWards([])
          setSelectedDistrict('')
          setSelectedWard('')
        } catch (error) {
          console.error('Error fetching districts:', error)
        } finally {
          setLoading(false)
        }
      }
      fetchDistricts()
    } else {
      setDistricts([])
      setWards([])
    }
  }, [selectedProvince])

  // Fetch wards when district changes
  useEffect(() => {
    if (selectedDistrict) {
      const fetchWards = async () => {
        try {
          setLoading(true)
          const response = await fetch(`https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`)
          const data = await response.json()
          setWards(data.wards || [])
          setSelectedWard('')
        } catch (error) {
          console.error('Error fetching wards:', error)
        } finally {
          setLoading(false)
        }
      }
      fetchWards()
    } else {
      setWards([])
    }
  }, [selectedDistrict])

  // Update parent component when selection changes
  useEffect(() => {
    if (selectedProvince && selectedDistrict && selectedWard && onAddressChange) {
      const province = provinces.find(p => p.code.toString() === selectedProvince)
      const district = districts.find(d => d.code.toString() === selectedDistrict)
      const ward = wards.find(w => w.code.toString() === selectedWard)

      if (province && district && ward) {
        onAddressChange({
          provinceCode: selectedProvince,
          provinceName: province.name,
          districtCode: selectedDistrict,
          districtName: district.name,
          wardCode: selectedWard,
          wardName: ward.name
        })
      }
    }
  }, [selectedProvince, selectedDistrict, selectedWard, provinces, districts, wards, onAddressChange])

  const handleProvinceChange = (value: string) => {
    setSelectedProvince(value)
  }

  const handleDistrictChange = (value: string) => {
    setSelectedDistrict(value)
  }

  const handleWardChange = (value: string) => {
    setSelectedWard(value)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <Label>Tỉnh/Thành phố</Label>
        <Select 
          value={selectedProvince} 
          onValueChange={handleProvinceChange}
          disabled={disabled || loading}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder={loading ? "Đang tải..." : "Chọn tỉnh/thành phố"} />
          </SelectTrigger>
          <SelectContent>
            {provinces.map((province) => (
              <SelectItem key={province.code} value={province.code.toString()}>
                {province.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Quận/Huyện</Label>
        <Select 
          value={selectedDistrict} 
          onValueChange={handleDistrictChange}
          disabled={disabled || loading || !selectedProvince}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder={loading ? "Đang tải..." : "Chọn quận/huyện"} />
          </SelectTrigger>
          <SelectContent>
            {districts.map((district) => (
              <SelectItem key={district.code} value={district.code.toString()}>
                {district.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Phường/Xã</Label>
        <Select 
          value={selectedWard} 
          onValueChange={handleWardChange}
          disabled={disabled || loading || !selectedDistrict}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder={loading ? "Đang tải..." : "Chọn phường/xã"} />
          </SelectTrigger>
          <SelectContent>
            {wards.map((ward) => (
              <SelectItem key={ward.code} value={ward.code.toString()}>
                {ward.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

export default VietnamAddressSelector