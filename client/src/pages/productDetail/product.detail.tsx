import { ShoppingCartIcon } from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import '@/styles/product-detail.css'
import ProductReviews from '@/components/review/product-reviews'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { QuantityInput } from '@/components/quantity-input'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { PRODUCT_KEYS } from '@/services/product-service/product.keys'
import { useParams } from 'react-router'
import { fetchInfoProduct } from '@/services/product-service/product.apis'
import { formatCurrencyVND } from '@/utils/utils'
import { addToCartAPI } from '@/services/cart-service/cart.apis'
import { CART_KEYS } from '@/services/cart-service/cart.keys'
import { useAppSelector } from '@/redux/hooks'
import { toast } from 'react-toastify'
import { getFlashSaleProducts, checkFlashSaleLimit } from '@/services/flash-sale-service/flash-sale.apis'
import { FLASH_SALE_KEYS } from '@/services/flash-sale-service/flash-sale.keys'
import { useNavigate } from 'react-router'

const ProductDetail = () => {
  const [quantity, setQuantity] = useState(1)
  const [scents, setScents] = useState<{ id: string; name: string }[]>([])
  const [selectedScents, setSelectedScents] = useState<string | undefined>(scents[0]?.id)
  const [capacity, setCapacity] = useState<{ id: string; name: string; stock: number; variantId: string }[]>([])
  const [price, setPrice] = useState<number>(0)
  const [selectedVariant, setSelectedVariant] = useState<any>(null)
  const [currentStock, setCurrentStock] = useState<number>(0)
  const [selectedImage, setSelectedImage] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description')
  const [flashSaleInfo, setFlashSaleInfo] = useState<any>(null)
  const [flashSaleLimit, setFlashSaleLimit] = useState<any>(null)
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const cartId = useAppSelector((state) => state.cart.IdCartUser)
  const isSignin = useAppSelector((state) => state.auth.isSignin)

  const { data: product, isLoading, error } = useQuery({
    queryKey: [PRODUCT_KEYS.FETCH_INFO_PRODUCT, id],
    queryFn: async () => {
      const res = await fetchInfoProduct(id as string)
      if (res && res.data) {
        return res.data
      } else {
        toast.error('Sản phẩm không tồn tại hoặc đã bị xóa.')
        throw new Error('Product not found')
      }
    }
  })

  const { data: flashSaleProducts } = useQuery({
    queryKey: [FLASH_SALE_KEYS.FETCH_ACTIVE_PRODUCTS],
    queryFn: getFlashSaleProducts,
    select: (res) => {
      console.log('Flash Sale API response in product detail:', res)
      if (res && res.statusCode === 200 && res.data && Array.isArray(res.data)) {
        console.log('Flash Sale products loaded:', res.data)
        return res.data
      }
      return []
    }
  })

  console.log('Current flashSaleProducts:', flashSaleProducts)
  console.log('Current flashSaleInfo:', flashSaleInfo)

  useEffect(() => {
    if (product && product.variants) {
      const newCapacity = new Map<string, { id: string; name: string; stock: number; variantId: string }>()
      const newScents = new Map<string, { id: string; name: string }>()

      product.variants.forEach((variant) => {
        let capacityValue = ''
        variant.variant_attributes.forEach((attr) => {
          if (attr.attributeId.slug === 'dung-tich') {
            capacityValue = attr.value
            newCapacity.set(attr.value, {
              id: attr._id || '',
              name: attr.value,
              stock: variant.stock || 0,
              variantId: variant._id || ''
            })
          } else if (attr.attributeId.slug === 'mui-huong') {
            newScents.set(attr.value, { id: attr._id || '', name: attr.value })
          }
        })
      })

      setCapacity(Array.from(newCapacity.values()))
      setScents(Array.from(newScents.values()))
      // Đặt ảnh đầu tiên làm ảnh được chọn mặc định
      if (product.image && product.image.length > 0) {
        setSelectedImage(product.image[0])
      }
    }
  }, [product])

  // Kiểm tra giới hạn flash sale
  const checkFlashSaleLimitForQuantity = useCallback(async (qty: number) => {
    if (product && selectedVariant && flashSaleInfo) {
      try {
        const res = await checkFlashSaleLimit(product._id, selectedVariant._id, qty)
        if (res && res.data) {
          setFlashSaleLimit(res.data)
          return res.data
        }
      } catch (error) {
        console.error('Error checking flash sale limit:', error)
      }
    }
    return null
  }, [product, selectedVariant, flashSaleInfo])

  useEffect(() => {
    if (capacity.length > 0 && !selectedScents) {
      setSelectedScents(capacity[0].id)
    }
  }, [capacity, selectedScents])

  useEffect(() => {
    if (product && flashSaleProducts && selectedVariant) {
      console.log('=== FLASH SALE CHECK ===')
      console.log('Product ID:', product._id)
      console.log('Selected Variant ID:', selectedVariant._id)
      console.log('Flash Sale Products:', flashSaleProducts)
      
      const flashSaleItem = flashSaleProducts.find((item: any) => {
        console.log('Checking item:', item)
        console.log('Item product ID:', item.productId._id)
        console.log('Item variant ID:', item.variantId?._id)
        
        // Kiểm tra khớp cả product ID và variant ID
        const productMatch = item.productId._id === product._id
        const variantMatch = item.variantId && item.variantId._id === selectedVariant._id
        
        return productMatch && variantMatch
      })
      
      console.log('Found Flash Sale Item:', flashSaleItem)
      setFlashSaleInfo(flashSaleItem || null)
      
      // Kiểm tra giới hạn nếu có flash sale
      if (flashSaleItem && selectedVariant) {
        checkFlashSaleLimitForQuantity(quantity)
      }
    }
  }, [product, flashSaleProducts, selectedVariant, checkFlashSaleLimitForQuantity, quantity])

  useEffect(() => {
    if (product && product.variants && selectedScents) {
      const variant = product.variants.find((variant) =>
        variant.variant_attributes.some((attr) => attr._id === selectedScents)
      )
      if (variant) {
        setSelectedVariant(variant)
        const basePrice = variant.price || 0
        const discount = variant.discount || 0
        setPrice(basePrice - discount)
        setCurrentStock(variant.stock || 0)
        setQuantity(1)
      }
    }
  }, [selectedScents, product])


  const handleSelectedScents = (id: string, variantId: string, stock: number) => {
    setSelectedScents(id)
    setCurrentStock(stock)
    setQuantity(1)

    if (product && product.variants) {
      const variant = product.variants.find(v => v._id === variantId)
      if (variant) {
        setSelectedVariant(variant)
        const basePrice = variant.price || 0
        const discount = variant.discount || 0
        setPrice(basePrice - discount)
      }
    }
  }

  const addToCartMutation = useMutation({
    mutationFn: async ({ variantId, quantity }: { variantId: string; quantity: number }) => {
      const res = await addToCartAPI(cartId || '', product?._id || '', variantId, quantity)
      if (res && res.data) {
        return res.data
      } else {
        throw new Error(res.message as string)
      }
    },
    onSuccess: () => {
      toast.success('Thêm sản phẩm vào giỏ hàng thành công!')
      queryClient.invalidateQueries({ queryKey: [CART_KEYS.FETCH_CART_INFO, cartId] })
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })

  const handleAddToCart = () => {
    // Kiểm tra đăng nhập trước
    if (!isSignin) {
      toast.error('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng')
      navigate('/signin')
      return
    }
    
    if (product && product.variants && selectedScents) {
      if (selectedVariant) {
        // Kiểm tra tồn kho trước khi thêm vào giỏ hàng
        if (currentStock <= 0) {
          toast.error('Sản phẩm đã hết hàng!')
          return
        }
        // Kiểm tra số lượng
        if (quantity > currentStock) {
          toast.warning(`Chỉ còn ${currentStock} sản phẩm trong kho`)
          setQuantity(currentStock)
          return
        }
        addToCartMutation.mutate({ variantId: selectedVariant._id || '', quantity })
      } else {
        toast.error('Bạn chưa chọn biến thể nào.')
      }
    }
  }


  if (isLoading) {
    return (
      <div className="bg-white flex flex-row justify-center w-full">
        <div className="bg-white overflow-hidden w-full max-w-[1440px] relative">
          <div className="flex items-center justify-center h-96 mt-[108px]">
            <div className="text-lg text-[#807d7e]">Loading product...</div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white flex flex-row justify-center w-full">
        <div className="bg-white overflow-hidden w-full max-w-[1440px] relative">
          <div className="flex items-center justify-center h-96 mt-[108px]">
            <div className="text-lg text-red-500">Error loading product</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white flex flex-row justify-center w-full">
      <div className="bg-white overflow-hidden w-full max-w-[1440px] relative px-4 md:px-8">
        {/* Breadcrumb */}
        <div className="py-4 mt-[80px]">
          <Breadcrumb>
            <BreadcrumbList className="flex items-center gap-2">
              <BreadcrumbItem>
                <BreadcrumbLink href="/" className="font-medium text-gray-500 hover:text-purple-600 transition-colors text-sm">
                  Trang chủ
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="m9 18 6-6-6-6"/></svg>
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink href="/shops" className="font-medium text-gray-500 hover:text-purple-600 transition-colors text-sm capitalize">
                  {product?.categoryId?.name || 'Danh mục'}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="m9 18 6-6-6-6"/></svg>
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink className="font-medium text-purple-600 text-sm">
                  {product?.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 py-6">
          {/* Product Images */}
          <div className="lg:col-span-7 flex flex-col md:flex-row gap-4">
            <div className="flex md:flex-col gap-2 order-2 md:order-1">
              {product?.image && product?.image.length > 0 && product?.image.map((img: string, index: number) => (
                <div
                  key={index}
                  className={`w-16 h-16 md:w-20 md:h-20 rounded-lg border overflow-hidden cursor-pointer transition-colors ${selectedImage === img ? 'border-purple-500 ring-2 ring-purple-200' : 'border-gray-200 hover:border-purple-500'}`}
                  onClick={() => setSelectedImage(img)}
                >
                  <img
                    className="w-full h-full object-cover"
                    alt={`${product?.name} thumbnail ${index + 1}`}
                    src={img}
                    crossOrigin='anonymous'
                  />
                </div>
              ))}
            </div>

            <div className="flex-1 rounded-xl overflow-hidden border border-gray-100 order-1 md:order-2">
              <img
                className="w-full h-auto object-cover aspect-square"
                alt={product?.name}
                src={selectedImage || product?.image?.[0]}
                crossOrigin='anonymous'
              />
            </div>
          </div>

          {/* Product Details */}
          <div className="lg:col-span-5 flex flex-col">
            {/* Brand & Title */}
            <div className="mb-4">
              <div className="text-sm font-medium text-purple-600 mb-2">{product?.brandId?.name || 'Thương hiệu'}</div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{product?.name}</h1>
              {/* Price */}
              <div className="flex items-center gap-3 mt-2">
                {flashSaleInfo && selectedVariant && quantity <= (flashSaleLimit?.remainingQuantity || 0) ? (
                  <>
                    <span className="text-2xl font-bold text-red-600">
                      {formatCurrencyVND(selectedVariant.price * (1 - flashSaleInfo.discountPercent / 100))}
                    </span>
                    <span className="text-lg text-gray-500 line-through">
                      {formatCurrencyVND(selectedVariant.price)}
                    </span>
                    <span className="bg-red-500 text-white px-2 py-1 rounded text-sm font-medium">
                      -{flashSaleInfo.discountPercent}%
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-2xl font-bold text-gray-900">
                      {formatCurrencyVND(price)}
                    </span>
                    {selectedVariant?.discount > 0 && (
                      <span className="text-lg text-gray-500 line-through">
                        {formatCurrencyVND(selectedVariant?.price || 0)}
                      </span>
                    )}
                  </>
                )}
              </div>
              
              {flashSaleInfo && selectedVariant && (
                <div className="mt-2 flex items-center gap-2">
                  {quantity <= (flashSaleLimit?.remainingQuantity || 0) ? (
                    <>
                      <span className="text-red-600 text-sm font-medium">⚡ Flash Sale</span>
                      <span className="text-green-600 text-sm">
                        Tiết kiệm {formatCurrencyVND(selectedVariant.price * flashSaleInfo.discountPercent / 100)}
                      </span>
                    </>
                  ) : (
                    <span className="text-orange-600 text-sm font-medium">
                      ⚠️ Vượt quá giới hạn flash sale - Áp dụng giá gốc
                    </span>
                  )}
                </div>
              )}
            </div>

            <Separator className="my-4" />

            {/* Product Description */}
            <div className="mb-6">
              {product?.description ? (
                <div
                  className="text-gray-600 text-sm leading-relaxed description-preview"
                  dangerouslySetInnerHTML={{ __html: product.description.substring(0, 200) + '...' }}
                />
              ) : (
                <p className="text-gray-600 text-sm leading-relaxed">Không có mô tả sản phẩm.</p>
              )}
            </div>

            {/* Size Selection */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">Chọn dung tích</span>
                <span className="text-sm text-gray-500">Còn {currentStock} sản phẩm</span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {capacity && capacity.map((cap, index) => (
                  <div key={index} className="relative">
                    <button
                      onClick={() => handleSelectedScents(cap.id, cap.variantId, cap.stock)}
                      disabled={cap.stock <= 0}
                      className={`px-4 py-2 rounded-md transition-all ${selectedScents === cap.id
                        ? 'bg-purple-600 text-white ring-2 ring-purple-300'
                        : cap.stock <= 0
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white border border-gray-300 text-gray-700 hover:border-purple-500'}`}
                    >
                      {`${cap.name} ml`}
                      {cap.stock <= 5 && cap.stock > 0 && (
                        <span className="ml-1 text-xs">
                          ({cap.stock})
                        </span>
                      )}
                    </button>
                    {cap.stock <= 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        0
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Quantity Selection */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">Số lượng</span>
                {flashSaleInfo && flashSaleLimit && (
                  <span className="text-sm text-red-600">
                    Flash Sale: Còn {flashSaleLimit.remainingQuantity}/{flashSaleLimit.limitQuantity}
                  </span>
                )}
              </div>
              <div className="flex items-center border rounded-md w-fit">
                <button
                  type="button"
                  className="px-4 py-2 text-lg font-bold"
                  onClick={async () => {
                    const newQty = Math.max(1, quantity - 1)
                    setQuantity(newQty)
                    if (flashSaleInfo) {
                      await checkFlashSaleLimitForQuantity(newQty)
                    }
                  }}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="px-4 select-none">{quantity}</span>
                <button
                  type="button"
                  className="px-4 py-2 text-lg font-bold"
                  onClick={async () => {
                    const newQty = Math.min(currentStock, quantity + 1)
                    setQuantity(newQty)
                    if (flashSaleInfo) {
                      await checkFlashSaleLimitForQuantity(newQty)
                    }
                  }}
                  disabled={quantity >= currentStock}
                >
                  +
                </button>
              </div>

            </div>

            {/* Add to Cart */}
            <div className="mt-2">
              <Button
                onClick={handleAddToCart}
                disabled={currentStock <= 0 || addToCartMutation.isPending}
                className={`w-full py-3 rounded-lg transition-all ${currentStock <= 0
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700 shadow-lg hover:shadow-purple-200'}`}
              >
                <ShoppingCartIcon className="w-5 h-5 mr-2" />
                <span className="font-medium">
                  {addToCartMutation.isPending ? 'Đang thêm...' :
                    currentStock <= 0 ? 'Hết hàng' : 
                    !isSignin ? 'Đăng nhập để mua hàng' : 'Thêm vào giỏ hàng'}
                </span>
              </Button>
            </div>

            {/* Additional Info */}
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14"/><path d="m7.5 4.27 9 5.15"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" x2="12" y1="22" y2="12"/><circle cx="18.5" cy="15.5" r="2.5"/><path d="M20.27 17.27 22 19"/></svg>
                <span>Giao hàng miễn phí cho đơn hàng trên 500.000đ</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                <span>Sản phẩm chính hãng 100%</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m8 17 4 4 4-4"/></svg>
                <span>Đổi trả trong vòng 7 ngày</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description & Reviews */}
        <div className="mt-12 mb-16">
          <div className="border-b border-gray-200">
            <div className="flex space-x-8">
              <button 
                onClick={() => setActiveTab('description')}
                className={`font-medium py-4 px-1 -mb-px ${activeTab === 'description' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Mô tả sản phẩm
              </button>
              <button 
                onClick={() => setActiveTab('reviews')}
                className={`font-medium py-4 px-1 -mb-px ${activeTab === 'reviews' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Đánh giá
              </button>
            </div>
          </div>
          
          <div className="py-6">
            {activeTab === 'description' ? (
              <div className="prose max-w-none">
                {product?.description ? (
                  <div
                    className="text-gray-600"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                ) : (
                  <p className="text-gray-600">Chưa có mô tả chi tiết cho sản phẩm này.</p>
                )}
              </div>
            ) : (
              <div>
                <ProductReviews productId={id || ''} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
