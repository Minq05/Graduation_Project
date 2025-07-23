import axios from '@/config/axios.customize';

export const addToWishlist = async (productId: string) => {
  return await axios.post('/api/v1/wishlist', { productId });
};

export const removeFromWishlist = async (productId: string) => {
  return await axios.delete(`/api/v1/wishlist/product/${productId}`);
};

export const getWishlist = async (current = 1, pageSize = 10) => {
  return await axios.get('/api/v1/wishlist', { params: { current, pageSize } });
};

export const checkProductInWishlist = async (productId: string) => {
  return await axios.get(`/api/v1/wishlist/product/${productId}`);
};