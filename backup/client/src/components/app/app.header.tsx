import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { useState, useEffect } from 'react'
import {  Link, useNavigate } from 'react-router'
import { Search, Heart, ShoppingBag, User, Menu, X, ChevronDown, Bell } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { CART_KEYS } from '@/services/cart-service/cart.keys'
import { fetchCartByUserAPI, fetchInfoCartAPI } from '@/services/cart-service/cart.apis'
import { setIdCartUser } from '@/redux/slices/cart.slice'
import SearchBox from '@/components/search-box'
import { getWishlist } from '@/services/wishlist-service/wishlist.apis'


const AppHeader = () => {
  const [open, setOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)
  const cartId = useAppSelector((state) => state.cart.IdCartUser)

  useEffect(() => {
    (async () => {
      const res = await fetchCartByUserAPI(user?._id || '')
      if (res && res.data) {
        dispatch(setIdCartUser(res.data._id))
        return res.data
      } else {
        throw new Error('Cart not found')
      }
    })()
  }, [dispatch, user?._id])

  const { data: cartByUser } = useQuery({
    queryKey: [CART_KEYS.FETCH_CART_INFO, cartId],
    queryFn: async () => {
      const response = await fetchInfoCartAPI(cartId || '')
      if (response && response.data) {
        return response.data
      }
    },
    enabled: !!cartId
  })

  // Fetch wishlist count
  const { data: wishlistData } = useQuery({
    queryKey: ['wishlist', user?._id],
    queryFn: async () => {
      try {
        const response = await getWishlist()
        return response.data || { results: [] }
      } catch (error) {
        return { results: [] }
      }
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 phút
    refetchOnWindowFocus: false // Tắt auto refetch
  })



  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleRedirectAccount = () => {
    if (!user) {
      navigate('/signin')
      return
    }
    navigate(`/account/${user._id}`)
  }

  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name)
  }

  return (
    <header
      className={`w-full sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'shadow-md bg-white/95 backdrop-blur-sm' : 'bg-white'
      }`}
    >
      {/* Main header */}
      <div className="px-4 md:px-6 lg:px-12 py-3 md:py-4 flex items-center justify-between border-b border-gray-100">
        {/* Mobile menu button */}

        <button
          className="md:hidden p-2 rounded-full hover:bg-gray-100"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Logo */}
        <Link to='/' className="flex items-center mr-2 md:mr-8">
          <img
            src="https://imagizer.imageshack.com/img923/4443/DdHwew.png"
            alt="VIETPERFUME Logo"
            className="h-8 md:h-10 object-contain"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          <Link to="/" className="px-3 py-2 text-neutral-800 font-semibold hover:text-purple-600 transition">
            Trang chủ
          </Link>

          <div className="relative group">
            <button
              className="px-3 py-2 text-neutral-700 font-medium hover:text-purple-600 transition flex items-center"
              onClick={() => toggleDropdown('shop')}
             >
              <Link to= '/shops'  className="flex items-center">
              Cửa hàng <ChevronDown size={16} className={`ml-1 transition-transform ${activeDropdown === 'shop' ? 'rotate-180' : ''}`} />
              </Link>
            </button>
            <div className={`absolute top-full left-0 bg-white shadow-lg rounded-lg w-56 py-2 transition-all ${activeDropdown === 'shop' ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
              <Link to="/shops/men" className="block px-4 py-2 hover:bg-purple-50 hover:text-purple-600 transition">
                Nước hoa nam
              </Link>
              <Link to="/shops/women" className="block px-4 py-2 hover:bg-purple-50 hover:text-purple-600 transition">
                Nước hoa nữ
              </Link>
              <Link to="/shops/unisex" className="block px-4 py-2 hover:bg-purple-50 hover:text-purple-600 transition">
                Nước hoa unisex
              </Link>
              <Link to="/shops/gift-sets" className="block px-4 py-2 hover:bg-purple-50 hover:text-purple-600 transition">
                Bộ quà tặng
              </Link>
            </div>
          </div>

          <div className="relative group">
            <button
              className="px-3 py-2 text-neutral-700 font-medium hover:text-purple-600 transition flex items-center"
              onClick={() => toggleDropdown('category')}
            >
              Danh mục <ChevronDown size={16} className={`ml-1 transition-transform ${activeDropdown === 'category' ? 'rotate-180' : ''}`} />
            </button>

            <div className={`absolute top-full left-0 bg-white shadow-lg rounded-lg w-56 py-2 transition-all ${activeDropdown === 'category' ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
              <Link to="/category/new-arrivals" className="block px-4 py-2 hover:bg-purple-50 hover:text-purple-600 transition">
                Sản phẩm mới
              </Link>
              <Link to="/category/best-sellers" className="block px-4 py-2 hover:bg-purple-50 hover:text-purple-600 transition">
                Bán chạy nhất
              </Link>
              <Link to="/category/sale" className="block px-4 py-2 hover:bg-purple-50 hover:text-purple-600 transition">
                Khuyến mãi
              </Link>
            </div>
          </div>

          <Link to="/blogs" className="px-3 py-2 text-neutral-700 font-medium hover:text-purple-600 transition">
            Tin tức
          </Link>

          <Link to="/about" className="px-3 py-2 text-neutral-700 font-medium hover:text-purple-600 transition">
            Giới thiệu
          </Link>
          <Link to="/contact" className="px-3 py-2 text-neutral-700 font-medium hover:text-purple-600 transition">
            Liên hệ
          </Link>
        </nav>

        {/* Search and Icons */}
        <div className="flex items-center gap-1 md:gap-3 ml-auto">
          {/* Search - Desktop */}
          <SearchBox className="hidden md:block w-48 lg:w-64" />

          {/* Search - Mobile */}
          <button
            className="md:hidden p-2 rounded-full hover:bg-gray-100"
            onClick={() => setSearchOpen(!searchOpen)}
          >
            <Search size={20} />
          </button>

          {/* Wishlist */}
          <button 
            onClick={() => {
              if (user) {
                navigate(`/account/${user._id}/wishlist`)
              } else {
                navigate('/auth/signin')
              }
            }}
            className="p-2 rounded-full hover:bg-gray-100 relative"
          >
            <Heart size={20} className="text-gray-700" />
            {user && (
              <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                {wishlistData?.results?.length || 0}
              </span>
            )}
          </button>

          {/* Cart */}
          <Link to="/cart" className="p-2 rounded-full hover:bg-gray-100 relative">
            <ShoppingBag size={20} className="text-gray-700" />
            <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
              {cartByUser?.length || 0}
            </span>
          </Link>

          {/* Account */}
          <button
            className="p-2 rounded-full hover:bg-gray-100"
            onClick={handleRedirectAccount}
          >
            <User size={20} className="text-gray-700" />
          </button>
        </div>
      </div>

      {/* Mobile Search Bar - Conditional */}
      {searchOpen && (
        <div className="md:hidden px-4 py-3 border-b border-gray-100 bg-white">
          <SearchBox 
            autoFocus 
            onClose={() => setSearchOpen(false)}
          />
        </div>
      )}

      {/* Mobile Navigation Menu */}
      {open && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setOpen(false)}>
          <div className="absolute top-0 left-0 w-4/5 h-full bg-white p-4 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* User info or login */}
            <div className="border-b border-gray-200 pb-4 mb-4">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <User size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    to="/signin"
                    className="w-full py-2 bg-purple-600 text-white text-center rounded-lg font-medium"
                    onClick={() => setOpen(false)}
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/signup"
                    className="w-full py-2 border border-purple-600 text-purple-600 text-center rounded-lg font-medium"
                    onClick={() => setOpen(false)}
                  >
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>

            {/* Navigation links */}
            <nav className="flex flex-col gap-1">
              <Link
                to="/"
                className="px-2 py-3 text-neutral-800 font-semibold hover:bg-purple-50 rounded-lg"
                onClick={() => setOpen(false)}
              >
                Trang chủ
              </Link>

              <div className="px-2 py-3 text-neutral-700 font-medium">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleDropdown('mobileShop')}
                >
                  <span>Cửa hàng</span>
                  <ChevronDown size={18} className={`transition-transform ${activeDropdown === 'mobileShop' ? 'rotate-180' : ''}`} />
                </div>

                {activeDropdown === 'mobileShop' && (
                  <div className="mt-2 ml-4 flex flex-col gap-2">
                    <Link
                      to="/shops/men"
                      className="py-2 hover:text-purple-600"
                      onClick={() => setOpen(false)}
                    >
                      Nước hoa nam
                    </Link>
                    <Link
                      to="/shops/women"
                      className="py-2 hover:text-purple-600"
                      onClick={() => setOpen(false)}
                    >
                      Nước hoa nữ
                    </Link>
                    <Link
                      to="/shops/unisex"
                      className="py-2 hover:text-purple-600"
                      onClick={() => setOpen(false)}
                    >
                      Nước hoa unisex
                    </Link>
                    <Link
                      to="/shops/gift-sets"
                      className="py-2 hover:text-purple-600"
                      onClick={() => setOpen(false)}
                    >
                      Bộ quà tặng
                    </Link>
                  </div>
                )}
              </div>

              <div className="px-2 py-3 text-neutral-700 font-medium">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleDropdown('mobileCategory')}
                >
                  <span>Danh mục</span>
                  <ChevronDown size={18} className={`transition-transform ${activeDropdown === 'mobileCategory' ? 'rotate-180' : ''}`} />
                </div>

                {activeDropdown === 'mobileCategory' && (
                  <div className="mt-2 ml-4 flex flex-col gap-2">
                    <Link
                      to="/category/new-arrivals"
                      className="py-2 hover:text-purple-600"
                      onClick={() => setOpen(false)}
                    >
                      Sản phẩm mới
                    </Link>
                    <Link
                      to="/category/best-sellers"
                      className="py-2 hover:text-purple-600"
                      onClick={() => setOpen(false)}
                    >
                      Bán chạy nhất
                    </Link>
                    <Link
                      to="/category/sale"
                      className="py-2 hover:text-purple-600"
                      onClick={() => setOpen(false)}
                    >
                      Khuyến mãi
                    </Link>
                  </div>
                )}
              </div>

              <Link
                to="/blogs"
                className="px-2 py-3 text-neutral-700 font-medium hover:bg-purple-50 rounded-lg"
                onClick={() => setOpen(false)}
              >
                Tin tức
              </Link>

              <Link
                to="/about"
                className="px-2 py-3 text-neutral-700 font-medium hover:bg-purple-50 rounded-lg"
                onClick={() => setOpen(false)}
              >
                Giới thiệu
              </Link>
            </nav>

            {/* Additional links */}
            <div className="mt-6 border-t border-gray-200 pt-4">
              <div className="flex flex-col gap-3">
                <a href="#" className="flex items-center gap-2 px-2 py-2 text-gray-600 hover:text-purple-600">
                  <Bell size={18} />
                  <span>Thông báo</span>
                </a>
                <a href="#" className="flex items-center gap-2 px-2 py-2 text-gray-600 hover:text-purple-600">
                  <ShoppingBag size={18} />
                  <span>Đơn hàng của tôi</span>
                </a>
                <a href="tel:+84123456789" className="flex items-center gap-2 px-2 py-2 text-gray-600 hover:text-purple-600">
                  <span>Hotline: 0123 456 789</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default AppHeader
