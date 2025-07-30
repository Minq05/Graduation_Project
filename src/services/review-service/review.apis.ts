import axios from '@/config/axios.customize';
import { Review, ReviewsResponse, ReviewDetailResponse } from './review.types';

export const fetchAllReviews = async (queryParams: string): Promise<ReviewsResponse> => {
  const response = await axios.get(`/api/v1/reviews?${queryParams}`);
  return response;
};

export const approveReview = async (reviewId: string): Promise<any> => {
  const response = await axios.patch(`/api/v1/reviews/${reviewId}/approve`);
  return response;
};

export const rejectReview = async (reviewId: string, reason: string): Promise<any> => {
  const response = await axios.patch(`/api/v1/reviews/${reviewId}/reject`, { reason });
  return response;
};

export const deleteReview = async (reviewId: string, reason: string): Promise<any> => {
  const response = await axios.delete(`/api/v1/reviews/${reviewId}`, { data: { reason } });
  return response;
};

export const fetchReviewDetail = async (reviewId: string): Promise<ReviewDetailResponse> => {
  const response = await axios.get(`/api/v1/reviews/${reviewId}`);
  return response;
};

export const fetchReviewStats = async (): Promise<any> => {
  const response = await axios.get('/api/v1/reviews/stats');
  return response;
};