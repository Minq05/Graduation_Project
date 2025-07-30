import mongoose, { Schema, Document } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

// Định nghĩa interface cho mongoose-paginate-v2
declare module 'mongoose' {
  interface PaginateModel<T> extends mongoose.Model<T> {
    paginate(query?: any, options?: any): Promise<{
      docs: T[];
      totalDocs: number;
      limit: number;
      page: number;
      totalPages: number;
      nextPage?: number | null;
      prevPage?: number | null;
      pagingCounter: number;
      hasPrevPage: boolean;
      hasNextPage: boolean;
      meta?: any;
    }>;
  }
}

export interface IReview extends Document {
  userId: mongoose.Types.ObjectId | string;
  productId: mongoose.Types.ObjectId | string;
  orderId?: mongoose.Types.ObjectId | string;
  rating: number;
  comment: string;
  images?: string[];
  status: 'pending' | 'approved' | 'rejected';
  rejectReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: true
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'products',
      required: true
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'orders'
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: true,
      trim: true
    },
    images: {
      type: [String],
      default: []
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    rejectReason: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Đảm bảo mỗi người dùng chỉ có thể đánh giá một sản phẩm tối đa 2 lần
reviewSchema.index({ userId: 1, productId: 1 });

reviewSchema.plugin(mongoosePaginate);

const Review = mongoose.model<IReview, mongoose.PaginateModel<IReview>>('Review', reviewSchema);

export default Review;