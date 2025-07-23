import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Heart, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router'

const ProductsSimilar = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [wishlist, setWishlist] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 8

  const fetchProductSimilar = async () => {
    const res = await axios.get('http://localhost:8080/api/v1/products')
    return Array.isArray(res.data?.data?.results) ? res.data.data.results : []
  }

  const { data: products = [], isLoading, isError } = useQuery({
    queryKey: ['productSimilar', id],
    queryFn: fetchProductSimilar,
    enabled: !!id
  })

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    )
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const paginatedProducts = products.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  if (isLoading) {
    return (
      <div className="text-center py-12 text-gray-600">
        Đang tải sản phẩm tương tự...
      </div>
    )
  }

  if (isError) {
    return (
      <div className="text-center text-red-500 py-12">
        Không thể tải sản phẩm tương tự. Vui lòng thử lại sau.
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1 h-8 bg-purple-600"></div>
        <h2 className="text-2xl font-bold text-gray-900">Sản phẩm tương tự</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {paginatedProducts.map((product: any) => (
          <div
            key={product._id}
            className="group cursor-pointer flex flex-col h-full bg-white rounded-2xl shadow-sm hover:shadow-md transition-all"
            onClick={() => {
              navigate(`/productDetail/${product._id}`)
            }}
          >
            <div
              className="relative flex items-center justify-center"
              style={{
                width: '100%',
                aspectRatio: '1/1',
                minHeight: 220,
                maxHeight: 260,
                borderTopLeftRadius: '1rem',
                borderTopRightRadius: '1rem',
                overflow: 'hidden'
              }}
            >
              <img
                src={product.image || '/placeholder.svg'}
                alt={product.name}
                className="object-contain"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}
                crossOrigin='anonymous'
              />
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleWishlist(product._id)
                }}
                className="absolute top-4 right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all"
              >
                <Heart
                  className={`w-4 h-4 ${
                    wishlist.includes(product._id)
                      ? 'fill-red-500 text-red-500'
                      : 'text-gray-400'
                  }`}
                />
              </button>
            </div>

            <div className="p-4 flex flex-col flex-1 justify-end">
              <div className="flex justify-between items-end">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-500 mb-2">
                    {product.brandId?.name || ''}
                  </p>
                </div>
                <span className="font-bold text-gray-900 text-base">
                  {product.price
                    ? `₫${product.price.toLocaleString('vi-VN')}`
                    : ''}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-center items-center gap-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {Array.from({ length: Math.ceil(products.length / pageSize) }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`px-3 py-1 rounded border text-sm ${
              currentPage === page
                ? 'bg-purple-600 text-white border-purple-600'
                : 'border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === Math.ceil(products.length / pageSize)}
          className="p-2 rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  )
}

export default ProductsSimilar
