import ReviewForm from './review-form'
import ReviewList from './review-list'
import { useAppSelector } from '@/redux/hooks'
import { Separator } from '@/components/ui/separator'

interface ProductReviewsProps {
  productId: string;
  orderId?: string;
}

const ProductReviews = ({ productId, orderId }: ProductReviewsProps) => {
  const isLoggedIn = useAppSelector((state) => !!state.auth.user)

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Đánh giá sản phẩm</h3>
      {/* Danh sách đánh giá */}
      <ReviewList productId={productId} />
      <Separator className="my-6" />
      {/* Form đánh giá */}
      <div className="mt-6">
        <h4 className="text-base font-medium mb-4">Viết đánh giá của bạn</h4>
        {isLoggedIn ? (
          <ReviewForm
            productId={productId}
            orderId={orderId}
          />
        ) : (
          <div className="p-4 bg-gray-50 rounded-lg">
            <p>Vui lòng đăng nhập để đánh giá sản phẩm.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductReviews