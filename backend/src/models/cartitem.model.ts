import mongoose, { Schema } from 'mongoose'
import MongooseDelete, { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete'

export interface ICartItem extends SoftDeleteDocument {
  _id: string
  cartId: string
  productId: string
  variantId: string
  quantity: number
  value?: string
  price: number
  originalPrice?: number
  hasFlashSale?: boolean
  discountPercent?: number
  flashSaleItemId?: string
  createdBy?: {
    _id: string
    email: string
  }
  updatedBy?: {
    _id: string
    email: string
  }
}

const CartItemSchema = new Schema(
  {
    cartId: { type: String, required: true },
    productId: { type: String, required: true, ref: 'products' },
    variantId: { type: String, required: true, ref: 'product_variants' },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: false, min: 0 },
    originalPrice: { type: Number, required: false, min: 0 },
    hasFlashSale: { type: Boolean, default: false },
    discountPercent: { type: Number, default: 0, min: 0, max: 100 },
    flashSaleItemId: { type: String, required: false },
    value: { type: String, required: false },
    createdBy: {
      _id: { type: String },
      email: { type: String }
    },
    updatedBy: {
      _id: { type: String },
      email: { type: String }
    },
    deletedBy: {
      _id: { type: String },
      email: { type: String }
    }
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true
  }
)

CartItemSchema.plugin(MongooseDelete, { overrideMethods: 'all', deletedBy: true, deletedByType: String })

const CartItemModel = mongoose.model<ICartItem, SoftDeleteModel<ICartItem>>('CartItem', CartItemSchema)
export default CartItemModel
