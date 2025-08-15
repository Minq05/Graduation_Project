import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useLocation } from 'react-router'
import { formatCurrencyVND } from '@/utils/utils'
import { IApplyDiscountResponse } from '@/services/discount-service/discount.apis'
import { CheckoutDiscount } from '@/components/discount/checkout-discount'
import { AddressSelector, AddressData } from '@/components/address/AddressSelector'
import { calculateShippingFee, getEstimatedDeliveryTime, type ShippingMethod } from '@/services/shipping-service/shipping-calculator'
import { Loader2 } from 'lucide-react'

const CheckoutShipping = () => {
  const location = useLocation()
  const { appliedDiscount: initialDiscount, subtotal: initialSubtotal, cartItems: initialCartItems = [] } = location.state || {}
  const [appliedDiscount, setAppliedDiscount] = useState<IApplyDiscountResponse | null>(initialDiscount || null)
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [addressType, setAddressType] = useState<'same' | 'different'>('same')
  const [addressData, setAddressData] = useState<AddressData | null>(null)
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('standard')
  
  // Tính phí vận chuyển
  const shippingFee = addressData?.provinceName ? 
    calculateShippingFee(addressData.provinceName, shippingMethod) : 0
  
  // Thời gian giao hàng ước tính
  const estimatedDeliveryTime = addressData?.provinceName ? 
    getEstimatedDeliveryTime(addressData.provinceName, shippingMethod) : '2-3 ngày'
  
  const subtotal = initialSubtotal || 0
  const discountAmount = appliedDiscount?.discountAmount || 0
  const total = subtotal + shippingFee - discountAmount

  // Kiểm tra địa chỉ có hợp lệ không
  const isAddressValid = () => {
    if (addressType === 'same') return true;
    
    return !!(
      addressData?.fullName &&
      addressData?.phone &&
      addressData?.provinceName &&
      addressData?.districtName &&
      addressData?.wardName &&
      addressData?.address
    );
  };

  return (
    <div className='bg-gray-50 py-8'>
      <div className='max-w-3xl mx-auto px-4 sm:px-6 lg:px-8'>
        <form className='space-y-8'>
          {/* Shipping Address Section */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg font-semibold text-gray-900'>Địa chỉ giao hàng</CardTitle>
              <p className='text-sm text-gray-600'>Chọn địa chỉ phù hợp với thẻ hoặc phương thức thanh toán của bạn.</p>
            </CardHeader>
            <CardContent>
              <RadioGroup 
                value={addressType} 
                onValueChange={(value) => setAddressType(value as 'same' | 'different')} 
                className='space-y-4'
              >
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='same' id='same' />
                  <Label htmlFor='same' className='font-medium cursor-pointer'>
                    Giống với địa chỉ thanh toán
                  </Label>
                </div>
                <div className='flex items-center space-x-2'>
                  <RadioGroupItem value='different' id='different' />
                  <Label htmlFor='different' className='font-medium cursor-pointer'>
                    Sử dụng địa chỉ giao hàng khác
                  </Label>
                </div>
              </RadioGroup>
              
              {addressType === 'different' && (
                <div className='mt-4 border p-4 rounded-md bg-gray-50'>
                  <h3 className='font-medium mb-3'>Thông tin địa chỉ giao hàng</h3>
                  <AddressSelector onChange={setAddressData} />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Shipping Method Section - Chỉ hiển thị khi đã chọn địa chỉ */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg font-semibold text-gray-900'>Phương thức vận chuyển</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              {!isAddressValid() ? (
                <div className="p-4 bg-yellow-50 text-yellow-700 rounded-md border border-yellow-200">
                  <p className="font-medium">Vui lòng chọn địa chỉ giao hàng trước</p>
                  <p className="text-sm mt-1">Các phương thức vận chuyển và phí ship sẽ được hiển thị sau khi bạn chọn địa chỉ.</p>
                </div>
              ) : (
                <div>
                  <Label htmlFor="shippingMethod">Chọn phương thức vận chuyển</Label>
                  <Select value={shippingMethod} onValueChange={setShippingMethod}>
                    <SelectTrigger id="shippingMethod" className="mt-1 w-full">
                      <SelectValue placeholder="Chọn phương thức vận chuyển" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">
                        Giao hàng tiêu chuẩn ({getEstimatedDeliveryTime(addressData?.provinceName || '', 'standard')}) - 
                        {formatCurrencyVND(calculateShippingFee(addressData?.provinceName || '', 'standard'))}
                      </SelectItem>
                      <SelectItem value="express-ghn">
                        Giao hàng nhanh - GHN ({getEstimatedDeliveryTime(addressData?.provinceName || '', 'express-ghn')}) - 
                        {formatCurrencyVND(calculateShippingFee(addressData?.provinceName || '', 'express-ghn'))}
                      </SelectItem>
                      <SelectItem value="express">
                        Giao hàng hỏa tốc ({getEstimatedDeliveryTime(addressData?.provinceName || '', 'express')}) - 
                        {formatCurrencyVND(calculateShippingFee(addressData?.provinceName || '', 'express'))}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {addressData?.provinceName && (
                    <div className="mt-2 text-sm text-gray-600">
                      Phí vận chuyển được tính dựa trên khoảng cách đến {addressData.provinceName}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Method Section */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg font-semibold text-gray-900'>Phương thức thanh toán</CardTitle>
              <p className='text-sm text-gray-600'>Tất cả giao dịch đều được bảo mật và mã hóa.</p>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div>
                <Label htmlFor="paymentMethod">Chọn phương thức thanh toán</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger id="paymentMethod" className="mt-1 w-full">
                    <SelectValue placeholder="Chọn phương thức thanh toán" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="momo">Thanh toán MoMo</SelectItem>
                    <SelectItem value="vnpay">Thanh toán VNPay</SelectItem>
                    <SelectItem value="cash">Thanh toán khi nhận hàng</SelectItem>
                  </SelectContent>
                </Select>
                
                {paymentMethod === 'momo' && (
                  <div className='mt-3 p-3 bg-gray-50 rounded-md'>
                    <p className='text-sm text-gray-600'>Quét mã QR hoặc đăng nhập MoMo để thanh toán.</p>
                  </div>
                )}
                
                {paymentMethod === 'vnpay' && (
                  <div className='mt-3 p-3 bg-gray-50 rounded-md'>
                    <p className='text-sm text-gray-600'>Bạn sẽ được chuyển đến cổng thanh toán VNPay.</p>
                  </div>
                )}
                
                {paymentMethod === 'cash' && (
                  <div className='mt-3 p-3 bg-gray-50 rounded-md'>
                    <p className='text-sm text-gray-600'>Thanh toán bằng tiền mặt khi nhận hàng.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Discount Section */}
          <CheckoutDiscount
            appliedDiscount={appliedDiscount}
            subtotal={subtotal}
            onDiscountChange={setAppliedDiscount}
          />

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg font-semibold text-gray-900'>Tổng kết đơn hàng</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='flex justify-between'>
                <span>Tạm tính:</span>
                <span>{formatCurrencyVND(subtotal)}</span>
              </div>
              <div className='flex justify-between'>
                <span>Phí vận chuyển:</span>
                <span>
                  {!isAddressValid() ? (
                    <span className="text-yellow-600 italic">Chưa xác định</span>
                  ) : (
                    formatCurrencyVND(shippingFee)
                  )}
                </span>
              </div>
              {appliedDiscount && (
                <div className='flex justify-between text-green-600'>
                  <span>Giảm giá ({appliedDiscount.discount.code}):</span>
                  <span>-{formatCurrencyVND(discountAmount)}</span>
                </div>
              )}
              <Separator className='h-px bg-gray-200' />
              <div className='flex justify-between font-semibold text-lg'>
                <span>Tổng cộng:</span>
                <span>{formatCurrencyVND(total)}</span>
              </div>
            </CardContent>
          </Card>

          <Button
            type='submit'
            className='w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-lg font-semibold h-12'
            disabled={!isAddressValid()}
          >
            {!isAddressValid() ? 'Vui lòng chọn địa chỉ giao hàng' : 'Thanh toán ngay'}
          </Button>
        </form>
      </div>
    </div>
  )
}
export default CheckoutShipping