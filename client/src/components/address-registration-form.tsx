import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import AddressSelector from '@/components/ui/address-selector'
import { toast } from 'react-toastify'
import { useAppSelector } from '@/redux/hooks'
import { createAddressAPI } from '@/services/user-service/user.apis'

interface AddressData {
  province: string
  district: string
  ward: string
  provinceCode?: string
  districtCode?: string
  wardCode?: string
}

const AddressRegistrationForm = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    address: {
      province: '',
      district: '',
      ward: '',
      provinceCode: '',
      districtCode: '',
      wardCode: ''
    },
    detailAddress: ''
  })
  const [addressSelected, setAddressSelected] = useState(false)

  const handleAddressChange = (addressData: AddressData) => {
    setFormData(prev => ({
      ...prev,
      address: addressData
    }))
    setAddressSelected(true)
  }

  const [isLoading, setIsLoading] = useState(false)
  const user = useAppSelector(state => state.auth.user)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('User:', user)
    console.log('Form data:', formData)
    
    if (!user?._id) {
      toast.error('Vui lòng đăng nhập để thêm địa chỉ')
      return
    }
    
    // Validation
    if (!formData.fullName.trim()) {
      toast.error('Vui lòng nhập họ tên')
      return
    }
    
    if (!formData.phoneNumber.trim()) {
      toast.error('Vui lòng nhập số điện thoại')
      return
    }
    
    if (!addressSelected || !formData.address.province || !formData.address.district || !formData.address.ward) {
      toast.error('Vui lòng chọn đầy đủ địa chỉ')
      return
    }
    
    if (!formData.detailAddress.trim()) {
      toast.error('Vui lòng nhập địa chỉ chi tiết')
      return
    }

    setIsLoading(true)
    
    try {
      const addressData = {
        province: formData.address.province,
        district: formData.address.district,
        ward: formData.address.ward,
        address: formData.detailAddress,
        isPrimary: false
      }
      
      console.log('Sending address data:', addressData)
      console.log('User ID:', user._id)
      
      const result = await createAddressAPI(user._id, addressData)
      console.log('API result:', result)
      
      toast.success('Thêm địa chỉ thành công!')
      
      // Reset form
      setFormData({
        fullName: '',
        phoneNumber: '',
        address: {
          province: '',
          district: '',
          ward: '',
          provinceCode: '',
          districtCode: '',
          wardCode: ''
        },
        detailAddress: ''
      })
      setAddressSelected(false)
      
    } catch (error: any) {
      console.error('Lỗi khi thêm địa chỉ:', error)
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi thêm địa chỉ')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4 p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Đăng ký địa chỉ</h2>
      
      <div>
        <Label htmlFor="fullName">Họ và tên *</Label>
        <Input
          id="fullName"
          value={formData.fullName}
          onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
          placeholder="Nhập họ và tên"
        />
      </div>

      <div>
        <Label htmlFor="phoneNumber">Số điện thoại *</Label>
        <Input
          id="phoneNumber"
          value={formData.phoneNumber}
          onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
          placeholder="Nhập số điện thoại"
        />
      </div>

      <AddressSelector onAddressChange={handleAddressChange} />

      <div>
        <Label htmlFor="detailAddress">Địa chỉ chi tiết *</Label>
        <Textarea
          id="detailAddress"
          value={formData.detailAddress}
          onChange={(e) => setFormData(prev => ({ ...prev, detailAddress: e.target.value }))}
          placeholder="Số nhà, tên đường..."
          rows={3}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Đang xử lý...' : 'Đăng ký địa chỉ'}
      </Button>
    </form>
  )
}

export default AddressRegistrationForm