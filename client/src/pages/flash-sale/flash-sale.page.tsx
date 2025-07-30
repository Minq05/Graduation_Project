import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Clock, Star, ShoppingBag, Eye, Heart, Filter, Grid, List } from 'lucide-react'
import { useNavigate } from 'react-router'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'

import { getFlashSaleProducts, getActiveFlashSales } from '@/services/flash-sale-service/flash-sale.apis'
import { FLASH_SALE_KEYS } from '@/services/flash-sale-service/flash-sale.keys'
import { addToWishlist, removeFromWishlist, checkProductInWishlist } from '@/services/wishlist-service/wishlist.apis'
import { RootState } from '@/redux/store'
import { IFlashSaleItem } from '@/types/flash-sale'

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1 }
  })
}

const FlashSalePage = () => {
  const [wishlistStatus, setWishlistStatus] = useState<Record<string, boolean>>({})
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 })
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'discount' | 'price' | 'name'>('discount')
  const navigate = useNavigate()
  const { isSignin, user } = useSelector((state: RootState) => state.auth)

  // Fetch flash sale products
  const { data: flashSaleProducts = [], isLoading } = useQuery({
    queryKey: [FLASH_SALE_KEYS.FETCH_ACTIVE_PRODUCTS],
    queryFn: getFlashSaleProducts,
    select: (res) => res.data || [],
    refetchInterval: 60000
  })

  // Fetch active flash sales
  const { data: activeFlashSales = [] } = useQuery({
    queryKey: [FLASH_SALE_KEYS.FETCH_ACTIVE_FLASH_SALES],
    queryFn: getActiveFlashSales,
    select: (res) => res.data || []
  })

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
      const statusPromises = productIds.map(async (productId) => {
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
      const productIds = flashSaleProducts.map((item: IFlashSaleItem) => item.productId._id)
      checkWishlistStatus(productIds)
    }
  }, [flashSaleProducts, isSignin, user])

  // Sort products
  const sortedProducts = [...flashSaleProducts].sort((a: IFlashSaleItem, b: IFlashSaleItem) => {
    switch (sortBy) {
      case 'discount':
        return b.discountPercent - a.discountPercent
      case 'price':
        const priceA = a.variantId?.price || a.productId.price || 0
        const priceB = b.variantId?.price || b.productId.price || 0
        return priceA - priceB
      case 'name':
        return a.productId.name.localeCompare(b.productId.name)
      default:
        return 0
    }
  })

  const getProductImage = (product: IFlashSaleItem['productId']) => {
    const img = product.image || product.img
    if (Array.isArray(img)) return img[0] || 'https://images.unsplash.com/photo-1615368144592-35d25066b873?q=80&w=300'
    return img || 'https://images.unsplash.com/photo-1615368144592-35d25066b873?q=80&w=300'
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-xl h-80"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.h1 
          className="text-4xl font-bold text-red-600 mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          ⚡ Flash Sale
        </motion.h1>
        
        <motion.div 
          className="flex justify-center items-center bg-red-100 px-6 py-3 rounded-lg inline-block"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Clock size={20} className="text-red-600 mr-2" />
          <span className="text-red-600 font-medium">
            Kết thúc trong: {String(timeLeft.hours).padStart(2, '0')}:
            {String(timeLeft.minutes).padStart(2, '0')}:
            {String(timeLeft.seconds).padStart(2, '0')}
          </span>
        </motion.div>
      </div>

      {/* Filters and Controls */}
      <motion.div 
        className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-4 rounded-lg shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <div className="flex items-center gap-2">
            <Filter size={16} />
            <span className="text-sm font-medium">Sắp xếp:</span>
          </div>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as any)}
            className="border border-gray-300 rounded px-3 py-1 text-sm"
          >
            <option value="discount">Giảm giá cao nhất</option>
            <option value="price">Giá thấp nhất</option>
            <option value="name">Tên A-Z</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-red-100 text-red-600' : 'text-gray-400'}`}
          >
            <Grid size={16} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${viewMode === 'list' ? 'bg-red-100 text-red-600' : 'text-gray-400'}`}
          >
            <List size={16} />
          </button>
        </div>
      </motion.div>

      {/* Products Grid */}
      {sortedProducts.length > 0 ? (
        <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' : 'grid-cols-1'}`}>
          {sortedProducts.map((item: IFlashSaleItem, idx: number) => {
            const product = item.productId
            const variant = item.variantId
            const originalPrice = variant?.price || product?.price || 0
            const discountPercent = item.discountPercent || 0
            const salePrice = originalPrice - (originalPrice * discountPercent / 100)
            
            return (
              <motion.div
                key={item._id}
                className={`bg-white rounded-xl border border-red-200 shadow-lg hover:shadow-xl transition p-4 group cursor-pointer relative overflow-hidden ${viewMode === 'list' ? 'flex gap-4' : 'flex flex-col'}`}
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

                {/* Product Image */}
                <div className={`relative overflow-hidden rounded-lg ${viewMode === 'list' ? 'w-48 h-48 flex-shrink-0' : 'mb-4'}`}>
                  <img
                    src={getProductImage(product)}
                    alt={product.name || 'Product'}
                    className={`object-cover group-hover:scale-110 transition-transform duration-500 ${viewMode === 'list' ? 'w-full h-full' : 'w-full h-60'}`}
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

                {/* Product Info */}
                <div className={`flex-1 ${viewMode === 'list' ? 'flex flex-col justify-between' : 'flex flex-col'}`}>
                  <div>
                    <div
                      className={`font-bold mb-2 cursor-pointer line-clamp-2 ${viewMode === 'list' ? 'text-xl' : 'text-lg text-center'}`}
                      dangerouslySetInnerHTML={{ __html: product.name || '' }}
                    />

                    <div className={`flex items-center mb-2 ${viewMode === 'list' ? 'justify-start' : 'justify-center'}`}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} className={i < 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
                      ))}
                      <span className='text-xs text-gray-500 ml-1'>(4.0)</span>
                    </div>
                  </div>

                  <div className={`${viewMode === 'list' ? 'flex items-center gap-4' : 'flex flex-col items-center gap-1'} mt-auto`}>
                    <div className={`${viewMode === 'list' ? 'flex items-center gap-2' : 'flex flex-col items-center gap-1'}`}>
                      <span className='text-gray-400 line-through text-sm'>
                        {originalPrice.toLocaleString()}₫
                      </span>
                      <span className='text-red-600 font-bold text-lg'>
                        {Math.round(salePrice).toLocaleString()}₫
                      </span>
                    </div>
                    
                    <div className='text-xs text-green-600 font-medium'>
                      Tiết kiệm {Math.round(originalPrice - salePrice).toLocaleString()}₫
                    </div>

                    {/* Stock indicator */}
                    {variant?.stock && (
                      <div className='bg-red-100 rounded-full px-3 py-1 mt-2'>
                        <div className='text-xs text-red-600 text-center'>
                          Còn {variant.stock} sản phẩm
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      ) : (
        <motion.div 
          className="text-center py-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-gray-400 text-6xl mb-4">⚡</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Không có sản phẩm Flash Sale</h3>
          <p className="text-gray-500">Hãy quay lại sau để không bỏ lỡ những ưu đãi hấp dẫn!</p>
        </motion.div>
      )}
    </div>
  )
}

export default FlashSalePage