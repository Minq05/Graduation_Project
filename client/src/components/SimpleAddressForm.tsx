import { useState } from 'react'
import { useAppSelector } from '@/redux/hooks'
import { createAddressAPI } from '@/services/user-service/user.apis'
import { toast } from 'react-toastify'
import AddressSelector from '@/components/ui/address-selector'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

const SimpleAddressForm = () => {
  const [formData, setFormData] = useState({
    province: '',
    district: '',
    ward: '',
    address: ''
  })
  const [addressSelected, setAddressSelected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const user = useAppSelector(state => state.auth.user)

  const handleAddressChange = (addressData: {
    province: string
    district: string
    ward: string
    provinceCode?: string
    districtCode?: string
    wardCode?: string
  }) => {
    setFormData(prev => ({
      ...prev,
      province: addressData.province,
      district: addressData.district,
      ward: addressData.ward
    }))
    setAddressSelected(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user?._id) {
      toast.error('Vui lòng đăng nhập')
      return
    }

    if (!addressSelected || !formData.province || !formData.district || !formData.ward) {
      toast.error('Vui lòng chọn đầy đủ địa chỉ')
      return
    }
    
    if (!formData.address.trim()) {
      toast.error('Vui lòng nhập địa chỉ chi tiết')
      return
    }

    setIsLoading(true)
    
    try {
      const addressData = {
        province: formData.province,
        district: formData.district,
        ward: formData.ward,
        address: formData.address,
        isPrimary: false
      }
      
      await createAddressAPI(user._id, addressData)
      toast.success('Thêm địa chỉ thành công!')
      
      // Reset form
      setFormData({
        province: '',
        district: '',
        ward: '',
        address: ''
      })
      setAddressSelected(false)
      
    } catch (error: any) {
      console.error('Lỗi:', error)
      toast.error('Có lỗi xảy ra')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4 p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Thêm địa chỉ mới</h2>
      
      <AddressSelector onAddressChange={handleAddressChange} />

      <div>
        <Label htmlFor="address">Địa chỉ chi tiết *</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
          placeholder="Số nhà, tên đường..."
        />
      </div>

      <Button 
        type="submit" 
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? 'Đang lưu...' : 'Lưu địa chỉ'}
      </Button>
    </form>
  )
}

export default SimpleAddressForm