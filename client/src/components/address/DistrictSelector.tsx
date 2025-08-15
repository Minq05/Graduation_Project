import { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

interface District {
  code: string
  name: string
  province_code: string
}

interface DistrictSelectorProps {
  provinceCode?: string
  value?: string
  onChange: (code: string, name: string) => void
}

export const DistrictSelector = ({ provinceCode, value, onChange }: DistrictSelectorProps) => {
  const [districts, setDistricts] = useState<District[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (provinceCode) {
      fetchDistricts(provinceCode)
    } else {
      setDistricts([])
    }
  }, [provinceCode])



  const fetchDistricts = async (code: string) => {
    setLoading(true)
    try {
      const response = await fetch(`https://provinces.open-api.vn/api/p/${code}?depth=2`)
      const data = await response.json()
      setDistricts(data.districts || [])
    } catch (error) {
      console.error('Error fetching districts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleValueChange = (code: string) => {
    const district = districts.find(d => d.code === code)
    if (district) {
      onChange(code, district.name)
    }
  }

  return (
    <Select 
      value={value} 
      onValueChange={handleValueChange}
      disabled={!provinceCode}
    >
      <SelectTrigger>
        <SelectValue placeholder={
          !provinceCode ? "Chọn tỉnh/thành phố trước" :
          loading ? "Đang tải..." : 
          "Chọn quận/huyện"
        } />
      </SelectTrigger>
      <SelectContent>
        {loading ? (
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
  )
}