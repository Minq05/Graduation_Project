import React, { useState, useEffect } from 'react'
import axios from 'axios'
import {
  ChevronDown,
  ChevronUp,
  Star,
  Search,
  Heart
} from 'lucide-react'
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router';
import { addToWishlist, removeFromWishlist, checkProductInWishlist } from '@/services/wishlist-service/wishlist.apis';
import { getFlashSaleProducts } from '@/services/flash-sale-service/flash-sale.apis';
import { RootState } from '@/redux/store';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';

// Danh sách thương hiệu mặc định
const DEFAULT_BRANDS = [
  'Dior', 'Chanel', 'Gucci', 'Versace', 'Calvin Klein', 'Jo Malone', 'Le Labo', 'Hermès', 'Tom Ford'
]

const VOLUMES = ['10ml', '30ml', '50ml', '100ml', '150ml+'];
const RATINGS = [4, 3, 2, 1];

const PRICE_RANGES = [
  { label: '0–500K', min: 0, max: 500000 },
  { label: '500K–1 triệu', min: 500000, max: 1000000 },
  { label: '1–2 triệu', min: 1000000, max: 2000000 },
  { label: '2 triệu trở lên', min: 2000000, max: null }
];

const PAGE_SIZE = 12;

const ProductPage = () => {
  // UI state
  const [showBrandMore, setShowBrandMore] = useState(false);
  const [showPrice, setShowPrice] = useState(true);
  const [showVolume, setShowVolume] = useState(true);
  const [showBrand, setShowBrand] = useState(true);

  const [showRating, setShowRating] = useState(true);

  // Filter state
  const [selectedPriceRange, setSelectedPriceRange] = useState<number | null>(null);
  const [selectedVolumes, setSelectedVolumes] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);

  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  // Data state
  const [products, setProducts] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [meta, setMeta] = useState({ current: 1, pageSize: PAGE_SIZE, pages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [wishlistStatus, setWishlistStatus] = useState<Record<string, boolean>>({});
  const [availableBrands, setAvailableBrands] = useState<string[]>(DEFAULT_BRANDS);
  const [flashSaleProducts, setFlashSaleProducts] = useState<any[]>([]);

  const navigate = useNavigate();
  const location = useLocation();
  const { isSignin, user } = useSelector((state: RootState) => state.auth);
  const queryClient = useQueryClient();

  // Lấy category từ URL
  const getCategoryFromPath = () => {
    const path = location.pathname;
    if (path.includes('/shops/men')) return { id: '6835c1f13cbaf6b9573037c8', name: 'Nước Hoa Nam' };
    if (path.includes('/shops/women')) return { id: '6882fc7cee387307136c7287', name: 'Nước Hoa Nữ' };
    if (path.includes('/shops/unisex')) return { id: '6882fc85ee387307136c728a', name: 'Nước Hoa Unisex' };
    return null;
  };

  const currentCategory = getCategoryFromPath();

  // Lấy tất cả sản phẩm khi component mount hoặc category thay đổi
  useEffect(() => {
    fetchAllProducts();
    fetchFlashSaleProducts();
  }, [currentCategory]);

  // Lấy danh sách flash sale products
  const fetchFlashSaleProducts = async () => {
    try {
      const res = await getFlashSaleProducts();
      if (res && res.statusCode === 200 && res.data && Array.isArray(res.data)) {
        setFlashSaleProducts(res.data);
      }
    } catch (error) {
      console.error('Error fetching flash sale products:', error);
    }
  };

  // Lọc và phân trang khi có thay đổi
  useEffect(() => {
    if (allProducts.length > 0) {
      setMeta(prev => ({ ...prev, current: 1 }));
      filterAndPaginateProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    search,
    selectedPriceRange,
    selectedVolumes,
    selectedBrands,
    selectedRating,
    allProducts
  ]);

  // Xử lý thay đổi trang
  useEffect(() => {
    if (allProducts.length > 0) {
      filterAndPaginateProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meta.current]);
  // Lấy tất cả sản phẩm từ API (theo batch)
  const fetchAllProducts = async () => {
    setInitialLoading(true);
    try {
      let allProductsData: any[] = [];
      let currentPage = 1;
      let hasMore = true;
      
      while (hasMore) {
        const params: any = { 
          current: currentPage, 
          pageSize: 100 // Giới hạn tối đa của API
        };
        let qsArr: string[] = [];
        
        if (currentCategory) qsArr.push(`categoryId=${currentCategory.id}`);
        if (qsArr.length > 0) params.qs = qsArr.join('&');
        
        const res = await axios.get('http://localhost:8080/api/v1/products', { params });
        if (res.data?.data?.results) {
          const products = res.data.data.results;
          allProductsData = [...allProductsData, ...products];
          
          // Kiểm tra còn trang nào không
          const meta = res.data.data.meta;
          hasMore = currentPage < (meta?.pages || 1);
          currentPage++;
        } else {
          hasMore = false;
        }
      }
      
      setAllProducts(allProductsData);
      
      // Cập nhật danh sách thương hiệu
      const brands = [...new Set(allProductsData
        .map((product: any) => product.brandId?.name)
        .filter(Boolean)
      )] as string[];
      if (brands.length > 0) {
        setAvailableBrands(brands.sort());
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setAllProducts([]);
    } finally {
      setInitialLoading(false);
    }
  };
  
  // Lọc và phân trang sản phẩm
  const filterAndPaginateProducts = () => {
    setLoading(true);
    
    // Sử dụng setTimeout để cho phép UI cập nhật loading state
    setTimeout(() => {
      let filtered = [...allProducts];
    
    // Lọc theo tìm kiếm
    if (search) {
      filtered = filtered.filter(product => 
        product.name?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Lọc theo giá
    if (selectedPriceRange !== null) {
      const priceRange = PRICE_RANGES[selectedPriceRange];
      filtered = filtered.filter(product => {
        const price = product.price || 0;
        if (priceRange.max) {
          return price >= priceRange.min && price <= priceRange.max;
        } else {
          return price >= priceRange.min;
        }
      });
    }
    
    // Lọc theo dung tích
    if (selectedVolumes.length > 0) {
      filtered = filtered.filter(product => {
        const capacity = product.capacity || 0;
        return selectedVolumes.some(volume => {
          if (volume === '150ml+') {
            return capacity >= 150;
          }
          const volumeNumber = parseInt(volume.replace(/ml/g, ''));
          return capacity === volumeNumber;
        });
      });
    }
    
    // Lọc theo thương hiệu
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(product => {
        const brandName = product.brandId?.name || '';
        return selectedBrands.some(selectedBrand => 
          brandName.toLowerCase().includes(selectedBrand.toLowerCase())
        );
      });
    }
    
    // Lọc theo đánh giá
    if (selectedRating !== null) {
      filtered = filtered.filter(product => {
        const rating = product.rating || 0;
        return rating >= selectedRating;
      });
    }
    
    // Phân trang
    const total = filtered.length;
    const pages = Math.ceil(total / PAGE_SIZE);
    const startIndex = (meta.current - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    const paginatedProducts = filtered.slice(startIndex, endIndex);
    
    setProducts(paginatedProducts);
    setMeta(prev => ({
      ...prev,
      pages: pages || 1,
      total
    }));
    
      // Check wishlist
      if (paginatedProducts.length > 0 && isSignin && user) {
        const productIds = paginatedProducts.map(product => product._id).filter(Boolean);
        const hasNewProducts = productIds.some(id => !(id in wishlistStatus));
        if (hasNewProducts) {
          checkWishlistStatus(productIds);
        }
      }
      
      setLoading(false);
    }, 100); // Delay ngắn để hiện thị loading
  };

  // Xử lý chuyển trang
  const handlePageChange = (page: number) => {
    setMeta(prev => ({ ...prev, current: page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Xử lý tìm kiếm
  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
    clearTimeout((window as any).searchTimeout);
    (window as any).searchTimeout = setTimeout(() => {
      setSearch(e.target.value.trim());
    }, 300); // Giảm thời gian debounce
  };

  // Xử lý lọc theo giá
  const handlePriceChange = (index: number) => {
    setSelectedPriceRange(selectedPriceRange === index ? null : index);
  };
  // Xử lý lọc theo dung tích
  const handleVolumeChange = (volume: string) => {
    setSelectedVolumes(prev => prev.includes(volume) ? prev.filter(v => v !== volume) : [...prev, volume]);
  };
  // Xử lý lọc theo thương hiệu
  const handleBrandChange = (brand: string) => {
    setSelectedBrands(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]);
  };

  // Xử lý lọc theo đánh giá
  const handleRatingChange = (rating: number) => {
    setSelectedRating(selectedRating === rating ? null : rating);
  };

  // Kiểm tra trạng thái wishlist cho tất cả sản phẩm (tối ưu hóa)
  const checkWishlistStatus = async (productIds: string[]) => {
    if (!isSignin || !user || productIds.length === 0) return;
    try {
      // Chỉ check những sản phẩm chưa được check
      const uncheckedIds = productIds.filter(id => !(id in wishlistStatus));
      if (uncheckedIds.length === 0) return;
      
      const statusPromises = uncheckedIds.map(async (productId) => {
        try {
          const response = await checkProductInWishlist(productId);
          return { productId, isInWishlist: response.data.data.isInWishlist };
        } catch (error) {
          return { productId, isInWishlist: false };
        }
      });
      const results = await Promise.all(statusPromises);
      const statusMap = results.reduce((acc, { productId, isInWishlist }) => {
        acc[productId] = isInWishlist;
        return acc;
      }, {} as Record<string, boolean>);
      setWishlistStatus(prev => ({ ...prev, ...statusMap }));
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    }
  };

  // Toggle wishlist
  const handleToggleWishlist = async (productId: string) => {
    if (!isSignin || !user) {
      toast.error('Vui lòng đăng nhập để thêm vào yêu thích');
      navigate('/signin');
      return;
    }
    try {
      const isCurrentlyInWishlist = wishlistStatus[productId];
      if (isCurrentlyInWishlist) {
        await removeFromWishlist(productId);
        toast.success('Đã xóa khỏi danh sách yêu thích!');
        setWishlistStatus(prev => ({ ...prev, [productId]: false }));
      } else {
        await addToWishlist(productId);
        toast.success('Đã thêm vào danh sách yêu thích!');
        setWishlistStatus(prev => ({ ...prev, [productId]: true }));
        // Invalidate wishlist query để update số lượng ở header
        queryClient.invalidateQueries({ queryKey: ['wishlist'] });
        navigate(`/account/${user._id}/wishlist`);
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra, vui lòng thử lại');
    }
  };

  // Xóa toàn bộ filter
  const handleClearFilters = () => {
    setSelectedPriceRange(null);
    setSelectedVolumes([]);
    setSelectedBrands([]);
    setSelectedRating(null);
    setSearch('');
    setSearchInput('');
  };

  const getCategoryTitle = () => {
    return currentCategory?.name || 'Tất cả sản phẩm';
  };

  // Kiểm tra sản phẩm có flash sale không
  const getProductFlashSale = (productId: string) => {
    return flashSaleProducts.find(item => item.productId._id === productId);
  };

  return (
    <div className="bg-white min-h-screen py-4 mt-[80px]">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        {/* Breadcrumb & Title */}
        <div className="py-4">
          <nav className="text-sm text-gray-500 mb-2">
            <span>Trang chủ</span> / <span>Cửa hàng</span>
            {currentCategory && <span> / <span className="text-purple-600">{getCategoryTitle()}</span></span>}
          </nav>
          <h1 className="text-2xl font-bold text-gray-900">{getCategoryTitle()}</h1>
        </div>


        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-[300px] flex-shrink-0 bg-white rounded-xl shadow border border-gray-200 p-5 h-fit overflow-y-auto max-h-[85vh]">
            {/* Tìm kiếm */}
            <div className="flex items-center gap-2 mb-6">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-purple-500 w-full pr-10"
                  value={searchInput}
                  onChange={handleSearchInput}
                />
                <Search size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-2">
              <h2 className="text-xl font-bold tracking-wide text-purple-700">Bộ lọc</h2>
              {(selectedPriceRange !== null || selectedVolumes.length > 0 || selectedBrands.length > 0 ||
                selectedRating !== null) && (
                <button
                  onClick={handleClearFilters}
                  className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
            {/* Price Range */}
            <section className="mb-5">
              <button type="button" className="flex justify-between items-center w-full font-semibold text-gray-900 mb-3"
                onClick={() => setShowPrice(v => !v)}>
                Mức giá
                {showPrice ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              {showPrice && (
                <div>
                  <div className="flex flex-col gap-2">
                    {PRICE_RANGES.map((range, index) => (
                      <label key={index} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="price"
                          className="accent-purple-600 cursor-pointer"
                          checked={selectedPriceRange === index}
                          onChange={() => handlePriceChange(index)}
                        />
                        {range.label}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </section>
            {/* Volume */}
            <section className="mb-5">
              <button type="button" className="flex justify-between items-center w-full font-semibold text-gray-900 mb-3"
                onClick={() => setShowVolume(v => !v)}>
                Dung tích
                {showVolume ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              {showVolume && (
                <div className="flex flex-col gap-2">
                  {VOLUMES.map(v => (
                    <label key={v} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="accent-purple-600 cursor-pointer"
                        checked={selectedVolumes.includes(v)}
                        onChange={() => handleVolumeChange(v)}
                      />
                      {v}
                    </label>
                  ))}
                </div>
              )}
            </section>
            {/* Brand */}
            <section className="mb-5">
              <button type="button" className="flex justify-between items-center w-full font-semibold text-gray-900 mb-3"
                onClick={() => setShowBrand(v => !v)}>
                Thương hiệu
                {showBrand ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              {showBrand && (
                <div className="flex flex-col gap-2">
                  {(showBrandMore ? availableBrands : availableBrands.slice(0, 5)).map(b => (
                    <label key={b} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="accent-purple-600 cursor-pointer"
                        checked={selectedBrands.includes(b)}
                        onChange={() => handleBrandChange(b)}
                      />
                      {b}
                    </label>
                  ))}
                  {availableBrands.length > 5 && (
                    <button
                      type="button"
                      className="text-purple-600 text-sm flex items-center gap-1 mt-1"
                      onClick={() => setShowBrandMore(v => !v)}
                    >
                      {showBrandMore ? <>Ẩn bớt <ChevronUp size={16} /></> : <>Xem thêm <ChevronDown size={16} /></>}
                    </button>
                  )}
                </div>
              )}
            </section>

            {/* Rating */}
            <section className="mb-5">
              <button type="button" className="flex justify-between items-center w-full font-semibold text-gray-900 mb-3"
                onClick={() => setShowRating(v => !v)}>
                Đánh giá
                {showRating ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              {showRating && (
                <div className="flex flex-col gap-2">
                  {RATINGS.map(r => (
                    <label key={r} className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="rating"
                        className="accent-purple-600 cursor-pointer"
                        checked={selectedRating === r}
                        onChange={() => handleRatingChange(r)}
                      />
                      <span className="flex items-center">
                        {[...Array(r)].map((_, i) => <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" fill="currentColor" />)}
                        <span className="ml-1 text-xs text-gray-600">{r} sao trở lên</span>
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </section>
          </aside>

          {/* Main Content */}
          <section className="flex-1 product-section">
            {/* Product Count and Active Filters */}
            {(!loading || meta.total > 0 || selectedPriceRange !== null || selectedVolumes.length > 0 ||
              selectedBrands.length > 0 || selectedRating !== null || search) && (
              <div className="bg-white rounded-xl shadow p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-700">
                    Tìm thấy <span className="text-purple-700 font-bold">{meta.total}</span> sản phẩm
                    {search && <span className="ml-1 text-gray-500">cho từ khóa "<span className="italic">{search}</span>"</span>}
                  </span>
                  {(selectedPriceRange !== null || selectedVolumes.length > 0 || selectedBrands.length > 0 ||
                    selectedRating !== null) && (
                    <span className="text-sm text-gray-500">Đang lọc theo {(selectedPriceRange !== null ? 1 : 0) + selectedVolumes.length + selectedBrands.length + (selectedRating !== null ? 1 : 0)} tiêu chí</span>
                  )}
                </div>
                {(selectedPriceRange !== null || selectedVolumes.length > 0 || selectedBrands.length > 0 ||
                  selectedRating !== null) && (
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="font-medium text-gray-700">Bộ lọc đang áp dụng:</span>
                    {selectedPriceRange !== null && (
                      <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                        {PRICE_RANGES[selectedPriceRange].label}
                        <button
                          onClick={() => setSelectedPriceRange(null)}
                          className="ml-1 hover:text-purple-600"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {selectedVolumes.map(volume => (
                      <span key={volume} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                        {volume}
                        <button
                          onClick={() => handleVolumeChange(volume)}
                          className="ml-1 hover:text-purple-600"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    {selectedBrands.map(brand => (
                      <span key={brand} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                        {brand}
                        <button
                          onClick={() => handleBrandChange(brand)}
                          className="ml-1 hover:text-purple-600"
                        >
                          ×
                        </button>
                      </span>
                    ))}

                    {selectedRating !== null && (
                      <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                        {selectedRating} sao trở lên
                        <button
                          onClick={() => setSelectedRating(null)}
                          className="ml-1 hover:text-purple-600"
                        >
                          ×
                        </button>
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {initialLoading ? (
              <div className="text-center py-10">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                  <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
                </div>
                <div className="mt-4 text-gray-500">Đang tải sản phẩm...</div>
              </div>
            ) : (
              <>
                {products && products.length > 0 ? (
                  <div className="relative">
                    {loading && (
                      <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-xl">
                        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-purple-600 border-r-transparent" />
                      </div>
                    )}
                    <div className={`grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 ${loading ? 'opacity-50' : ''}`}>
                      {products.map((product) => (
                      <div
                        key={product._id}
                        className="relative bg-white rounded-xl border-2 border-gray-200 shadow hover:shadow-xl transition p-4 flex flex-col items-center group cursor-pointer"
                        onClick={() => navigate(`/productDetail/${product._id}`)}
                      >
                        {/* Flash Sale Badge */}
                        {(() => {
                          const flashSale = getProductFlashSale(product._id);
                          return flashSale ? (
                            <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10 animate-pulse">
                              -{flashSale.discountPercent}%
                            </div>
                          ) : null;
                        })()}

                        {/* Heart icon ở góc trên phải */}
                        <button
                          className="absolute top-3 right-3 z-10 bg-white rounded-full p-1 shadow hover:bg-purple-100 transition"
                          onClick={e => {
                            e.stopPropagation();
                            handleToggleWishlist(product._id);
                          }}
                          aria-label="Thêm vào yêu thích"
                        >
                          <Heart
                            size={22}
                            className={`transition-colors ${
                              wishlistStatus[product._id]
                                ? 'text-red-500 fill-red-500'
                                : 'text-gray-400 hover:text-red-500'
                            }`}
                          />
                        </button>
                        <img
                          src={(product.image && Array.isArray(product.image) ? product.image[0] : product.image) || product.img || 'https://via.placeholder.com/300x400?text=No+Image'}
                          alt={product.name}
                          className="w-full h-60 object-cover rounded-lg mb-4 group-hover:scale-105 transition-transform duration-200"
                        />
                        <div 
                          className="font-bold text-lg mb-1 text-center line-clamp-2 min-h-[3rem] flex items-center justify-center leading-tight"
                          dangerouslySetInnerHTML={{ __html: product.name || '' }}
                        />
                        <div 
                          className="text-purple-600 font-medium text-sm group-hover:underline transition text-center line-clamp-2 h-10"
                          dangerouslySetInnerHTML={{ __html: product.desc || product.description || 'Khám phá ngay!' }}
                        />
                        <div className="bg-neutral-100 rounded-lg px-4 py-2 font-bold text-purple-700 group-hover:bg-purple-600 group-hover:text-white transition mt-2">
                          {typeof product.price === 'number' ? product.price.toLocaleString() : product.price}₫
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow p-10 text-center">
                    <div className="text-gray-500 text-lg mb-2">
                      {allProducts.length === 0 
                        ? 'Chưa có sản phẩm nào trong danh mục này'
                        : 'Không tìm thấy sản phẩm nào phù hợp'
                      }
                    </div>
                    <p className="text-gray-400">
                      {allProducts.length === 0
                        ? 'Hãy quay lại sau hoặc xem các danh mục khác'
                        : 'Vui lòng thử lại với các bộ lọc khác'
                      }
                    </p>
                  </div>
                )}
                {/* Pagination */}
                {meta.pages > 1 && (
                  <div className="flex justify-center mt-10">
                    <nav className="inline-flex items-center gap-1">
                      <button
                        className="px-3 py-1 rounded border text-gray-700 hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={meta.current === 1}
                        onClick={() => handlePageChange(meta.current - 1)}
                      >
                        ←
                      </button>
                      {meta.current > 3 && (
                        <button
                          className="px-3 py-1 rounded border text-gray-700 hover:bg-purple-100"
                          onClick={() => handlePageChange(1)}
                        >
                          1
                        </button>
                      )}
                      {meta.current > 3 && (
                        <span className="px-2 py-1 text-gray-500">...</span>
                      )}
                      {Array.from({ length: meta.pages }, (_, i) => i + 1)
                        .filter(page => page === 1 || page === meta.pages || Math.abs(page - meta.current) <= 1)
                        .map(page => (
                          <button
                            key={page}
                            className={`px-3 py-1 rounded border ${meta.current === page ? 'bg-purple-600 text-white' : 'text-gray-700 hover:bg-purple-100'}`}
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </button>
                        ))
                      }
                      {meta.current < meta.pages - 2 && (
                        <span className="px-2 py-1 text-gray-500">...</span>
                      )}
                      {meta.current < meta.pages - 2 && (
                        <button
                          className="px-3 py-1 rounded border text-gray-700 hover:bg-purple-100"
                          onClick={() => handlePageChange(meta.pages)}
                        >
                          {meta.pages}
                        </button>
                      )}
                      <button
                        className="px-3 py-1 rounded border text-gray-700 hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={meta.current === meta.pages}
                        onClick={() => handlePageChange(meta.current + 1)}
                      >
                        →
                      </button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

export default ProductPage
