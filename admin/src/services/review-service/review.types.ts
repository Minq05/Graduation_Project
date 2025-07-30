export interface Review {
  _id: string;
  userId: {
    _id: string;
    fullName: string;
    email: string;
  };
  productId: {
    _id: string;
    name: string;
    images?: string[];
  };
  orderId?: string;
  rating: number;
  comment: string;
  images?: string[];
  status: 'pending' | 'approved' | 'rejected';
  rejectReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewsResponse {
  statusCode: number;
  data: {
    results: Review[];
    meta: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
  message: string;
  success: boolean;
}

export interface ReviewDetailResponse {
  statusCode: number;
  data: Review;
  message: string;
  success: boolean;
}