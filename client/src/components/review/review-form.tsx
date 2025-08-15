/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { checkUserReviewCount, createReview } from '@/services/review-service/review.apis'
import { REVIEW_QUERY_KEYS } from '@/services/review-service/review.keys'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Star, Plus, X } from 'lucide-react'
import { useAppSelector } from '@/redux/hooks'
import { toast } from 'react-toastify'

interface ReviewFormProps {
  productId: string;
  orderId?: string;
  onSuccess?: () => void;
}

const ReviewForm = ({ productId, orderId, onSuccess }: ReviewFormProps) => {
  const [rating, setRating] = useState<number>(5)
  const [comment, setComment] = useState<string>('')
  const [images, setImages] = useState<string[]>([])
  const [previewOpen, setPreviewOpen] = useState<boolean>(false)
  const [previewImage, setPreviewImage] = useState<string>('')
  const [submitting, setSubmitting] = useState<boolean>(false)

  const queryClient = useQueryClient()
  const user = useAppSelector((state) => state.auth.user)
  const userId = user?._id

  // Kiểm tra số lần đánh giá của người dùng
  const { data: reviewCountData, isLoading: checkingReviewCount } = useQuery({
    queryKey: [REVIEW_QUERY_KEYS.CHECK_USER_REVIEW_COUNT, userId, productId],
    queryFn: () => checkUserReviewCount(userId as string, productId),
    enabled: !!userId && !!productId
  })

  const canReview = reviewCountData?.data?.canReview
  const reviewCount = reviewCountData?.data?.count || 0

  // Mutation để tạo đánh giá
  const createReviewMutation = useMutation({
    mutationFn: createReview,
    onSuccess: () => {
      toast.success('Đánh giá của bạn đã được gửi và hiển thị thành công!')
      setRating(5)
      setComment('')
      setImages([])
      queryClient.invalidateQueries({ queryKey: [REVIEW_QUERY_KEYS.CHECK_USER_REVIEW_COUNT] })
      queryClient.invalidateQueries({ queryKey: [REVIEW_QUERY_KEYS.FETCH_BY_PRODUCT] })
      if (onSuccess) onSuccess()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá')
    },
    onSettled: () => {
      setSubmitting(false)
    }
  })

  // Xử lý khi submit form
  const handleSubmit = async () => {
    if (!userId) {
      toast.error('Vui lòng đăng nhập để đánh giá sản phẩm')
      return
    }

    if (!comment.trim()) {
      toast.error('Vui lòng nhập nội dung đánh giá')
      return
    }

    setSubmitting(true)

    createReviewMutation.mutate({
      userId,
      productId,
      orderId,
      rating,
      comment,
      images
    })
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader()
        reader.onload = () => {
          setImages(prev => [...prev, reader.result as string])
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  if (checkingReviewCount) {
    return <div>Đang kiểm tra...</div>
  }

  if (!canReview) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg">
        {reviewCount === 0 ? (
          <p>Bạn cần mua sản phẩm này trước khi đánh giá.</p>
        ) : (
          <p>Bạn đã đạt giới hạn đánh giá cho sản phẩm này (tối đa 2 lần).</p>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg">
      {reviewCount === 1 && (
        <div className="text-sm text-gray-500 mb-4">
          Bạn còn 1 lần đánh giá cho sản phẩm này
        </div>
      )}
      <div className="mb-4">
        <p className="mb-2">Đánh giá của bạn:</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Button
              key={star}
              variant="ghost"
              size="sm"
              onClick={() => setRating(star)}
              className="p-1 h-auto"
            >
              <Star className={`h-5 w-5 ${
                rating >= star ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
              }`} />
            </Button>
          ))}
        </div>
      </div>
      <div className="mb-4">
        <p className="mb-2">Nhận xét:</p>
        <Textarea
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
        />
      </div>
      <div className="mb-4">
        <p className="mb-2">Hình ảnh (tùy chọn):</p>
        <div className="flex flex-wrap gap-2 mb-2">
          {images.map((image, index) => (
            <div key={index} className="relative">
              <img
                src={image}
                alt={`preview-${index}`}
                className="w-20 h-20 object-cover rounded cursor-pointer"
                onClick={() => {
                  setPreviewImage(image)
                  setPreviewOpen(true)
                }}
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 h-6 w-6 p-0"
                onClick={() => removeImage(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
          {images.length < 5 && (
            <label className="w-20 h-20 border-2 border-dashed border-muted-foreground rounded flex flex-col items-center justify-center cursor-pointer hover:bg-muted">
              <Plus className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground mt-1">Thêm ảnh</span>
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </label>
          )}
        </div>
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
      <Button
        onClick={handleSubmit}
        disabled={!comment.trim() || submitting}
      >
        {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
      </Button>
      <p className="text-xs text-gray-500 mt-2">
        Đánh giá của bạn sẽ được hiển thị ngay sau khi gửi.
      </p>
    </div>
  )
}

export default ReviewForm