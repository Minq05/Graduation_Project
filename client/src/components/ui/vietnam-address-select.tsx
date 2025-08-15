import { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

interface AddressData {
  province: string
  district: string
  ward: string
  provinceCode: string
  districtCode: string
  wardCode: string
}

interface VietnamAddressSelectProps {
  onAddressChange: (address: AddressData) => void
  defaultValues?: {
    provinceCode?: string
    districtCode?: string
    wardCode?: string
  }
  showLabels?: boolean
  className?: string
}

// Cache để tránh gọi API nhiều lần
const cache = {
  provinces: null as any[] | null,
  districts: new Map<string, any[]>(),
  wards: new Map<string, any[]>()
}

// API endpoints
const API_BASE = 'https://provinces.open-api.vn/api'

const VietnamAddressSelect = ({ 
  onAddressChange, 
  defaultValues, 
  showLabels = true,
  className = ""
}: VietnamAddressSelectProps) => {
  const [provinces, setProvinces] = useState<any[]>([])
  const [districts, setDistricts] = useState<any[]>([])
  const [wards, setWards] = useState<any[]>([])
  const [loading, setLoading] = useState({ provinces: false, districts: false, wards: false })
  
  const [selectedProvince, setSelectedProvince] = useState<string>(defaultValues?.provinceCode || '')
  const [selectedDistrict, setSelectedDistrict] = useState<string>(defaultValues?.districtCode || '')
  const [selectedWard, setSelectedWard] = useState<string>(defaultValues?.wardCode || '')

  // Load provinces on mount với cache
  useEffect(() => {
    const loadProvinces = async () => {
      if (cache.provinces) {
        setProvinces(cache.provinces)
        return
      }
      
      setLoading(prev => ({ ...prev, provinces: true }))
      try {
        const response = await fetch(`${API_BASE}/p/`)
        const provinceData = await response.json()
        cache.provinces = provinceData
        setProvinces(provinceData)
      } catch (error) {
        console.error('Error loading provinces:', error)
      } finally {
        setLoading(prev => ({ ...prev, provinces: false }))
      }
    }
    loadProvinces()
  }, [])

  // Load districts when province changes với cache
  useEffect(() => {
    const loadDistricts = async () => {
      if (selectedProvince) {
        // Reset districts và wards ngay lập tức
        setWards([])
        setSelectedDistrict('')
        setSelectedWard('')
        
        // Kiểm tra cache trước
        if (cache.districts.has(selectedProvince)) {
          const cachedDistricts = cache.districts.get(selectedProvince)!
          setDistricts(cachedDistricts)
          return
        }
        
        setLoading(prev => ({ ...prev, districts: true }))
        try {
          const response = await fetch(`${API_BASE}/p/${selectedProvince}?depth=2`)
          const provinceData = await response.json()
          const districtData = provinceData.districts || []
          cache.districts.set(selectedProvince, districtData)
          setDistricts(districtData)
        } catch (error) {
          console.error('Error loading districts:', error)
          setDistricts([])
        } finally {
          setLoading(prev => ({ ...prev, districts: false }))
        }
      } else {
        setDistricts([])
        setWards([])
        setSelectedDistrict('')
        setSelectedWard('')
      }
    }
    loadDistricts()
  }, [selectedProvince])

  // Load wards when district changes với cache
  useEffect(() => {
    const loadWards = async () => {
      if (selectedDistrict) {
        // Reset ward ngay lập tức
        setSelectedWard('')
        
        // Kiểm tra cache trước
        if (cache.wards.has(selectedDistrict)) {
          const cachedWards = cache.wards.get(selectedDistrict)!
          setWards(cachedWards)
          return
        }
        
        setLoading(prev => ({ ...prev, wards: true }))
        try {
          const response = await fetch(`${API_BASE}/d/${selectedDistrict}?depth=2`)
          const districtData = await response.json()
          const wardData = districtData.wards || []
          cache.wards.set(selectedDistrict, wardData)
          setWards(wardData)
        } catch (error) {
          console.error('Error loading wards:', error)
          setWards([])
        } finally {
          setLoading(prev => ({ ...prev, wards: false }))
        }
      } else {
        setWards([])
        setSelectedWard('')
      }
    }
    loadWards()
  }, [selectedDistrict])

  // Notify parent when address changes
  useEffect(() => {
    if (selectedProvince && selectedDistrict && selectedWard) {
      const province = provinces.find(p => p.code.toString() === selectedProvince)
      const district = districts.find(d => d.code.toString() === selectedDistrict)
      const ward = wards.find(w => w.code.toString() === selectedWard)
      
      if (province && district && ward) {
        onAddressChange({
          province: province.name,
          district: district.name,
          ward: ward.name,
          provinceCode: selectedProvince,
          districtCode: selectedDistrict,
          wardCode: selectedWard
        })
      }
    }
  }, [selectedProvince, selectedDistrict, selectedWard, districts, wards, provinces])

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        {showLabels && <Label>Tỉnh/Thành phố *</Label>}
        <Select value={selectedProvince} onValueChange={setSelectedProvince}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Chọn tỉnh/thành phố" />
            {loading.provinces && <Loader2 className="h-4 w-4 animate-spin" />}
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
        {showLabels && <Label>Quận/Huyện *</Label>}
        <Select 
          value={selectedDistrict} 
          onValueChange={setSelectedDistrict}
          disabled={!selectedProvince || loading.districts}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Chọn quận/huyện" />
            {loading.districts && <Loader2 className="h-4 w-4 animate-spin" />}
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
        {showLabels && <Label>Phường/Xã *</Label>}
        <Select 
          value={selectedWard} 
          onValueChange={setSelectedWard}
          disabled={!selectedDistrict || loading.wards}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Chọn phường/xã" />
            {loading.wards && <Loader2 className="h-4 w-4 animate-spin" />}
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

export default VietnamAddressSelect