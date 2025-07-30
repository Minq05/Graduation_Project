import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CART_KEYS } from '@/services/cart-service/cart.keys'
import { deleteItemFromCartAPI, fetchInfoCartAPI, ICartItem, updateCartItemAPI } from '@/services/cart-service/cart.apis'
import { useAppSelector } from '@/redux/hooks'
import { formatCurrencyVND } from '@/utils/utils'
import { toast } from 'react-toastify'
import DiscountInput from '@/components/DiscountInput'

export default function ShoppingCartPage() {
  const queryClient = useQueryClient()
  const [couponCode, setCouponCode] = useState('')
  const [appliedDiscount, setAppliedDiscount] = useState(null)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const navigate = useNavigate()
  const cartId = useAppSelector((state) => state.cart.IdCartUser)

  const updateQuantityCartMutation = useMutation({
    mutationFn: async ({ cartId, cartItemId, newQuantity }: { cartId: string; cartItemId: string; newQuantity: number }) => {
      const res = await updateCartItemAPI(cartId, cartItemId, newQuantity)
      if (res && res.data) {
        return res.data
      } else {
        toast.error(res.message)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CART_KEYS.FETCH_LIST_CART] })
    }
  })

  const deleteItemFromCartMutation = useMutation({
    mutationFn: async ({ cartId, itemId }: { cartId: string; itemId: string }) => {
      const res = await deleteItemFromCartAPI(cartId, itemId)
      if (res && res.data) {
        toast.success('Đã xóa sản phẩm khỏi giỏ hàng')
        return res.data
      } else {
        throw new Error('Failed to delete cart item')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CART_KEYS.FETCH_LIST_CART] })
    }
  })

  const { data: listProductsCart } = useQuery({
    queryKey: [CART_KEYS.FETCH_LIST_CART],
    queryFn: async () => {
      const res = await fetchInfoCartAPI(cartId as string)
      if (res && res.data) {
        return res.data
      } else {
        return []
      }
    }
  })

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return
    updateQuantityCartMutation.mutate({ cartId: cartId || '', cartItemId: id, newQuantity })
  }

  const removeItem = (id: string) => {
    deleteItemFromCartMutation.mutate({ cartId: cartId || '', itemId: id })
  }

  // Checkbox handlers
  const cartItems = listProductsCart || []
  const allSelected = cartItems.length > 0 && selectedItems.length === cartItems.length
  const handleSelectItem = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    )
  }
  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedItems([])
    } else {
      setSelectedItems(cartItems.map((item) => item._id))
    }
  }

  // Tính tổng chỉ cho sản phẩm đã chọn
  const selectedCartItems = cartItems.filter(item => selectedItems.includes(item._id))
  const subtotal = selectedCartItems.reduce((sum: number, item: ICartItem) => sum + (item.variantId?.price || 0) * item.quantity, 0)
  const shippingFee = selectedCartItems.length > 0 ? 30000 : 0 // Chỉ tính phí ship nếu có sản phẩm chọn
  const discountAmount = appliedDiscount?.discountAmount || 0
  const total = subtotal + shippingFee - discountAmount


  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center space-x-2 text-sm text-[#807d7e]">
          <Link to="/" className="hover:text-[#333333]">
            Trang chủ
          </Link>
          <span>›</span>
          <span className="text-[#333333]">Thêm vào giỏ hàng</span>
        </div>
      </div>

      {/* Cart Table */}
      <div className="max-w-7xl mx-auto px-4 mb-8">
        <div className="bg-[#3c4242] text-white">
          <div className="grid grid-cols-13 gap-4 p-4 text-sm font-medium">
            <div className="col-span-1 flex items-center">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={handleSelectAll}
                className="w-4 h-4"
                aria-label="Chọn tất cả"
              />
            </div>
            <div className="col-span-4">CHI TIẾT</div>
            <div className="col-span-2">GIÁ</div>
            <div className="col-span-2">SỐ LƯỢNG</div>
            <div className="col-span-2">TỔNG CỘNG</div>
            <div className="col-span-2">HÀNH ĐỘNG</div>
          </div>
        </div>

        {cartItems.map((item: ICartItem) => (
          <div key={item._id} className="border-b border-[#f3f3f3] p-4">
            <div className="grid grid-cols-13 gap-4 items-center">
              <div className="col-span-1 flex items-center">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item._id)}
                  onChange={() => handleSelectItem(item._id)}
                  className="w-4 h-4"
                  aria-label="Chọn sản phẩm"
                />
              </div>
              <div className="col-span-4 flex items-center space-x-4">
                <img
                  src={item.variantId?.image ? `http://localhost:8080${item.variantId?.image}` : `${item.productId.image[0]}`}
                  alt={item.productId.name}
                  width={80}
                  height={80}
                  className="rounded-lg bg-[#f6f6f6]"
                  crossOrigin='anonymous'
                />
                <div>
                  <h3 className="font-medium text-[#333333] cursor-pointer" onClick={() => navigate(`/productDetail/${item.productId._id}`)}>{item.productId.name}</h3>
                  <p className="text-sm text-[#807d7e]">Mã sản phẩm: {item.variantId?.sku}</p>
                  <p className="text-sm text-[#807d7e]">Dung tích: {item.value} ml</p>
                </div>
              </div>

              <div className="col-span-2">
                <span className="font-medium text-[#333333]">{formatCurrencyVND(item.variantId?.price || 0)}</span>
              </div>

              <div className="col-span-2">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-8 h-8"
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-8 h-8"
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="col-span-2">
                <span className="font-medium text-[#333333]">{formatCurrencyVND(item.variantId?.price * item.quantity)}</span>
              </div>

              <div className="col-span-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-[#8a33fd] hover:text-[#6639a6]"
                  onClick={() => removeItem(item._id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Section */}
      <div className="max-w-7xl mx-auto px-4 mb-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Discount Codes */}
          <div>
            <DiscountInput
              orderValue={subtotal}
              cartItems={selectedCartItems}
              onDiscountApplied={setAppliedDiscount}
              appliedDiscount={appliedDiscount}
            />
            <Button variant="outline" className="mt-4">
              Tiếp tục mua sắm
            </Button>
          </div>

          {/* Order Summary */}
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-[#333333]">Tạm tính</span>
              <span className="font-medium text-[#333333]">
                {formatCurrencyVND(subtotal)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#333333]">Phí ship</span>
              <span className="font-medium text-[#333333]">{formatCurrencyVND(shippingFee)}</span>
            </div>
            {appliedDiscount && (
              <div className="flex justify-between text-green-600">
                <span>Giảm giá ({appliedDiscount.discount.code})</span>
                <span className="font-medium">-{formatCurrencyVND(discountAmount)}</span>
              </div>
            )}
            <div className="border-t pt-4">
              <div className="flex justify-between">
                <span className="text-lg font-medium text-[#333333]">Tổng cộng</span>
                <span className="text-lg font-medium text-[#333333]">
                  {formatCurrencyVND(total)}
                </span>
              </div>
            </div>
            <Button 
              className="w-full bg-[#8a33fd] hover:bg-[#6639a6] text-white py-3" 
              onClick={() => {
                if (selectedCartItems.length === 0) {
                  toast.warning('Vui lòng chọn sản phẩm để thanh toán!')
                  return
                }
                navigate('/checkout', { state: { appliedDiscount, selectedCartItems } })
              }}
            >
              Thanh toán
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
