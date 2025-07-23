import { useSelectedCart } from '@/hooks/useSelectedCart'
import { formatCurrencyVND } from '@/utils/utils'

interface SelectedCartInfoProps {
  cartItems: any[]
}

export const SelectedCartInfo = ({ cartItems }: SelectedCartInfoProps) => {
  const { selectedItems, getSelectedCartItems, calculateSelectedTotal } = useSelectedCart()
  
  const selectedCartItems = getSelectedCartItems(cartItems)
  const selectedTotal = calculateSelectedTotal(cartItems)
  
  if (selectedItems.length === 0) {
    return (
      <div className="text-sm text-gray-500 mb-2">
        Chưa chọn sản phẩm nào
      </div>
    )
  }
  
  return (
    <div className="text-sm text-gray-600 mb-2">
      Đã chọn {selectedItems.length} sản phẩm - Tổng: {formatCurrencyVND(selectedTotal)}
    </div>
  )
}