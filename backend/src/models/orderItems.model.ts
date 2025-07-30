import mongoose, { Schema } from 'mongoose'
import MongooseDelete, { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete'

export interface IOrderItem extends SoftDeleteDocument {
  orderId: string
  productId: string
  variantId: string
  quantity: number
  price: number
  createdBy?: {
    _id: string
    email: string
  }
  updatedBy?: {
    _id: string
    email: string
  }
}

const OrderItemSchema = new Schema(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'orders', required: true },
    productId: { type: Schema.Types.ObjectId, ref: 'products', required: true },
    variantId: { type: Schema.Types.ObjectId, ref: 'product_variants', required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    createdBy: {
      _id: { type: String },
      email: { type: String },
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

OrderItemSchema.plugin(MongooseDelete, {
  overrideMethods: 'all',
  deletedBy: true,
  deletedByType: String
})

const OrderItemModel = mongoose.model<IOrderItem, SoftDeleteModel<IOrderItem>>('OrderItem', OrderItemSchema)
export default OrderItemModel
