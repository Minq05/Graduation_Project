import { useAppSelector } from '@/redux/hooks'

export const useSelectedCart = () => {
  const selectedItems = useAppSelector((state) => state.cart.selectedItems)
  
  const getSelectedCartItems = (allCartItems: any[]) => {
    return allCartItems.filter(item => selectedItems.includes(item._id))
  }
  
  const calculateSelectedTotal = (allCartItems: any[]) => {
    const selectedCartItems = getSelectedCartItems(allCartItems)
    return selectedCartItems.reduce((sum, item) => sum + (item.variantId?.price || 0) * item.quantity, 0)
  }
  
  const getSelectedItemsCount = () => selectedItems.length
  
  return {
    selectedItems,
    getSelectedCartItems,
    calculateSelectedTotal,
    getSelectedItemsCount
  }
}