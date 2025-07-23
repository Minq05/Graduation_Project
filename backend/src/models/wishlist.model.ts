import mongoose, { Schema } from 'mongoose'
import MongooseDelete, { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete'

export interface IWishlist extends SoftDeleteDocument {
  _id: string
  userId: string
  productId: string
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
  deleted: boolean
}

const WishlistSchema: Schema<IWishlist> = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    userId: { type: String, required: true },
    productId: { type: String, required: true },
    deleted: { type: Boolean, default: false }
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true
  }
)

WishlistSchema.plugin(MongooseDelete, {
  overrideMethods: 'all',
  deletedAt: true,
  deletedBy: false
})

const WishlistModel = mongoose.model<IWishlist, SoftDeleteModel<IWishlist>>('wishlists', WishlistSchema)

export default WishlistModel