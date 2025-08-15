import { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

interface Province {
  code: string
  name: string
}

interface ProvinceSelectorProps {
  value?: string
  onChange: (code: string, name: string) => void
}

export const ProvinceSelector = ({ value, onChange }: ProvinceSelectorProps) => {
  const [provinces, setProvinces] = useState<Province[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchProvinces()
  }, [])



  const fetchProvinces = async () => {
    setLoading(true)
    try {
      const response = await fetch('https://provinces.open-api.vn/api/p/')
      const data = await response.json()
      setProvinces(data)
    } catch (error) {
      console.error('Error fetching provinces:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleValueChange = (code: string) => {
    const province = provinces.find(p => p.code === code)
    if (province) {
      onChange(code, province.name)
    }
  }

  return (
    <Select value={value} onValueChange={handleValueChange}>
      <SelectTrigger>
        <SelectValue placeholder={loading ? "Đang tải..." : "Chọn tỉnh/thành phố"} />
      </SelectTrigger>
      <SelectContent>
        {loading ? (
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
  )
}