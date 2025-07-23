import React, { useState, useRef, useEffect } from 'react'
import { Search } from 'lucide-react'
import { useNavigate } from 'react-router'
import { fetchListProduct } from '@/services/product-service/product.apis'
import { IProduct } from '@/types/product'

interface SearchBoxProps {
  placeholder?: string
  className?: string
  onClose?: () => void
  autoFocus?: boolean
}

const SearchBox: React.FC<SearchBoxProps> = ({ 
  placeholder = "Tìm kiếm sản phẩm...", 
  className = "",
  onClose,
  autoFocus = false
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<IProduct[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  // Xử lý tìm kiếm
  const handleSearch = async (query: string) => {
    if (query.trim().length < 2) {
      setSearchResults([])
      setShowSearchResults(false)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const response = await fetchListProduct({ 
        current: 1,
        pageSize: 5,
        qs: `name=/${query}/i`
      })
      const results = response?.data?.data?.results || response?.data?.results || response?.results || []
      if (results.length > 0) {
        setSearchResults(results)
        setShowSearchResults(true)
      } else {
        setSearchResults([])
        setShowSearchResults(false)
      }
    } catch (error) {
      console.error('Lỗi tìm kiếm:', error)
      setSearchResults([])
      setShowSearchResults(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    
    // Debounce search
    clearTimeout((window as any).searchTimeout)
    if (value.trim().length >= 2) {
      setIsLoading(true)
      ;(window as any).searchTimeout = setTimeout(() => {
        handleSearch(value)
      }, 300)
    } else {
      setSearchResults([])
      setShowSearchResults(false)
      setIsLoading(false)
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/shops?search=${encodeURIComponent(searchQuery.trim())}`)
      setShowSearchResults(false)
      setSearchQuery('')
      onClose?.()
    }
  }

  const handleProductClick = (productId: string) => {
    navigate(`/productDetail/${productId}`)
    setShowSearchResults(false)
    setSearchQuery('')
    onClose?.()
  }

  // Đóng kết quả tìm kiếm khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      <form onSubmit={handleSearchSubmit}>
        <input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleSearchInputChange}
          className="w-full h-10 px-4 pr-10 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
          autoFocus={autoFocus}
        />
        <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2">
          <Search size={18} className="text-gray-400 hover:text-purple-600" />
        </button>
      </form>
      
      {/* Kết quả tìm kiếm */}
      {showSearchResults && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 z-50 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-purple-600 border-r-transparent"></div>
              <span className="ml-2">Đang tìm kiếm...</span>
            </div>
          ) : searchResults.length > 0 ? (
            <>
              {searchResults.map((product) => (
                <div
                  key={product._id}
                  onClick={() => handleProductClick(product._id)}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <img
                    src={product.image || '/placeholder-product.jpg'}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900 line-clamp-1">{product.name}</h4>
                    <p className="text-sm text-purple-600 font-semibold">
                      {product.price?.toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                </div>
              ))}
              <div className="p-2 border-t border-gray-100">
                <button
                  onClick={() => handleSearchSubmit(new Event('submit') as any)}
                  className="w-full text-center text-sm text-purple-600 hover:text-purple-800 font-medium"
                >
                  Xem tất cả kết quả cho "{searchQuery}"
                </button>
              </div>
            </>
          ) : searchQuery.trim().length >= 2 ? (
            <div className="p-4 text-center text-gray-500">
              Không tìm thấy sản phẩm nào cho "{searchQuery}"
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

export default SearchBox