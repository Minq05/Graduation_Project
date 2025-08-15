import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, Navigation, EffectFade, EffectCoverflow } from 'swiper/modules'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Star, ShoppingBag, Heart, TrendingUp, Award, Sparkles, Zap } from 'lucide-react'
import { PRODUCT_KEYS } from '@/services/product-service/product.keys'
import { useQuery } from '@tanstack/react-query'
import { fetchListBrand, fetchListCategory, fetchListProduct } from '@/services/product-service/product.apis'
import { useState, useEffect } from 'react'
import { Eye } from 'lucide-react'
import { useNavigate } from 'react-router'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { addToWishlist, removeFromWishlist, checkProductInWishlist } from '@/services/wishlist-service/wishlist.apis'
import { toast } from 'react-toastify'
import { useQueryClient } from '@tanstack/react-query'
import { REVIEW_QUERY_KEYS } from '@/services/review-service/review.keys'
import { fetchAllReviews } from '@/services/review-service/review.apis'
import FlashSaleProducts from '@/components/flash-sale/flash-sale-products'
import { getFlashSaleProducts } from '@/services/flash-sale-service/flash-sale.apis'
import { FLASH_SALE_KEYS } from '@/services/flash-sale-service/flash-sale.keys'
import 'swiper/css/effect-coverflow'
import 'swiper/css/effect-fade'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css'

// Interface cho review
interface Review {
  _id: string;
  userId: {
    _id: string;
    fullName: string;
    avatar?: string;
  };
  productId: {
    _id: string;
    name: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
}

const bannerSlides = [
  {
    title: 'Khám phá nước hoa chính hãng',
    desc: 'Nước hoa nam & nữ - Sang trọng, quyến rũ, cá tính',
    img: 'https://images.unsplash.com/photo-1615368144592-35d25066b873?q=80&w=1000',
    btn: 'Mua ngay',
    bgColor: 'from-purple-600 to-blue-400'
  },
  {
    title: 'Ưu đãi mùa hè',
    desc: 'Giảm giá lên đến 30% cho nước hoa hot',
    img: 'https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?q=80&w=1000',
    btn: 'Xem ngay',
    bgColor: 'from-emerald-500 to-teal-400'
  },
  {
    title: 'Bộ sưu tập mới 2025',
    desc: 'Khám phá mùi hương mới nhất từ các thương hiệu nổi tiếng',
    img: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1000',
    btn: 'Khám phá',
    bgColor: 'from-amber-500 to-orange-400'
  },
  {
    title: 'Quà tặng đặc biệt',
    desc: 'Tặng kèm gift set cho đơn hàng từ 2 triệu',
    img: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?q=80&w=1000',
    btn: 'Nhận quà',
    bgColor: 'from-rose-500 to-pink-400'
  }
]

const defaultFashionSlides = [
  {
    left: {
      bg: 'https://images.unsplash.com/photo-1615368144592-35d25066b873?q=80&w=400',
      title: 'BỘ SƯU TẬP NƯỚC HOA CAO CẤP',
      btn: 'Khám phá ngay'
    }
  },
  {
    left: {
      bg: 'https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?q=80&w=400',
      title: 'NƯỚC HOA MÙA HÈ MỚI',
      btn: 'Xem ngay'
    }
  },
  {
    left: {
      bg: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=400',
      title: 'HƯƠNG THƠM CHO MỌI DỊP',
      btn: 'Mua ngay'
    }
  }
]

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15 }
  })
}

// Thêm ở đầu file hoặc import nếu đã có
interface Product {
  _id: string
  name: string
  price?: number
  img?: string
  image?: string
  brand?: string
  desc?: string
  description?: string
  // Thêm các trường khác nếu cần
}

interface Category {
  _id: string
  name: string
  img?: string
  image?: string
  desc?: string
  isPublic?: boolean
}

interface Brand {
  _id: string
  name: string
  img?: string
  logo?: string
  image?: string
}

const HomePage = () => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [wishlistStatus, setWishlistStatus] = useState<Record<string, boolean>>({})
  const navigate = useNavigate()
  const { isSignin, user } = useSelector((state: RootState) => state.auth)
  const queryClient = useQueryClient()

  // Kiểm tra trạng thái wishlist cho tất cả sản phẩm (batch request)
  const checkWishlistStatus = async (productIds: string[]) => {
    if (!isSignin || !user || productIds.length === 0) return
    try {
      // Gọi 1 request duy nhất thay vì nhiều requests
      const batchSize = 10 // Giới hạn số lượng check mỗi lần
      const limitedIds = productIds.slice(0, batchSize)
      const statusPromises = limitedIds.map(async (productId) => {
        try {
          const response = await checkProductInWishlist(productId)
          return { productId, isInWishlist: response?.data?.data?.isInWishlist || false }
        } catch (error) {
          console.error(`Error checking wishlist for product ${productId}:`, error)
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
        // Invalidate wishlist query để update số lượng ở header
        queryClient.invalidateQueries({ queryKey: ['wishlist'] })
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error)
      toast.error('Có lỗi xảy ra, vui lòng thử lại')
    }
  }
  // Loại bỏ query flash sale products vì đã chuyển vào component riêng

  // Sản phẩm (dùng cho sản phẩm nổi bật)
  const {
    data: dataProducts,
    isLoading: isLoadingProducts,
    isError: isErrorProducts
  } = useQuery({
    queryKey: [PRODUCT_KEYS.FETCH_LIST_PRODUCT],
    queryFn: () => fetchListProduct({}),
    select: (res) => res.data
  })

  // Flash sale products
  const { data: flashSaleProducts } = useQuery({
    queryKey: [FLASH_SALE_KEYS.FETCH_ACTIVE_PRODUCTS],
    queryFn: getFlashSaleProducts,
    select: (res) => res && res.statusCode === 200 && res.data ? res.data : []
  })

  // Thương hiệu
  const {
    data: dataBrand,
    isLoading: isLoadingBrand,
    isError: isErrorBrand
  } = useQuery({
    queryKey: [PRODUCT_KEYS.FETCH_LIST_BRAND],
    queryFn: () => fetchListBrand(),
    select: (res) => res.data
  })

  // Danh mục
  const {
    data: dataCategory,
    isLoading: isLoadingCategory,
    isError: isErrorCategory
  } = useQuery({
    queryKey: [PRODUCT_KEYS.FETCH_LIST_CATEGORY],
    queryFn: () => fetchListCategory(),
    select: (res) => res.data
  })

  // Đánh giá (cho phần khách hàng nói gì)
  const {
    data: dataReviews,
    isLoading: isLoadingReviews,
    isError: isErrorReviews
  } = useQuery({
    queryKey: [REVIEW_QUERY_KEYS.FETCH_ALL_REVIEWS],
    queryFn: () => fetchAllReviews('limit=10&sort=-createdAt'),
    select: (res) => res.data
  })

  // Xử lý dữ liệu
  const products = Array.isArray(dataProducts?.results) ? dataProducts.results : []
  const brands = Array.isArray(dataBrand?.results) ? dataBrand.results : []
  const categories = Array.isArray(dataCategory?.results) ? dataCategory.results.filter((category: Category) => category.isPublic !== false) : []
  const reviews: Review[] = Array.isArray(dataReviews?.results) ? dataReviews.results : []

  // Chỉ check wishlist khi user đăng nhập lần đầu tiên hoặc khi có sản phẩm mới
  useEffect(() => {
    if (!isSignin || !user || products.length === 0) return

    const productIds = products.map(product => product._id).filter(Boolean)
    const hasNewProducts = productIds.some(id => !(id in wishlistStatus))

    if (hasNewProducts) {
      const timer = setTimeout(() => {
        checkWishlistStatus(productIds)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [products, isSignin])

  // Sử dụng dữ liệu riêng cho từng phần
  const featuredProducts = products

  // Tạo fashion slides từ sản phẩm random
  const fashionSlides = products.length > 0
    ? products
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map((product: Product) => {
        const getProductImage = () => {
          const img = product.img || product.image;
          if (Array.isArray(img)) return img[0] || 'https://images.unsplash.com/photo-1615368144592-35d25066b873?q=80&w=400';
          return img || 'https://images.unsplash.com/photo-1615368144592-35d25066b873?q=80&w=400';
        };
        return {
          left: {
            bg: getProductImage(),
            title: product.name?.toUpperCase() || 'SẢN PHẨM NỔI BẬT',
            btn: 'Mua ngay',
            id: product._id
          }
        };
      })
    : defaultFashionSlides

  // Loading và error chung
  const isLoading = isLoadingProducts || isLoadingBrand || isLoadingCategory || isLoadingReviews
  const isError = isErrorProducts || isErrorBrand || isErrorCategory || isErrorReviews

  if (isLoading) return (
    <div className='flex justify-center items-center min-h-screen'>
      <div className='animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500'></div>
    </div>
  )

  if (isError) return (
    <div className='flex justify-center items-center min-h-screen'>
      <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded'>
        <p>Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau!</p>
      </div>
    </div>
  )

  return (
    <div className='bg-gradient-to-b from-white to-gray-50 min-h-screen p-3'>
      {/* Banner with Swiper */}
      <section className='container mx-auto rounded-xl p-2 md:p-8 mb-8'>
        <Swiper
          loop
          effect='fade'
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          modules={[Autoplay, Pagination, EffectFade]}
          className='rounded-xl shadow-2xl'
          onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        >
          {bannerSlides.map((slide, idx: number) => (
            <SwiperSlide key={idx}>
              <div className={`flex flex-col md:flex-row items-stretch justify-between bg-gradient-to-r ${slide.bgColor} rounded-xl p-5 md:p-16 h-auto min-h-[400px] md:h-[450px] overflow-hidden relative`}>
                {/* Decorative elements - hidden on smallest screens */}
                <div className='absolute top-0 left-0 w-full h-full opacity-10 hidden sm:block'>
                  <div className='absolute top-10 left-10 w-32 h-32 rounded-full bg-white'></div>
                  <div className='absolute bottom-10 right-10 w-24 h-24 rounded-full bg-white'></div>
                  <div className='absolute top-1/2 left-1/3 w-16 h-16 rounded-full bg-white'></div>
                </div>

                <motion.div
                  className='z-10 max-w-full md:max-w-lg flex flex-col justify-center mb-6 md:mb-0'
                  initial={{ opacity: 0, x: -60 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                >
                  <div className='bg-white bg-opacity-20 backdrop-blur-sm px-3 py-1.5 md:px-4 md:py-2 rounded-lg inline-block mb-3 md:mb-4 w-fit'>
                    <span className='text-white text-xs md:text-sm font-medium flex items-center'>
                      <Sparkles size={14} className='mr-1.5 md:mr-2' /> Khuyến mãi đặc biệt
                    </span>
                  </div>
                  <h2 className='text-white text-xl sm:text-3xl md:text-5xl font-extrabold mb-3 md:mb-4 drop-shadow-md'>{slide.title}</h2>
                  <p className='text-white text-sm sm:text-base md:text-xl mb-4 md:mb-6 drop-shadow-sm'>{slide.desc}</p>
                  <button
                    className='px-3 py-1.5 sm:px-4 sm:py-2 md:px-8 md:py-3 bg-white text-purple-700 font-bold rounded-lg shadow-lg hover:bg-purple-700 hover:text-white transition duration-300 transform hover:scale-105 cursor-pointer flex items-center justify-center w-fit'
                    onClick={() => navigate('/shops')}
                  >
                    <ShoppingBag size={16} className='mr-1.5 md:mr-2' />
                    {slide.btn}
                  </button>
                </motion.div>

                <motion.div
                  className='relative z-10 flex justify-center'
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                >
                  <img
                    src={slide.img}
                    alt='Banner'
                    className='w-32 h-32 sm:w-40 sm:h-40 md:w-96 md:h-96 object-cover rounded-xl shadow-2xl mt-0 md:mt-0 md:ml-8 self-center'
                    crossOrigin="anonymous"
                  />
                  <div className='absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-3/4 h-8 bg-black opacity-20 blur-xl rounded-full'></div>
                </motion.div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Banner indicators */}
        <div className='flex justify-center mt-4 gap-1.5 md:gap-2'>
          {bannerSlides.map((_, idx) => (
            <div
              key={idx}
              className={`w-2 md:w-3 h-2 md:h-3 rounded-full transition-all duration-300 cursor-pointer ${activeIndex === idx ? 'bg-purple-600 w-6 md:w-8' : 'bg-gray-300'}`}
              onClick={() => setActiveIndex(idx)}
            ></div>
          ))}
        </div>
      </section>

      {/* Flash Sale Products */}
      <FlashSaleProducts />

      {/* Danh mục nước hoa */}
      <motion.section className='container mx-auto mb-12' initial='hidden' whileInView='visible' viewport={{ once: true }} variants={fadeInUp}>
        <div className='flex justify-between items-center mb-6'>
          <div className='flex items-center'>
            <div className='w-1.5 h-8 bg-teal-600 rounded-full mr-3'></div>
            <h3 className='text-2xl sm:text-3xl font-bold'>Danh mục nước hoa</h3>
          </div>
        </div>
        <div className='bg-gradient-to-r from-teal-50 to-emerald-50 p-6 rounded-2xl'>
          <Swiper
            navigation={{
              nextEl: '.custom-next-men',
              prevEl: '.custom-prev-men'
            }}
            effect='coverflow'
            coverflowEffect={{
              rotate: 0,
              stretch: 0,
              depth: 100,
              modifier: 1,
              slideShadows: false
            }}
            spaceBetween={24}
            slidesPerView={2}
            breakpoints={{
              640: { slidesPerView: 3 },
              1024: { slidesPerView: 5 }
            }}
            modules={[Navigation, EffectCoverflow]}
            className='category-men-swiper relative'
          >
            {categories.map((category: Category, idx: number) => (
              <SwiperSlide key={category._id || idx}>
                <motion.div
                  className='bg-white rounded-xl border border-gray-100 shadow-lg hover:shadow-xl transition p-4 md:p-6 flex flex-col items-center group cursor-pointer min-h-[160px] justify-center'
                  custom={idx}
                  initial='hidden'
                  whileInView='visible'
                  viewport={{ once: true }}
                  variants={fadeInUp}
                  onClick={() => navigate(`/category/${category._id}`)}
                >
                  <div className='font-bold text-xl mb-3 cursor-pointer text-center line-clamp-2 max-w-[200px] flex items-center justify-center'>
                    {category.name}
                  </div>

                  <div
                    className='text-teal-600 font-medium text-sm group-hover:underline transition cursor-pointer line-clamp-2 mb-4 flex items-center justify-center text-center max-w-[180px]'
                    dangerouslySetInnerHTML={{ __html: category.desc || 'Khám phá ngay!' }}
                  />

                  <button
                    className='px-6 py-2 bg-teal-50 text-teal-700 rounded-full text-sm font-medium hover:bg-teal-100 transition-colors'
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/category/${category._id}`)
                    }}
                  >
                    Xem thêm
                  </button>
                </motion.div>
              </SwiperSlide>
            ))}

            <button className='custom-prev-men absolute top-1/2 -left-4 z-10 bg-white shadow-lg rounded-full p-2.5 flex items-center justify-center hover:bg-teal-100 transition border border-gray-100 active:scale-90'>
              <ChevronLeft size={24} className='text-teal-600' />
            </button>
            <button className='custom-next-men absolute top-1/2 -right-4 z-10 bg-white shadow-lg rounded-full p-2.5 flex items-center justify-center hover:bg-teal-100 transition border border-gray-100 active:scale-90'>
              <ChevronRight size={24} className='text-teal-600' />
            </button>
          </Swiper>
        </div>
      </motion.section>

      {/* Fashion Slideshow Section - Sử dụng sản phẩm random */}
      <section className='container mx-auto mb-12'>
        <div className='flex justify-between items-center mb-6'>
          <div className='flex items-center'>
            <div className='w-1.5 h-8 bg-amber-500 rounded-full mr-3'></div>
            <h3 className='text-3xl font-bold'>Bộ sưu tập nổi bật</h3>
          </div>
        </div>

        <div className='bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-2xl'>
          <Swiper
            loop
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            pagination={{ clickable: true, dynamicBullets: true }}
            modules={[Autoplay, Pagination]}
            className='rounded-xl overflow-hidden shadow-xl'
          >
            {fashionSlides.map((slide: { left: { bg: string; title: string; desc: string; btn: string; id?: string } }, idx: number) => (
              <SwiperSlide key={idx}>
                <div className='flex flex-col md:flex-row rounded-xl overflow-hidden bg-white h-auto md:h-[400px]'>
                  {/* Left side with image */}
                  <div className='flex-1 relative overflow-hidden'>
                    <img
                      src={slide.left.bg || 'https://images.unsplash.com/photo-1615368144592-35d25066b873?q=80&w=400'}
                      alt={slide.left.title || 'Collection'}
                      className='object-cover w-full h-80 md:h-full transition-transform duration-700 hover:scale-110'
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1615368144592-35d25066b873?q=80&w=400';
                      }}
                    />
                    <div className='absolute top-4 left-4 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full'>
                      <span className='text-amber-600 text-sm font-medium flex items-center'>
                        <TrendingUp size={14} className='mr-1' /> Xu hướng mới
                      </span>
                    </div>
                  </div>

                  {/* Right side with text */}
                  <div className='flex-1 flex flex-col justify-center p-8 md:p-12 relative'>
                    <div className='absolute top-0 right-0 w-32 h-32 bg-amber-100 rounded-full -mr-16 -mt-16 opacity-50'></div>
                    <div className='absolute bottom-0 left-0 w-24 h-24 bg-orange-100 rounded-full -ml-12 -mb-12 opacity-50'></div>

                    <div className='relative z-10'>
                      <span className='inline-block bg-amber-100 text-amber-800 px-3 py-1 rounded-md text-sm font-medium mb-4'>
                        Bộ sưu tập mới
                      </span>

                      <h2 className='text-black text-2xl md:text-4xl font-extrabold mb-8 leading-tight'>
                        {slide.left.title}
                      </h2>

                      <div className='flex flex-wrap gap-4'>
                        <button
                          className='px-6 py-3 bg-amber-500 text-white font-bold rounded-lg shadow-lg hover:bg-amber-600 transition duration-300 flex items-center'
                          onClick={() => slide.left.id && navigate(`/productDetail/${slide.left.id}`)}
                        >
                          <ShoppingBag size={18} className='mr-2' />
                          {slide.left.btn}
                        </button>

                        <button
                          className='px-6 py-3 bg-white text-amber-500 font-bold rounded-lg shadow border border-amber-200 hover:bg-amber-50 transition duration-300'
                          onClick={() => slide.left.id && navigate(`/productDetail/${slide.left.id}`)}
                        >
                          Xem chi tiết
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* Sản phẩm nổi bật */}
      <motion.section className='container mx-auto mb-12' initial='hidden' whileInView='visible' viewport={{ once: true }} variants={fadeInUp}>
        <div className='flex justify-between items-center mb-6'>
          <div className='flex items-center'>
            <div className='w-1.5 h-8 bg-indigo-600 rounded-full mr-3'></div>
            <h3 className='text-2xl sm:text-3xl font-bold'>Sản phẩm nổi bật</h3>
          </div>
          <button
            className='text-indigo-600 text-sm sm:text-base font-medium hover:underline flex items-center'
            onClick={() => navigate('/products?featured=true')}
          >
            Xem tất cả <ChevronRight size={14} className='ml-1' />
          </button>
        </div>

        <div className='bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl'>
          <Swiper
            navigation={{
              nextEl: '.custom-next-featured',
              prevEl: '.custom-prev-featured'
            }}
            spaceBetween={16}
            slidesPerView={2}
            breakpoints={{
              640: { slidesPerView: 3, spaceBetween: 20 },
              1024: { slidesPerView: 4, spaceBetween: 24 },
              1280: { slidesPerView: 5, spaceBetween: 24 }
            }}
            modules={[Navigation]}
            className='featured-products-swiper relative'
          >
            {featuredProducts.slice(0, 10).map((product: Product, idx: number) => (
              <SwiperSlide key={product._id || idx}>
                <motion.div
                  className='bg-white rounded-xl border border-gray-100 shadow-lg hover:shadow-xl transition p-2 sm:p-3 flex flex-col group cursor-pointer relative overflow-hidden h-full'
                  custom={idx}
                  initial='hidden'
                  whileInView='visible'
                  viewport={{ once: true }}
                  variants={fadeInUp}
                  whileHover={{ y: -5 }}
                  onClick={() => navigate(`/productDetail/${product._id}`)}
                >
                  {/* Badges */}
                  <div className="absolute top-2 sm:top-3 right-2 sm:right-3 z-10 flex flex-col gap-1">
                    <div className="bg-indigo-500 text-white text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded flex items-center">
                      <Award size={10} className="mr-0.5 sm:mr-1" /> Nổi bật
                    </div>
                    {(() => {
                      const isOnSale = flashSaleProducts?.some((fs: any) => 
                        fs.productId._id === product._id
                      )
                      return isOnSale ? (
                        <div className="bg-red-500 text-white text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded flex items-center">
                          <Zap size={10} className="mr-0.5 sm:mr-1" /> Sale
                        </div>
                      ) : null
                    })()}
                  </div>

                  <div className="relative overflow-hidden rounded-lg mb-2 sm:mb-3">
                    <img
                      src={(() => {
                        const img = product.img || product.image;
                        if (Array.isArray(img)) return img[0] || 'https://images.unsplash.com/photo-1615368144592-35d25066b873?q=80&w=300';
                        return img || 'https://images.unsplash.com/photo-1615368144592-35d25066b873?q=80&w=300';
                      })()} 
                      alt={product.name || 'Product'}
                      className='w-full h-32 sm:h-40 md:h-48 object-cover group-hover:scale-110 transition-transform duration-500'
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1615368144592-35d25066b873?q=80&w=300';
                      }}
                    />

                    {/* Quick action overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <button className="bg-white text-indigo-700 rounded-full p-1.5 sm:p-2 mx-1 hover:bg-indigo-700 hover:text-white transition-colors">
                        <ShoppingBag size={14} className="sm:size-[18px]" />
                      </button>
                      <button className="bg-white text-indigo-700 rounded-full p-1.5 sm:p-2 mx-1 hover:bg-indigo-700 hover:text-white transition-colors">
                        <Eye size={14} className="sm:size-[18px]" />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col">
                    <div
                      className='font-bold text-sm sm:text-base mb-1 cursor-pointer line-clamp-2 h-10 sm:h-12'
                      dangerouslySetInnerHTML={{ __html: product.name || '' }}
                    />

                    <div className='text-indigo-500 text-xs sm:text-sm mb-1 sm:mb-2 cursor-pointer line-clamp-1'>
                      {product.brand || 'Thương hiệu cao cấp'}
                    </div>

                    <div className="flex items-center mb-1 sm:mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} className={i < 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
                      ))}
                    </div>

                    <div className="mt-auto">
                      <div className='bg-indigo-50 rounded-lg px-2 sm:px-4 py-1 sm:py-2 font-bold text-xs sm:text-base text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white transition text-center'>
                        {typeof product.price === 'number' ? product.price.toLocaleString() : product.price}₫
                      </div>
                    </div>
                  </div>
                </motion.div>
              </SwiperSlide>
            ))}

            <button className='custom-prev-featured absolute top-1/2 -left-4 z-10 bg-white shadow-lg rounded-full p-2.5 flex items-center justify-center hover:bg-indigo-100 transition border border-gray-100 active:scale-90'>
              <ChevronLeft size={24} className='text-indigo-600' />
            </button>
            <button className='custom-next-featured absolute top-1/2 -right-4 z-10 bg-white shadow-lg rounded-full p-2.5 flex items-center justify-center hover:bg-indigo-100 transition border border-gray-100 active:scale-90'>
              <ChevronRight size={24} className='text-indigo-600' />
            </button>
          </Swiper>
        </div>


      </motion.section>

      {/* Feedback Section */}
      <motion.section className='container mx-auto mb-12' initial='hidden' whileInView='visible' viewport={{ once: true }} variants={fadeInUp}>
        <div className='flex justify-between items-center mb-6'>
          <div className='flex items-center'>
            <div className='w-1.5 h-8 bg-rose-500 rounded-full mr-3'></div>
            <h3 className='text-2xl sm:text-3xl font-bold'>Khách hàng nói gì?</h3>
          </div>
        </div>

        <div className='bg-gradient-to-r from-rose-50 to-pink-50 p-4 sm:p-6 rounded-2xl'>
          <Swiper
            navigation={{
              nextEl: '.custom-next-feedback',
              prevEl: '.custom-prev-feedback'
            }}
            spaceBetween={16}
            slidesPerView={1}
            breakpoints={{
              480: { slidesPerView: 1, spaceBetween: 16 },
              640: { slidesPerView: 2, spaceBetween: 20 },
              1024: { slidesPerView: 3, spaceBetween: 24 }
            }}
            modules={[Navigation]}
            className='feedback-swiper relative'
          >
            {reviews.length > 0 ? reviews.map((review: Review, idx: number) => (
              <SwiperSlide key={review._id}>
                <motion.div
                  className='bg-white rounded-xl border border-gray-100 shadow-lg hover:shadow-xl transition p-4 sm:p-6 flex flex-col group cursor-pointer relative h-[200px]'
                  custom={idx}
                  initial='hidden'
                  whileInView='visible'
                  viewport={{ once: true }}
                  variants={fadeInUp}
                  whileHover={{ y: -5 }}
                >
                  {/* Quote mark */}
                  <div className='absolute top-3 right-3 sm:top-4 sm:right-4 text-rose-200 text-4xl sm:text-5xl font-serif leading-none'>'</div>

                  <div className='flex items-center mb-3 sm:mb-4'>
                    <div className='relative'>
                      <img
                        src={review.userId?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.userId?.fullName || 'User')}&background=f43f5e&color=fff`}
                        alt={review.userId?.fullName || 'User'}
                        className='w-12 h-12 sm:w-16 sm:h-16 rounded-full border-3 sm:border-4 border-rose-100 group-hover:border-rose-300 transition object-cover'
                        onError={(e) => {
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(review.userId?.fullName || 'User')}&background=f43f5e&color=fff`;
                        }}
                      />
                      <div className='absolute -bottom-1 -right-1 bg-rose-500 text-white rounded-full p-0.5 sm:p-1'>
                        <Star size={10} className='fill-white' />
                      </div>
                    </div>
                    <div className='ml-3 sm:ml-4'>
                      <div className='font-bold text-base sm:text-lg'>{review.userId?.fullName || 'Khách hàng'}</div>
                      <div className='flex'>
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} className={i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className='text-gray-600 text-sm sm:text-base italic mb-3 sm:mb-4 relative z-10 line-clamp-3 flex-1'>
                    '{review.comment}'
                  </div>

                  <div className='mt-auto pt-2 sm:pt-3 border-t border-gray-100 flex justify-between items-center'>
                    <span className='text-xs text-gray-400'>
                      {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                    <span className='text-rose-500 text-xs sm:text-sm font-medium hover:underline cursor-pointer'>Đã mua hàng</span>
                  </div>
                </motion.div>
              </SwiperSlide>
            )) : (
              // Fallback khi chưa có review
              <SwiperSlide>
                <div className='bg-white rounded-xl border border-gray-100 shadow-lg p-4 sm:p-6 flex flex-col items-center justify-center min-h-[200px]'>
                  <div className='text-gray-400 text-center'>
                    <Star size={48} className='mx-auto mb-3 text-gray-300' />
                    <p>Chưa có đánh giá nào</p>
                    <p className='text-sm mt-1'>Hãy là người đầu tiên đánh giá!</p>
                  </div>
                </div>
              </SwiperSlide>
            )}

            {/* Navigation buttons - hidden on smallest screens */}
            {reviews.length > 0 && (
              <div className='hidden sm:block'>
                <button className='custom-prev-feedback absolute top-1/2 -left-4 z-10 bg-white shadow-lg rounded-full p-2 sm:p-2.5 flex items-center justify-center hover:bg-rose-100 transition border border-gray-100 active:scale-90'>
                  <ChevronLeft size={20} className='text-rose-500' />
                </button>
                <button className='custom-next-feedback absolute top-1/2 -right-4 z-10 bg-white shadow-lg rounded-full p-2 sm:p-2.5 flex items-center justify-center hover:bg-rose-100 transition border border-gray-100 active:scale-90'>
                  <ChevronRight size={20} className='text-rose-500' />
                </button>
              </div>
            )}
          </Swiper>
        </div>
      </motion.section>

      {/* Brand Section */}
      <motion.section className='container mx-auto mb-12' initial='hidden' whileInView='visible' viewport={{ once: true }} variants={fadeInUp}>
        <div className='flex justify-between items-center mb-6'>
          <div className='flex items-center'>
            <div className='w-1.5 h-8 bg-blue-600 rounded-full mr-3'></div>
            <h3 className='text-2xl sm:text-3xl font-bold'>Thương hiệu nổi bật</h3>
          </div>
        </div>

        <div className='bg-gradient-to-r from-blue-50 to-sky-50 p-4 sm:p-6 rounded-2xl'>
          <div className='flex items-center justify-center mb-4 sm:mb-6'>
            <p className='text-center text-gray-600 max-w-2xl text-sm sm:text-base px-2'>
              Chúng tôi hợp tác với các thương hiệu nước hoa hàng đầu thế giới để mang đến cho bạn những sản phẩm chính hãng với chất lượng tốt nhất.
            </p>
          </div>

          <Swiper
            loop
            slidesPerView={2}
            spaceBetween={16}
            speed={3000}
            autoplay={{
              delay: 0,
              disableOnInteraction: false,
              pauseOnMouseEnter: true
            }}
            breakpoints={{
              480: { slidesPerView: 2, spaceBetween: 16 },
              640: { slidesPerView: 3, spaceBetween: 20 },
              1024: { slidesPerView: 6, spaceBetween: 24 }
            }}
            modules={[Autoplay]}
            className='brand-swiper'
          >
            {brands.map((brand: Brand, idx: number) => (
              <SwiperSlide key={brand._id || idx}>
                <motion.div
                  className='bg-white rounded-xl border border-gray-100 shadow-lg hover:shadow-xl transition p-3 sm:p-5 flex flex-col items-center group cursor-pointer'
                  custom={idx}
                  initial='hidden'
                  whileInView='visible'
                  viewport={{ once: true }}
                  variants={fadeInUp}
                  whileHover={{ y: -5 }}
                  onClick={() => navigate(`/brand/${brand._id}`)}
                >
                  <div className='h-12 sm:h-16 flex items-center justify-center mb-2 sm:mb-3'>
                    <img
                      src={brand.img || brand.logo || brand.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(brand.name)}&background=3b82f6&color=fff&size=200`}
                      alt={brand.name || 'Brand'}
                      className='max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-300'
                      onError={(e) => {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(brand.name)}&background=3b82f6&color=fff&size=200`;
                      }}
                    />
                  </div>

                  <div className='font-medium text-sm sm:text-base text-center line-clamp-1 max-w-[120px] sm:max-w-[150px]'>
                    {brand.name}
                  </div>

                  <div className='w-8 sm:w-12 h-0.5 bg-blue-500 mt-1 sm:mt-2 group-hover:w-16 sm:group-hover:w-20 transition-all duration-300'></div>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>


        </div>
      </motion.section>
    </div>
  )
}

export default HomePage
