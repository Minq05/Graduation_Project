import { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getProvincesAPI, getDistrictsAPI, getWardsAPI, Province, District, Ward } from '@/services/address-service/address.apis'

interface AddressDropdownProps {
  onProvinceChange?: (province: Province | null) => void
  onDistrictChange?: (district: District | null) => void
  onWardChange?: (ward: Ward | null) => void
  defaultProvinceId?: number
  defaultDistrictId?: number
  defaultWardCode?: string
}

export const AddressDropdown = ({
  onProvinceChange,
  onDistrictChange,
  onWardChange,
  defaultProvinceId,
  defaultDistrictId,
  defaultWardCode
}: AddressDropdownProps) => {
  const queryClient = useQueryClient()
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null)
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null)
  const [selectedWard, setSelectedWard] = useState<Ward | null>(null)

  // Function to clear address cache
  const clearAddressCache = () => {
    queryClient.invalidateQueries({ queryKey: ['provinces'] })
    queryClient.invalidateQueries({ queryKey: ['districts'] })
    queryClient.invalidateQueries({ queryKey: ['wards'] })
    // Clear browser storage
    localStorage.removeItem('provinces')
    localStorage.removeItem('districts')
    localStorage.removeItem('wards')
  }

  // Fetch provinces
  const { data: provincesData = [] } = useQuery({
    queryKey: ['provinces'],
    queryFn: getProvincesAPI
  })

  // Filter out test data
  const provinces = provincesData.filter(province => {
    const name = province.ProvinceName.toLowerCase()
    return !name.includes('test') && 
           !name.includes('ngoc') && 
           !name.includes('demo') &&
           !name.includes('sample')
  })

  // Fetch districts when province is selected
  const { data: districtsData = [] } = useQuery({
    queryKey: ['districts', selectedProvince?.ProvinceID],
    queryFn: () => getDistrictsAPI(selectedProvince!.ProvinceID),
    enabled: !!selectedProvince
  })

  // Filter out test districts
  const districts = districtsData.filter(district => {
    const name = district.DistrictName.toLowerCase()
    return !name.includes('test') && 
           !name.includes('ngoc') && 
           !name.includes('demo') &&
           !name.includes('sample')
  })

  // Fetch wards when district is selected
  const { data: wardsData = [] } = useQuery({
    queryKey: ['wards', selectedDistrict?.DistrictID],
    queryFn: () => getWardsAPI(selectedDistrict!.DistrictID),
    enabled: !!selectedDistrict
  })

  // Filter out test wards
  const wards = wardsData.filter(ward => {
    const name = ward.WardName.toLowerCase()
    return !name.includes('test') && 
           !name.includes('ngoc') && 
           !name.includes('demo') &&
           !name.includes('sample')
  })

  // Set default values
  useEffect(() => {
    if (defaultProvinceId && provinces.length > 0 && !selectedProvince) {
      const province = provinces.find(p => p.ProvinceID === defaultProvinceId)
      if (province) {
        setSelectedProvince(province)
      }
    }
  }, [defaultProvinceId, provinces, selectedProvince])

  useEffect(() => {
    if (defaultDistrictId && districts.length > 0 && !selectedDistrict) {
      const district = districts.find(d => d.DistrictID === defaultDistrictId)
      if (district) {
        setSelectedDistrict(district)
      }
    }
  }, [defaultDistrictId, districts, selectedDistrict])

  useEffect(() => {
    if (defaultWardCode && wards.length > 0 && !selectedWard) {
      const ward = wards.find(w => w.WardCode === defaultWardCode)
      if (ward) {
        setSelectedWard(ward)
      }
    }
  }, [defaultWardCode, wards, selectedWard])

  const handleProvinceChange = (value: string) => {
    const province = provinces.find(p => p.ProvinceID.toString() === value) || null
    setSelectedProvince(province)
    setSelectedDistrict(null)
    setSelectedWard(null)
    onProvinceChange?.(province)
  }

  const handleDistrictChange = (value: string) => {
    const district = districts.find(d => d.DistrictID.toString() === value) || null
    setSelectedDistrict(district)
    setSelectedWard(null)
    onDistrictChange?.(district)
  }

  const handleWardChange = (value: string) => {
    const ward = wards.find(w => w.WardCode === value) || null
    setSelectedWard(ward)
    onWardChange?.(ward)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tỉnh/Thành phố <span className="text-red-500">*</span>
        </label>
        <Select
          value={selectedProvince?.ProvinceID.toString() || ''}
          onValueChange={handleProvinceChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Chọn tỉnh/thành phố" />
          </SelectTrigger>
          <SelectContent>
            {provinces.map((province) => (
              <SelectItem key={province.ProvinceID} value={province.ProvinceID.toString()}>
                {province.ProvinceName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quận/Huyện <span className="text-red-500">*</span>
        </label>
        <Select
          value={selectedDistrict?.DistrictID.toString() || ''}
          onValueChange={handleDistrictChange}
          disabled={!selectedProvince}
        >
          <SelectTrigger>
            <SelectValue placeholder="Chọn quận/huyện" />
          </SelectTrigger>
          <SelectContent>
            {districts.map((district) => (
              <SelectItem key={district.DistrictID} value={district.DistrictID.toString()}>
                {district.DistrictName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Phường/Xã <span className="text-red-500">*</span>
        </label>
        <Select
          value={selectedWard?.WardCode || ''}
          onValueChange={handleWardChange}
          disabled={!selectedDistrict}
        >
          <SelectTrigger>
            <SelectValue placeholder="Chọn phường/xã" />
          </SelectTrigger>
          <SelectContent>
            {wards.map((ward) => (
              <SelectItem key={ward.WardCode} value={ward.WardCode}>
                {ward.WardName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}