import React from 'react'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { PRODUCT_KEYS } from '@/services/product-service/product.keys'
import { fetchListProduct } from '@/services/product-service/product.apis'
import { BlogCategories } from './blog.categories'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'

interface BlogSidebarProps {
  dataIframe: {
    type: string
    src: string
    height: number
    title: string
  }[]
  searchTerm: string
  onSearch: (value: string) => void
  onSearchSubmit: (e: React.FormEvent) => void
  selectedCategory: string | null
  onSelectCategory: (categoryId: string | null) => void
}

interface Product {
  _id: string
  name: string
  price?: number
  img?: string
  image?: string
  // Thêm các trường khác nếu cần
}

export const BlogSidebar: React.FC<BlogSidebarProps> = ({
  dataIframe,
  searchTerm,
  onSearch,
  onSearchSubmit,
  selectedCategory,
  onSelectCategory
}) => {
  // Sản phẩm
  const {
    data: dataProducts,
    isLoading
  } = useQuery({
    queryKey: [PRODUCT_KEYS.FETCH_LIST_PRODUCT],
    queryFn: () => fetchListProduct({}),
    select: (res) => res.data
  })

  // Xử lý dữ liệu
  const products: Product[] = Array.isArray(dataProducts?.results) ? dataProducts.results : []
  return (
    <>
      {/* Search box */}
      <div className='bg-white rounded-xl shadow-sm p-4 mb-6'>
        <h3 className='text-lg font-semibold mb-3'>Tìm kiếm</h3>
        <form onSubmit={onSearchSubmit} className='relative'>
          <input
            type='text'
            placeholder='Tìm kiếm bài viết...'
            className='w-full px-4 py-2 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
          />
          <button
            type='submit'
            className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-600'
          >
            <Search size={18} />
          </button>
        </form>
      </div>

      <BlogCategories
        onSelectCategory={onSelectCategory}
        selectedCategory={selectedCategory}
      />

      {/* Thêm phần render iframe nếu muốn */}
      {dataIframe && dataIframe.length > 0 && (
        <div className='bg-white rounded-xl shadow-sm p-4 mb-6'>
          <h3 className='text-lg font-semibold mb-3'>Video liên quan</h3>
          {dataIframe.map((item) => (
            <div key={item.title} className='mb-4'>
              <iframe
                src={item.src}
                height={item.height}
                title={item.title}
                className='w-full rounded-lg'
                allowFullScreen
              />
              <div className='text-sm mt-2'>{item.title}</div>
            </div>
          ))}
        </div>
      )}

      {/* Featured products */}
      <div className='bg-white rounded-xl shadow-sm p-4 mb-6'>
        <h3 className='text-lg font-semibold mb-3'>Sản phẩm nổi bật</h3>
        {isLoading ? (
          <div className='animate-pulse space-y-4'>
            {[1, 2].map((i) => (
              <div key={i} className='bg-gray-200 h-24 rounded-lg mb-3 md:hidden'></div>
            ))}
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className='bg-gray-200 h-24 rounded-lg mb-3 hidden md:block'></div>
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className='relative max-h-[220px] md:max-h-[400px] overflow-hidden'>
            <Swiper
              direction='vertical'
              slidesPerView={2}
              breakpoints={{
                768: {
                  slidesPerView: 4
                }
              }}
              spaceBetween={12}
              navigation={{
                nextEl: '.custom-next-product',
                prevEl: '.custom-prev-product'
              }}
              modules={[Navigation]}
              className='product-swiper h-[220px] md:h-[400px]'
            >
              {products.map((product) => (
                <SwiperSlide key={product._id}>
                  <div className='transform transition-all duration-300 hover:scale-[1.02]'>
                    <a href={`/productDetail/${product._id}`} className='block'>
                      <div className='bg-white p-2 rounded-lg shadow-sm border border-gray-100 flex items-center'>
                        <div className='rounded overflow-hidden w-16 h-16 flex-shrink-0'>
                          <img
                            src={product.img || product.image || 'https://via.placeholder.com/300x180?text=Sản+phẩm'}
                            alt={product.name}
                            className='w-full h-full object-cover'
                            crossOrigin='anonymous'
                          />
                        </div>
                        <div className='ml-2 flex-1'>
                          <div className='text-sm font-medium line-clamp-2'>
                            {product.name}
                          </div>
                          <div className='text-xs text-purple-600 font-bold'>
                            {typeof product.price === 'number' ? `${product.price.toLocaleString('vi-VN')}đ` : 'Liên hệ'}
                          </div>
                        </div>
                      </div>
                    </a>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            <button className='custom-prev-product absolute top-0 right-0 z-10 bg-white shadow-sm rounded-full p-1 flex items-center justify-center hover:bg-purple-100 transition border border-gray-100 active:scale-90'>
              <ChevronLeft size={14} className='text-purple-600 rotate-90' />
            </button>
            <button className='custom-next-product absolute bottom-0 right-0 z-10 bg-white shadow-sm rounded-full p-1 flex items-center justify-center hover:bg-purple-100 transition border border-gray-100 active:scale-90'>
              <ChevronRight size={14} className='text-purple-600 rotate-90' />
            </button>
          </div>
        ) : (
          <div className='text-center py-4 text-gray-500'>
            Không có sản phẩm nổi bật
          </div>
        )}
      </div>
    </>
  )
}
