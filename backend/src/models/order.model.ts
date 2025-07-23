import mongoose, { Schema } from 'mongoose'
import MongooseDelete, { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete'

export interface IOrder extends SoftDeleteDocument {
  userId?: string
  addressId?: string
  addressFree?: {
    province: string
    district?: string
    ward?: string
    address?: string
  }
  totalPrice?: number
  shippingPrice?: number
  discountId?: string
  status?: string
  shippingMethod?: string
  paymentMethod?: string
  paymentStatus?: string
  note?: string
  reason?: string
  // GHN shipping information
  shipping?: {
    orderCode?: string
    expectedDeliveryTime?: string
    statusCode?: string
    statusName?: string
    fee?: number
  }
  createdBy?: {
    _id: string
    email: string
  }
  updatedBy?: {
    _id: string
    email: string
  }
}

const OrderSchema: Schema<IOrder> = new mongoose.Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    addressId: { type: Schema.Types.ObjectId, ref: 'addresses', required: false },
    addressFree: {
      type: {
        province: { type: String, required: false },
        district: { type: String, required: false },
        ward: { type: String, required: false },
        address: { type: String, required: false }
      },
      required: false
    },
    totalPrice: { type: Number, required: true },
    shippingPrice: { type: Number, required: true },
    discountId: { type: Schema.Types.ObjectId, ref: 'Discounts', required: false },
    status: { type: String, default: 'pending' },
    shippingMethod: { type: String, default: 'standard' },
    paymentMethod: { type: String, default: 'cash' },
    paymentStatus: { type: String, default: 'unpaid' },
    note: { type: String, default: '' },
    reason: {
      type: String,
      default: ''
    },
    shipping: {
      orderCode: { type: String },
      expectedDeliveryTime: { type: String },
      statusCode: { type: String },
      statusName: { type: String },
      fee: { type: Number }
    },
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

// Override all methods
OrderSchema.plugin(MongooseDelete, { overrideMethods: 'all', deletedBy: true, deletedByType: String })

const OrderModel = mongoose.model<IOrder, SoftDeleteModel<IOrder>>('orders', OrderSchema)

export default OrderModel
