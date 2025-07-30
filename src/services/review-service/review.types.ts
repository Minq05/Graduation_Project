export interface Review {
  _id: string;
  userId: {
    _id: string;
    fullName?: string;
    email: string;
  } | string;
  productId: {
    _id: string;
    name: string;
    images?: string[];
  } | string;
  orderId?: string;
  rating: number;
  comment: string;
  images?: string[];
  status: 'pending' | 'approved' | 'rejected';
  rejectReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewResponse {
  success: boolean;
  data: Review;
  message?: string;
}

export interface ReviewsListResponse {
  success: boolean;
  data: {
    results: Review[];
    meta?: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
  message?: string;
}

export interface ReviewFormData {
  userId: string;
  productId: string;
  orderId?: string;
  rating: number;
  comment: string;
  images?: string[];
}

export interface ReviewCountResponse {
  success: boolean;
  data: {
    count: number;
    canReview: boolean;
  };
  message?: string;
}