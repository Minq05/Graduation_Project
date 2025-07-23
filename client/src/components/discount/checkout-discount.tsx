import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DiscountInput } from './discount-input'
import { IApplyDiscountResponse } from '@/services/discount-service/discount.apis'
import { formatCurrencyVND } from '@/utils/utils'

interface CheckoutDiscountProps {
  appliedDiscount?: IApplyDiscountResponse | null
  subtotal: number
  cartItems?: Array<{
    productId: string
    variantId?: string
    categoryId?: string
  }>
  onDiscountChange: (discount: IApplyDiscountResponse | null) => void
}

export const CheckoutDiscount = ({ 
  appliedDiscount, 
  subtotal, 
  cartItems, 
  onDiscountChange 
}: CheckoutDiscountProps) => {
  const [showDiscountInput, setShowDiscountInput] = useState(!appliedDiscount)

  const handleDiscountApplied = (discount: IApplyDiscountResponse | null) => {
    onDiscountChange(discount)
    if (discount) {
      setShowDiscountInput(false)
    }
  }

  const handleChangeDiscount = () => {
    setShowDiscountInput(true)
    onDiscountChange(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-lg font-semibold text-gray-900'>Mã giảm giá</CardTitle>
      </CardHeader>
      <CardContent>
        {appliedDiscount && !showDiscountInput ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div>
                <p className="font-medium text-green-800">{appliedDiscount.discount.code}</p>
                <p className="text-sm text-green-600">{appliedDiscount.discount.description}</p>
                <p className="text-sm text-green-600">
                  Giảm: {formatCurrencyVND(appliedDiscount.discountAmount)}
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleChangeDiscount}
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                Thay đổi
              </Button>
            </div>
          </div>
        ) : (
          <DiscountInput
            orderValue={subtotal}
            cartItems={cartItems}
            onDiscountApplied={handleDiscountApplied}
            appliedDiscount={null}
          />
        )}
      </CardContent>
    </Card>
  )
}