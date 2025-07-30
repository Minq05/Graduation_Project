import axiosInstance from '@/config/axios.customize';

// Lấy tất cả đánh giá (cho trang chủ) - chỉ lấy đánh giá đã approved
export const fetchAllReviews = async (params?: string) => {
  try {
    const url = params ? `/api/v1/reviews?${params}` : '/api/v1/reviews?status=approved';
    const response = await axiosInstance.get(url);
    return response || {
      statusCode: 200,
      success: true,
      data: {
        results: [],
        meta: { total: 0, page: 1, limit: 10, pages: 0 }
      },
      message: 'Không có đánh giá'
    };
  } catch (error) {
    console.error('Lỗi khi lấy tất cả đánh giá:', error);
    return {
      statusCode: 500,
      success: false,
      data: {
        results: [],
        meta: { total: 0, page: 1, limit: 10, pages: 0 }
      },
      message: 'Lỗi khi lấy đánh giá'
    };
  }
};

// Lấy đánh giá theo ID sản phẩm
export const fetchReviewsByProduct = async (productId: string, params?: string) => {
  try {
    const url = params ? `/api/v1/reviews/product/${productId}?${params}` : `/api/v1/reviews/product/${productId}`;
    console.log('fetchReviewsByProduct - calling URL:', url);
    const response = await axiosInstance.get(url);
    console.log('fetchReviewsByProduct - response:', response);
    return response.data || {
      success: true,
      data: {
        results: [],
        meta: { total: 0, page: 1, limit: 10, pages: 0 }
      },
      message: 'Không có đánh giá'
    };
  } catch (error) {
    console.error('Lỗi khi lấy đánh giá:', error);
    return {
      success: false,
      data: {
        results: [],
        meta: { total: 0, page: 1, limit: 10, pages: 0 }
      },
      message: 'Lỗi khi lấy đánh giá'
    };
  }
};

// Lấy đánh giá theo ID người dùng
export const fetchReviewsByUser = async (userId: string, params?: string) => {
  try {
    const url = params ? `/api/v1/reviews/user/${userId}?${params}` : `/api/v1/reviews/user/${userId}`;
    const response = await axiosInstance.get(url);
    return response.data || {
      success: true,
      data: {
        results: [],
        meta: { total: 0, page: 1, limit: 10, pages: 0 }
      },
      message: 'Không có đánh giá'
    };
  } catch (error) {
    console.error('Lỗi khi lấy đánh giá người dùng:', error);
    return {
      success: false,
      data: {
        results: [],
        meta: { total: 0, page: 1, limit: 10, pages: 0 }
      },
      message: 'Lỗi khi lấy đánh giá'
    };
  }
};

// Kiểm tra số lần đánh giá của người dùng cho sản phẩm
export const checkUserReviewCount = async (userId: string, productId: string) => {
  try {
    const response = await axiosInstance.get(`/api/v1/reviews/check/${userId}/${productId}`);
    return response.data || {
      success: true,
      data: {
        count: 0,
        canReview: false
      },
      message: 'Không thể kiểm tra đánh giá'
    };
  } catch (error) {
    console.error('Lỗi khi kiểm tra số lần đánh giá:', error);
    return {
      success: false,
      data: {
        count: 0,
        canReview: false
      },
      message: 'Lỗi khi kiểm tra số lần đánh giá'
    };
  }
};

// Kiểm tra sản phẩm có thể đánh giá từ đơn hàng
export const checkProductReviewableFromOrder = async (orderId: string) => {
  try {
    const response = await axiosInstance.get(`/api/v1/reviews/order/${orderId}/reviewable`);
    return response.data || {
      success: true,
      data: { reviewableProducts: [] },
      message: 'Không có sản phẩm nào có thể đánh giá'
    };
  } catch (error) {
    console.error('Lỗi khi kiểm tra sản phẩm có thể đánh giá:', error);
    return {
      success: false,
      data: { reviewableProducts: [] },
      message: 'Lỗi khi kiểm tra sản phẩm có thể đánh giá'
    };
  }
};

// Lấy danh sách sản phẩm có thể đánh giá theo userId
export const getReviewableProducts = async (userId: string) => {
  try {
    const response = await axiosInstance.get(`/api/v1/reviews/user/${userId}/reviewable`);
    
    // Kiểm tra nếu response là HTML (lỗi)
    if (typeof response === 'string' && response.includes('<!doctype html>')) {
      console.error('API trả về HTML thay vì JSON');
      return {
        success: false,
        data: [],
        message: 'Lỗi kết nối API'
      };
    }
    
    return response || {
      success: true,
      data: [],
      message: 'Không có sản phẩm nào có thể đánh giá'
    };
  } catch (error) {
    console.error('Lỗi khi lấy sản phẩm có thể đánh giá:', error);
    return {
      success: false,
      data: [],
      message: 'Lỗi khi lấy sản phẩm có thể đánh giá'
    };
  }
};

// Tạo đánh giá mới
export const createReview = async (reviewData: {
  userId: string;
  productId: string;
  orderId?: string;
  rating: number;
  comment: string;
  images?: string[];
}) => {
  try {
    const response = await axiosInstance.post('/api/v1/reviews', reviewData);
    return response.data || {
      success: false,
      data: null,
      message: 'Lỗi khi tạo đánh giá'
    };
  } catch (error) {
    console.error('Lỗi khi tạo đánh giá:', error);
    return {
      success: false,
      data: null,
      message: 'Lỗi khi tạo đánh giá'
    };
  }
};