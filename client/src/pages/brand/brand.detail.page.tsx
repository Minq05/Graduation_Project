import { useParams, useNavigate } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { PRODUCT_KEYS } from '@/services/product-service/product.keys'
import { fetchListProduct, fetchBrandById } from '@/services/product-service/product.apis'
import { motion } from 'framer-motion'
import { Star, Heart, ShoppingBag, ArrowLeft } from 'lucide-react'
import { useState } from 'react'

interface Product {
  _id: string
  name: string
  price?: number
  img?: string
  image?: string
  brand?: string
  brandId?: string
}

interface Brand {
  _id: string
  name: string
  img?: string
  logo?: string
  image?: string
  desc?: string
  description?: string
}

const BrandDetailPage = () => {
  const { brandId } = useParams<{ brandId: string }>()
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1)
  const productsPerPage = 12

  // Lấy thông tin brand
  const { data: brandData, isLoading: isLoadingBrand } = useQuery({
    queryKey: [PRODUCT_KEYS.FETCH_BRAND_BY_ID, brandId],
    queryFn: () => fetchBrandById(brandId!),
    enabled: !!brandId,
    select: (res) => res.data
  })

  // Lấy sản phẩm theo brand
  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: [PRODUCT_KEYS.FETCH_LIST_PRODUCT, 'brand', brandId],
    queryFn: () => fetchListProduct({ brand: brandId }),
    enabled: !!brandId,
    select: (res) => res.data
  })

  const brand: Brand = brandData || {}
  
  // Xử lý dữ liệu sản phẩm
  let allProducts: Product[] = []
  if (productsData?.results && Array.isArray(productsData.results)) {
    allProducts = productsData.results
  } else if (productsData && Array.isArray(productsData)) {
    allProducts = productsData
  } else if (productsData?.data?.results && Array.isArray(productsData.data.results)) {
    allProducts = productsData.data.results
  }
  
  // Filter sản phẩm theo brand (client-side)
  const products: Product[] = allProducts.filter(product => {
    // Kiểm tra nhiều trường có thể chứa brand ID
    return product.brandId === brandId || 
           product.brand === brandId || 
           product.brand === brand.name ||
           (product.brandId && product.brandId._id === brandId) ||
           (typeof product.brand === 'object' && product.brand._id === brandId)
  })
  
  console.log('Brand ID:', brandId)
  console.log('Brand Name:', brand.name)
  console.log('All products:', allProducts.length)
  console.log('Filtered products:', products.length)

  // Pagination
  const totalPages = Math.ceil(products.length / productsPerPage)
  const startIndex = (currentPage - 1) * productsPerPage
  const currentProducts = products.slice(startIndex, startIndex + productsPerPage)

  if (isLoadingBrand || isLoadingProducts) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <div className='animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500'></div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white shadow-sm'>
        <div className='container mx-auto px-4 py-6'>
          <button
            onClick={() => navigate(-1)}
            className='inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 hover:text-blue-600 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 mb-6 group'
          >
            <ArrowLeft size={18} className='mr-2 transition-transform duration-200 group-hover:-translate-x-1' />
            Quay lại
          </button>
          
          <div className='flex flex-col md:flex-row items-center gap-6'>
            <div className='w-32 h-32 bg-white rounded-lg shadow-md flex items-center justify-center'>
              <img
                src={brand.img || brand.logo || brand.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(brand.name || 'Brand')}&background=3b82f6&color=fff&size=128`}
                alt={brand.name}
                className='max-w-full max-h-full object-contain'
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(brand.name || 'Brand')}&background=3b82f6&color=fff&size=128`
                }}
              />
            </div>
            
            <div className='text-center md:text-left'>
              <h1 className='text-3xl font-bold text-gray-900 mb-2'>{brand.name}</h1>
              {brand.desc && (
                <p className='text-gray-600 max-w-2xl' dangerouslySetInnerHTML={{ __html: brand.desc }} />
              )}
              <div className='mt-4 text-sm text-gray-500'>
                {products.length} sản phẩm
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className='container mx-auto px-4 py-8'>
        {products.length === 0 ? (
          <div className='text-center py-16'>
            <div className='text-gray-400 mb-4'>
              <ShoppingBag size={64} className='mx-auto' />
            </div>
            <h3 className='text-xl font-semibold text-gray-600 mb-2'>
              Chưa có sản phẩm nào
            </h3>
            <p className='text-gray-500'>
              Thương hiệu này hiện chưa có sản phẩm nào.
            </p>
          </div>
        ) : (
          <>
            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8'>
              {currentProducts.map((product, idx) => (
                <motion.div
                  key={product._id}
                  className='bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-3 cursor-pointer group'
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => navigate(`/productDetail/${product._id}`)}
                >
                  <div className='relative mb-3'>
                    <img
                      src={(() => {
                        const img = product.img || product.image
                        if (Array.isArray(img)) return img[0] || 'https://images.unsplash.com/photo-1615368144592-35d25066b873?q=80&w=300'
                        return img || 'https://images.unsplash.com/photo-1615368144592-35d25066b873?q=80&w=300'
                      })()}
                      alt={product.name}
                      className='w-full h-40 object-cover rounded-md group-hover:scale-105 transition-transform duration-300'
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1615368144592-35d25066b873?q=80&w=300'
                      }}
                    />
                    
                    <button className='absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity'>
                      <Heart size={16} className='text-gray-400 hover:text-red-500' />
                    </button>
                  </div>
                  
                  <div>
                    <h3 
                      className='font-medium text-sm line-clamp-2 mb-2 h-10'
                      dangerouslySetInnerHTML={{ __html: product.name || '' }}
                    />
                    
                    <div className='flex items-center mb-2'>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} className={i < 4 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
                      ))}
                    </div>
                    
                    <div className='text-blue-600 font-semibold text-sm'>
                      {typeof product.price === 'number' ? product.price.toLocaleString() : product.price}₫
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className='flex justify-center items-center gap-2'>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className='px-3 py-2 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  Trước
                </button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-2 rounded-md ${
                      currentPage === i + 1
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className='px-3 py-2 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  Sau
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default BrandDetailPage