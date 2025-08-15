import { useState, useEffect } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Star, ShoppingBag, Eye, Heart, Clock } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'

import { getFlashSaleProducts } from '@/services/flash-sale-service/flash-sale.apis'
import { FLASH_SALE_KEYS } from '@/services/flash-sale-service/flash-sale.keys'
import { addToWishlist, removeFromWishlist, checkProductInWishlist } from '@/services/wishlist-service/wishlist.apis'
import { RootState } from '@/redux/store'

interface FlashSaleProduct {
  _id: string
  flashSaleId: string
  productId: {
    _id: string
    name: string
    price?: number
    image?: string | string[]
    img?: string | string[]
  }
  variantId?: {
    _id: string
    sku: string
    price: number
    stock: number
  }
  discountPercent: number
  createdAt?: string
  updatedAt?: string
}

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15 }
  })
}

const FlashSaleProducts = () => {
  const [wishlistStatus, setWishlistStatus] = useState<Record<string, boolean>>({})
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 })
  const navigate = useNavigate()
  const { isSignin, user } = useSelector((state: RootState) => state.auth)

  const { data: flashSaleProducts = [], isLoading } = useQuery({
    queryKey: [FLASH_SALE_KEYS.FETCH_ACTIVE_PRODUCTS],
    queryFn: getFlashSaleProducts,
    select: (res) => {
      console.log('Flash sale API response:', res)
      console.log('Flash sale API response.data:', res?.data)
      
      // Kiểm tra cấu trúc response từ API
      // Response có dạng: { statusCode: 200, message: "...", data: [...] }
      if (res && res.statusCode === 200 && res.data && Array.isArray(res.data)) {
        console.log('Using res.data (success response):', res.data)
        return res.data
      }
      
      // Kiểm tra nếu data nằm trong res.data.data
      if (res && res.data && res.data.data && Array.isArray(res.data.data)) {
        console.log('Using res.data.data (nested):', res.data.data)
        return res.data.data
      }
      
      // Kiểm tra nếu response trực tiếp là array
      if (Array.isArray(res)) {
        console.log('Using res (direct array):', res)
        return res
      }
      
      // Fallback
      console.log('No valid data found, returning empty array')
      console.log('Response structure:', JSON.stringify(res, null, 2))
      return []
    },
    refetchInterval: 60000,
    retry: 3,
    staleTime: 30000
  })

  console.log('=== FLASH SALE DEBUG ===')
  console.log('Flash sale products:', flashSaleProducts)
  console.log('Flash sale products length:', flashSaleProducts?.length)
  console.log('Flash sale products type:', typeof flashSaleProducts)
  console.log('Flash sale products is array:', Array.isArray(flashSaleProducts))
  console.log('Is loading:', isLoading)
  console.log('========================')

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      const endOfDay = new Date()
      endOfDay.setHours(23, 59, 59, 999)
      
      const diff = endOfDay.getTime() - now.getTime()
      
      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)
        
        setTimeLeft({ hours, minutes, seconds })
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Check wishlist status
  const checkWishlistStatus = async (productIds: string[]) => {
    if (!isSignin || !user || productIds.length === 0) return
    
    try {
      const statusPromises = productIds.slice(0, 10).map(async (productId) => {
        try {
          const response = await checkProductInWishlist(productId)
          return { productId, isInWishlist: response?.data?.data?.isInWishlist || false }
        } catch {
          return { productId, isInWishlist: false }
        }
      })
      
      const results = await Promise.all(statusPromises)
      const statusMap = results.reduce((acc, { productId, isInWishlist }) => {
        acc[productId] = isInWishlist
        return acc
      }, {} as Record<string, boolean>)
      
      setWishlistStatus(statusMap)
    } catch (error) {
      console.error('Error checking wishlist status:', error)
    }
  }

  // Toggle wishlist
  const handleToggleWishlist = async (productId: string) => {
    if (!isSignin || !user) {
      toast.error('Vui lòng đăng nhập để thêm vào yêu thích')
      navigate('/auth/signin')
      return
    }

    try {
      const isCurrentlyInWishlist = wishlistStatus[productId]
      if (isCurrentlyInWishlist) {
        await removeFromWishlist(productId)
        toast.success('Đã xóa khỏi danh sách yêu thích!')
        setWishlistStatus(prev => ({ ...prev, [productId]: false }))
      } else {
        await addToWishlist(productId)
        toast.success('Đã thêm vào danh sách yêu thích!')
        setWishlistStatus(prev => ({ ...prev, [productId]: true }))
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error)
      toast.error('Có lỗi xảy ra, vui lòng thử lại')
    }
  }

  useEffect(() => {
    if (flashSaleProducts.length > 0 && isSignin && user) {
      const productIds = flashSaleProducts.map((item: FlashSaleProduct) => item.productId._id)
      checkWishlistStatus(productIds)
    }
  }, [flashSaleProducts, isSignin, user])

  const getProductImage = (product: FlashSaleProduct['productId']) => {
    const img = product.image || product.img
    if (Array.isArray(img)) return img[0] || 'https://images.unsplash.com/photo-1615368144592-35d25066b873?q=80&w=300'
    return img || 'https://images.unsplash.com/photo-1615368144592-35d25066b873?q=80&w=300'
  }

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-xl h-80"></div>
          ))}
        </div>
      </div>
    )
  }

  console.log('=== RENDERING FLASH SALE ===')
  console.log('Products to render:', flashSaleProducts)
  console.log('Products length:', flashSaleProducts?.length)
  console.log('Will show empty state:', !flashSaleProducts?.length)
  console.log('===========================')

  return (
    <motion.section 
      className='container mx-auto mb-12' 
      initial='hidden' 
      whileInView='visible' 
      viewport={{ once: true }} 
      variants={fadeInUp}
    >
      <div className='flex justify-between items-center mb-6'>
        <div className='flex items-center'>
          <div className='w-1.5 h-8 bg-red-600 rounded-full mr-3'></div>
          <h3 className='text-3xl font-bold text-red-600'>⚡ Flash Sale</h3>
          
          {/* Countdown Timer */}
          <div className='ml-6 flex items-center bg-red-100 px-4 py-2 rounded-lg'>
            <Clock size={16} className='text-red-600 mr-2' />
            <span className='text-red-600 font-medium text-sm'>
              Kết thúc trong: {String(timeLeft.hours).padStart(2, '0')}:
              {String(timeLeft.minutes).padStart(2, '0')}:
              {String(timeLeft.seconds).padStart(2, '0')}
            </span>
          </div>
        </div>
        

      </div>

      <div className='bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-2xl border-2 border-red-100'>
        {!flashSaleProducts?.length ? (
          <div className='text-center py-12'>
            <div className='text-red-400 mb-4'>
              <Clock size={48} className='mx-auto mb-3' />
            </div>
            <h4 className='text-xl font-semibold text-gray-600 mb-2'>Chưa có sản phẩm Flash Sale</h4>
            <p className='text-gray-500'>Hãy quay lại sau để không bỏ lỡ những ưu đãi hấp dẫn!</p>
            <div className='mt-4 text-xs text-gray-400'>
              Debug: Products length = {flashSaleProducts?.length || 0}
            </div>
          </div>
        ) : (
        <Swiper
          navigation={{
            nextEl: '.flash-sale-next',
            prevEl: '.flash-sale-prev'
          }}
          spaceBetween={24}
          slidesPerView={2}
          breakpoints={{
            640: { slidesPerView: 3 },
            1024: { slidesPerView: 5 }
          }}
          modules={[Navigation]}
          className='flash-sale-swiper relative'
        >
          {flashSaleProducts.map((item: FlashSaleProduct, idx: number) => {
            const product = item.productId
            const variant = item.variantId
            
            // Xử lý giá - ưu tiên variant.price, fallback về product.price
            let originalPrice = 0
            if (typeof variant === 'object' && variant && typeof variant.price === 'number') {
              originalPrice = variant.price
            } else if (product && typeof product.price === 'number') {
              originalPrice = product.price
            }
            
            const discountPercent = item.discountPercent || 0
            const discountAmount = originalPrice * (discountPercent / 100)
            const finalPrice = originalPrice - discountAmount
            
            console.log('=== PRICE DEBUG ===')
            console.log('Product:', product.name)
            console.log('Variant:', variant)
            console.log('Original price:', originalPrice)
            console.log('Discount:', discountPercent + '%')
            console.log('Final price:', finalPrice)
            console.log('==================')
            
            return (
              <SwiperSlide key={item._id}>
                <motion.div
                  className='bg-white rounded-xl border border-red-200 shadow-lg hover:shadow-xl transition p-4 flex flex-col group cursor-pointer relative overflow-hidden h-[400px]'
                  custom={idx}
                  initial='hidden'
                  whileInView='visible'
                  viewport={{ once: true }}
                  variants={fadeInUp}
                  whileHover={{ y: -5 }}
                  onClick={() => navigate(`/productDetail/${product._id}`)}
                >
                  {/* Flash Sale Badge */}
                  <div className='absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10 animate-pulse'>
                    -{discountPercent}%
                  </div>

                  {/* Favorite Button */}
                  <button
                    className='absolute top-3 right-3 bg-white rounded-full p-1.5 shadow-md z-10 transition-all duration-200 hover:bg-pink-50'
                    onClick={(e) => {
                      e.stopPropagation()
                      handleToggleWishlist(product._id)
                    }}
                  >
                    <Heart
                      size={18}
                      className={wishlistStatus[product._id] ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500'}
                    />
                  </button>

                  <div className='relative overflow-hidden rounded-lg mb-4'>
                    <img
                      src={getProductImage(product)}
                      alt={product.name || 'Product'}
                      className='w-full h-60 object-cover group-hover:scale-110 transition-transform duration-500'
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1615368144592-35d25066b873?q=80&w=300'
                      }}
                    />

                    {/* Quick Actions Overlay */}
                    <div className='absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center'>
                      <button className='bg-white text-red-700 rounded-full p-2 mx-1 hover:bg-red-700 hover:text-white transition-colors'>
                        <ShoppingBag size={18} />
                      </button>
                      <button className='bg-white text-red-700 rounded-full p-2 mx-1 hover:bg-red-700 hover:text-white transition-colors'>
                        <Eye size={18} />
                      </button>
                    </div>
                  </div>

                  <div className='flex-1 flex flex-col'>
                    <div
                      className='font-bold text-base mb-2 cursor-pointer text-center line-clamp-2 h-12 flex items-center justify-center'
                      dangerouslySetInnerHTML={{ __html: product.name || '' }}
                    />

                    {/* Variant Info */}
                    {variant && typeof variant === 'object' && variant.sku && (
                      <div className='text-center mb-2'>
                        <span className='text-xs bg-gray-100 px-2 py-1 rounded text-gray-600'>
                          {variant.sku}
                        </span>
                      </div>
                    )}



                    <div className='flex flex-col items-center gap-1 mt-auto'>
                      <div className='text-red-600 font-bold text-lg'>
                        Flash Sale {discountPercent}% OFF
                      </div>
                    </div>

                    {/* Stock indicator */}
                    {variant && typeof variant === 'object' && variant.stock && (
                      <div className='mt-2 bg-red-100 rounded-full px-3 py-1'>
                        <div className='text-xs text-red-600 text-center'>
                          Còn {variant.stock} sản phẩm
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </SwiperSlide>
            )
          })}

          {/* Navigation Buttons */}
          <button className='flash-sale-prev absolute top-1/2 -left-4 z-10 bg-white shadow-lg rounded-full p-2.5 flex items-center justify-center hover:bg-red-100 transition border border-gray-100 active:scale-90'>
            <ChevronLeft size={24} className='text-red-600' />
          </button>
          <button className='flash-sale-next absolute top-1/2 -right-4 z-10 bg-white shadow-lg rounded-full p-2.5 flex items-center justify-center hover:bg-red-100 transition border border-gray-100 active:scale-90'>
            <ChevronRight size={24} className='text-red-600' />
          </button>
        </Swiper>
        )}
      </div>
    </motion.section>
  )
}

export default FlashSaleProducts
