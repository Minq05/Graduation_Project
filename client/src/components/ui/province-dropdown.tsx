import { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface ProvinceDropdownProps {
  value?: string
  onValueChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

const ProvinceDropdown = ({ 
  value, 
  onValueChange, 
  placeholder = "Chọn tỉnh/thành phố",
  disabled = false,
  className = ""
}: ProvinceDropdownProps) => {
  const [provinces, setProvinces] = useState<any[]>([])

  useEffect(() => {
    const loadProvinces = async () => {
      try {
        const response = await fetch('https://provinces.open-api.vn/api/p/')
        const provinceData = await response.json()
        setProvinces(provinceData)
      } catch (error) {
        console.error('Error loading provinces:', error)
      }
    }
    loadProvinces()
  }, [])

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={`w-full ${className}`}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {provinces.map((province) => (
          <SelectItem key={province.code} value={province.code.toString()}>
            {province.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default ProvinceDropdown