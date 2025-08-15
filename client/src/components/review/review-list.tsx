import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchReviewsByProduct } from '@/services/review-service/review.apis';
import { REVIEW_QUERY_KEYS } from '@/services/review-service/review.keys';
import { Review } from '@/services/review-service/review.types';
import { Button } from '@/components/ui/button';
import { Star, ChevronLeft, ChevronRight, X } from 'lucide-react';
import dayjs from 'dayjs';

interface ReviewListProps {
  productId: string;
}

const ReviewList = ({ productId }: ReviewListProps) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [previewOpen, setPreviewOpen] = useState(false);

  // Fetch đánh giá theo sản phẩm
  const { data: reviewsData, isLoading } = useQuery({
    queryKey: [REVIEW_QUERY_KEYS.FETCH_BY_PRODUCT, productId, page, limit],
    queryFn: () => fetchReviewsByProduct(productId, `page=${page}&limit=${limit}`),
    enabled: !!productId,
  });

  console.log('ReviewList - reviewsData:', reviewsData);
  console.log('ReviewList - reviewsData.data:', reviewsData?.data);
  console.log('ReviewList - reviewsData.data.results:', reviewsData?.data?.results);
  console.log('ReviewList - productId:', productId);

  // Kiểm tra cấu trúc response
  const reviews = reviewsData?.data?.results || reviewsData?.results || [];
  const total = reviewsData?.data?.meta?.total || reviewsData?.meta?.total || 0;
  
  console.log('ReviewList - final reviews:', reviews);
  console.log('ReviewList - final total:', total);

  const handlePageChange = (newPage: number, newPageSize: number) => {
    setPage(newPage);
    setLimit(newPageSize);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="py-8 text-center">
        <div className="text-muted-foreground mb-2">Chưa có đánh giá nào cho sản phẩm này</div>
        <p className="text-sm text-muted-foreground">
          Hãy là người đầu tiên đánh giá sản phẩm này
        </p>
      </div>
    );
  }

  return (
    <div className="py-2">
      <div className="text-sm text-gray-500 mb-4">{total} đánh giá</div>
      
      <div className="space-y-4">
        {reviews.map((review: Review) => {
          const user = typeof review.userId === 'object' ? review.userId : { fullName: 'Khách hàng' };
          
          return (
            <div key={review._id} className="border-b pb-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                  {user.fullName?.charAt(0) || 'K'}
                </div>
                
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{user.fullName || 'Khách hàng'}</p>
                      <div className="flex items-center mt-1">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                review.rating >= star ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground ml-2">
                          {dayjs(review.createdAt).format('DD/MM/YYYY')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                  
                  {review.images && review.images.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {review.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`review-image-${index}`}
                          className="w-20 h-20 object-cover rounded cursor-pointer hover:opacity-80"
                          onClick={() => {
                            setPreviewImage(image)
                            setPreviewOpen(true)
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {total > limit && (
        <div className="mt-6 flex justify-center items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page - 1, limit)}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Trang {page} / {Math.ceil(total / limit)}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page + 1, limit)}
            disabled={page >= Math.ceil(total / limit)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {previewOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setPreviewOpen(false)}>
          <div className="bg-white rounded-lg p-4 max-w-2xl max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Xem ảnh</h3>
              <Button variant="ghost" size="sm" onClick={() => setPreviewOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <img src={previewImage} alt="preview" className="w-full" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewList;