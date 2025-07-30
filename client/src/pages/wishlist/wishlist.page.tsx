import { useState, useEffect } from 'react';
import { Heart, Trash2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { getWishlist, removeFromWishlist } from '@/services/wishlist-service/wishlist.apis';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';

const WishlistPage = () => {
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ current: 1, pageSize: 12, pages: 1, total: 0 });
  const { isSignin, user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isSignin && user) {
      fetchWishlist();
    }
  }, [isSignin, user]);

  const fetchWishlist = async (page = 1) => {
    try {
      setLoading(true);
      const response = await getWishlist(page, 12);
      
      const wishlistResults = response.data?.data?.results || response.data?.results || [];
      
      // Fetch thêm thông tin variants cho mỗi sản phẩm
      const enrichedResults = await Promise.all(
        wishlistResults.map(async (item: any) => {
          try {
            const productResponse = await fetch(`http://localhost:8080/api/v1/products/${item.productId._id}`);
            if (productResponse.ok) {
              const productData = await productResponse.json();
              return {
                ...item,
                productId: {
                  ...item.productId,
                  variants: productData.data?.variants || []
                }
              };
            }
          } catch (error) {
            console.error('Error fetching product details:', error);
          }
          return item;
        })
      );
      
      setWishlistItems(enrichedResults);
      setMeta(response.data?.data?.meta || response.data?.meta || { current: 1, pageSize: 12, pages: 1, total: 0 });
    } catch (error) {
      console.error('Wishlist error:', error);
      toast.error('Không thể tải danh sách yêu thích');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      await removeFromWishlist(productId);
      toast.success('Đã xóa khỏi danh sách yêu thích!');
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      fetchWishlist(meta.current);
    } catch (error) {
      toast.error('Không thể xóa sản phẩm');
    }
  };

  if (!isSignin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Heart size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Vui lòng đăng nhập</h2>
          <p className="text-gray-600">Để xem danh sách yêu thích của bạn</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Danh sách yêu thích</h1>
          <p className="text-gray-600">
            {meta.total > 0 ? `${meta.total} sản phẩm yêu thích` : 'Chưa có sản phẩm nào'}
          </p>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-16">
            <Heart size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Danh sách yêu thích trống</h2>
            <p className="text-gray-600 mb-6">Hãy thêm những sản phẩm bạn yêu thích!</p>
            <a
              href="/shops"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
            >
              Khám phá sản phẩm
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((item) => {
              const product = item.productId;
              let price;

              if (
                product?.variants &&
                Array.isArray(product.variants) &&
                product.variants.length > 0 &&
                product.variants[0]?.price !== null &&
                product.variants[0]?.price !== undefined &&
                product.variants[0]?.price !== ''
              ) {
                price = product.variants[0].price;
              } else {
                price = product?.price;
              }

              const displayPrice = (() => {
                if (price === null || price === undefined || price === '') {
                  return 'Liên hệ';
                }
                if (typeof price === 'number') {
                  return price.toLocaleString() + '₫';
                }
                return price + '₫';
              })();

              return (
                <div key={item._id} className="bg-white rounded-lg shadow-md overflow-hidden group flex flex-col h-full">
                  <div className="relative">
                    <img
                      src={item.productId?.image?.[0] || item.productId?.img || 'https://via.placeholder.com/300x400?text=No+Image'}
                      alt={item.productId?.name}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <button
                      onClick={() => handleRemoveFromWishlist(item.productId._id)}
                      className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={18} className="text-red-500" />
                    </button>
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <div 
                      className="font-semibold text-lg mb-2 line-clamp-2 h-14 flex items-start"
                      dangerouslySetInnerHTML={{ __html: item.productId?.name || '' }}
                    />
                    <div className="bg-neutral-100 rounded-lg px-4 py-2 font-bold text-purple-700 mb-3 text-center">
                      {displayPrice}
                    </div>
                    <button
                      onClick={() => navigate(`/productDetail/${item.productId?._id}`)}
                      className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors mt-auto"
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {meta.pages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex space-x-2">
              {Array.from({ length: meta.pages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => fetchWishlist(page)}
                  className={`px-4 py-2 rounded-md ${
                    page === meta.current
                      ? 'bg-purple-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;