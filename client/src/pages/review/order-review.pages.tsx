import { useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useSelector } from 'react-redux'
import { useMutation, useQuery } from '@tanstack/react-query'
import { RootState } from '@/redux/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Star } from 'lucide-react'
import { getReviewableProducts, createReview } from '@/services/review-service/review.apis'
import { toast } from 'react-toastify'

interface ReviewableProduct {
  productId: string
  productName: string
  productImage: string
  canReview: boolean
  reviewCount: number
}

const OrderReviewPage = () => {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const { user } = useSelector((state: RootState) => state.auth)
  
  const [reviews, setReviews] = useState<{[key: string]: {rating: number, comment: string}}>({})

  const { data: reviewableData, isLoading } = useQuery({
    queryKey: ['reviewable-products', user?._id],
    queryFn: () => getReviewableProducts(user!._id),
    enabled: !!user?._id
  })

  const createReviewMutation = useMutation({
    mutationFn: createReview,
    onSuccess: () => {
      toast.success('Đánh giá đã được gửi thành công!')
      navigate('/account/683f11fbc1c5cb3b5e991c17/order?tab=completed')
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi gửi đánh giá')
    }
  })


  
  const reviewableProducts: ReviewableProduct[] = reviewableData?.data || []

  const handleRatingChange = (productId: string, rating: number) => {
    setReviews(prev => ({
      ...prev,
      [productId]: { ...prev[productId], rating }
    }))
  }

  const handleCommentChange = (productId: string, comment: string) => {
    setReviews(prev => ({
      ...prev,
      [productId]: { ...prev[productId], comment }
    }))
  }

  const handleSubmitReview = (productId: string) => {
    const review = reviews[productId]
    if (!review?.rating || !review?.comment?.trim()) {
      toast.error('Vui lòng nhập đầy đủ đánh giá và bình luận')
      return
    }

    createReviewMutation.mutate({
      userId: user!._id,
      productId,
      orderId: orderId!,
      rating: review.rating,
      comment: review.comment.trim()
    })
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-4">
        <div className="h-8 bg-muted rounded w-64 animate-pulse" />
        <div className="h-32 bg-muted rounded animate-pulse" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/account/683f11fbc1c5cb3b5e991c17/order?tab=completed')}
          className="p-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Đánh giá sản phẩm</h1>
      </div>

      {reviewableProducts.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Không có sản phẩm nào để đánh giá</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {reviewableProducts.map((product) => (
            <Card key={product.productId}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <img
                    src={product.productImage || '/placeholder.svg'}
                    alt={product.productName}
                    className="w-20 h-20 object-cover rounded-lg"
                    crossOrigin="anonymous"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{product.productName}</h3>
                    
                    {product.canReview ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Đánh giá sao:</label>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Button
                                key={star}
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRatingChange(product.productId, star)}
                                className="p-1 h-auto"
                              >
                                <Star className={`h-6 w-6 ${
                                  (reviews[product.productId]?.rating || 0) >= star
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-muted-foreground'
                                }`} />
                              </Button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Bình luận:</label>
                          <Textarea
                            value={reviews[product.productId]?.comment || ''}
                            onChange={(e) => handleCommentChange(product.productId, e.target.value)}
                            placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                            rows={4}
                            className="resize-none"
                          />
                        </div>

                        <Button
                          onClick={() => handleSubmitReview(product.productId)}
                          disabled={createReviewMutation.isPending}
                        >
                          {createReviewMutation.isPending ? 'Đang gửi...' : 'Gửi đánh giá'}
                        </Button>
                      </div>
                    ) : (
                      <div className="text-muted-foreground">
                        <p>Bạn đã đánh giá sản phẩm này {product.reviewCount} lần (tối đa 2 lần)</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default OrderReviewPage