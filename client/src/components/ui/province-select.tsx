import { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getProvinces, getDistricts, getWards } from 'sub-vn'

interface ProvinceSelectProps {
  onProvinceChange?: (province: any) => void
  onDistrictChange?: (district: any) => void
  onWardChange?: (ward: any) => void
}

const ProvinceSelect = ({ onProvinceChange, onDistrictChange, onWardChange }: ProvinceSelectProps) => {
  const [provinces, setProvinces] = useState<any[]>([])
  const [districts, setDistricts] = useState<any[]>([])
  const [wards, setWards] = useState<any[]>([])
  
  const [selectedProvince, setSelectedProvince] = useState('')
  const [selectedDistrict, setSelectedDistrict] = useState('')
  const [selectedWard, setSelectedWard] = useState('')

  useEffect(() => {
    getProvinces().then(setProvinces)
  }, [])

  useEffect(() => {
    if (selectedProvince) {
      getDistricts(selectedProvince).then(setDistricts)
      setWards([])
      setSelectedDistrict('')
      setSelectedWard('')
    }
  }, [selectedProvince])

  useEffect(() => {
    if (selectedDistrict) {
      getWards(selectedDistrict).then(setWards)
      setSelectedWard('')
    }
  }, [selectedDistrict])

  const handleProvinceChange = (value: string) => {
    setSelectedProvince(value)
    const province = provinces.find(p => p.code === value)
    onProvinceChange?.(province)
  }

  const handleDistrictChange = (value: string) => {
    setSelectedDistrict(value)
    const district = districts.find(d => d.code === value)
    onDistrictChange?.(district)
  }

  const handleWardChange = (value: string) => {
    setSelectedWard(value)
    const ward = wards.find(w => w.code === value)
    onWardChange?.(ward)
  }

  return (
    <div className="space-y-4">
      <Select value={selectedProvince} onValueChange={handleProvinceChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Chọn tỉnh/thành phố" />
        </SelectTrigger>
        <SelectContent>
          {provinces.map((province) => (
            <SelectItem key={province.code} value={province.code}>
              {province.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedDistrict} onValueChange={handleDistrictChange} disabled={!selectedProvince}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Chọn quận/huyện" />
        </SelectTrigger>
        <SelectContent>
          {districts.map((district) => (
            <SelectItem key={district.code} value={district.code}>
              {district.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedWard} onValueChange={handleWardChange} disabled={!selectedDistrict}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Chọn phường/xã" />
        </SelectTrigger>
        <SelectContent>
          {wards.map((ward) => (
            <SelectItem key={ward.code} value={ward.code}>
              {ward.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export default ProvinceSelect