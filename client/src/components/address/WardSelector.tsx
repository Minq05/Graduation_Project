import { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

interface Ward {
  code: string
  name: string
  district_code: string
}

interface WardSelectorProps {
  districtCode?: string
  value?: string
  onChange: (code: string, name: string) => void
}

export const WardSelector = ({ districtCode, value, onChange }: WardSelectorProps) => {
  const [wards, setWards] = useState<Ward[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (districtCode) {
      fetchWards(districtCode)
    } else {
      setWards([])
    }
  }, [districtCode])



  const fetchWards = async (code: string) => {
    setLoading(true)
    try {
      const response = await fetch(`https://provinces.open-api.vn/api/d/${code}?depth=2`)
      const data = await response.json()
      setWards(data.wards || [])
    } catch (error) {
      console.error('Error fetching wards:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleValueChange = (code: string) => {
    const ward = wards.find(w => w.code === code)
    if (ward) {
      onChange(code, ward.name)
    }
  }

  return (
    <Select 
      value={value} 
      onValueChange={handleValueChange}
      disabled={!districtCode}
    >
      <SelectTrigger>
        <SelectValue placeholder={
          !districtCode ? "Chọn quận/huyện trước" :
          loading ? "Đang tải..." : 
          "Chọn phường/xã"
        } />
      </SelectTrigger>
      <SelectContent>
        {loading ? (
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
  )
}