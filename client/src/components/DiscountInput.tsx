import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrencyVND } from '@/utils/utils'
import { applyDiscountAPI } from '@/services/discount-service/discount.apis'
import { toast } from 'react-toastify'

interface DiscountInputProps {
  orderValue: number
  cartItems: any[]
  onDiscountApplied: (discount: any) => void
  appliedDiscount: any
}

export default function DiscountInput({ orderValue, cartItems, onDiscountApplied, appliedDiscount }: DiscountInputProps) {
  const [couponCode, setCouponCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleApplyDiscount = async () => {
    if (!couponCode.trim()) return
    
    setIsLoading(true)
    try {
      const response = await applyDiscountAPI(couponCode, orderValue)
      if (response && response.data) {
        onDiscountApplied(response.data)
        toast.success('Áp dụng mã giảm giá thành công!')
      }
    } catch (error: any) {
      toast.error(error.message || 'Mã giảm giá không hợp lệ')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveDiscount = () => {
    onDiscountApplied(null)
    setCouponCode('')
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-[#333333]">Mã giảm giá</h3>
      
      {appliedDiscount ? (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium text-green-800">Mã: {appliedDiscount.discount.code}</p>
              <p className="text-sm text-green-600">{appliedDiscount.discount.description}</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRemoveDiscount}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              Xóa
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex space-x-2">
          <Input
            placeholder="Nhập mã giảm giá"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            className="flex-1"
          />
          <Button 
            onClick={handleApplyDiscount}
            disabled={isLoading || !couponCode.trim()}
            className="bg-[#8a33fd] hover:bg-[#6639a6] text-white"
          >
            {isLoading ? 'Đang áp dụng...' : 'Áp dụng'}
          </Button>
        </div>
      )}
    </div>
  )
}