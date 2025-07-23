import mongoose, { Schema, Types } from 'mongoose'
import MongooseDelete, { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete'

export interface IProduct extends SoftDeleteDocument {
  name: string
  description?: string
  slug: string
  categoryId: Types.ObjectId
  brandId: Types.ObjectId
  price: number
  image?: string[]
  stock: number
  capacity: number
  isInFlashSale?: boolean
  flashSaleId?: string
  flashSalePrice?: number
  flashSaleQuantity?: number
  flashSaleStartDate?: Date
  flashSaleEndDate?: Date
  createdBy?: { _id: string; email: string }
  updatedBy?: { _id: string; email: string }
}

const ProductSchema: Schema<IProduct> = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: '' },
    slug: { type: String, default: '' },
    categoryId: { type: Schema.Types.ObjectId, ref: 'categories', required: false },
    brandId: { type: Schema.Types.ObjectId, ref: 'brand', required: false },
    price: { type: Number, required: false },
    image: { type: [String], required: false },
    stock: { type: Number, required: false },
    capacity: { type: Number, required: false },
    // Các trường liên quan đến flash sale
    isInFlashSale: { type: Boolean, default: false },
    flashSaleId: { type: String },
    flashSalePrice: { type: Number },
    flashSaleQuantity: { type: Number },
    flashSaleStartDate: { type: Date },
    flashSaleEndDate: { type: Date },
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

ProductSchema.virtual('variants', {
  ref: 'product_variants',
  localField: '_id',
  foreignField: 'productId',
  justOne: false
})
ProductSchema.set('toObject', { virtuals: true })
ProductSchema.set('toJSON', { virtuals: true })

ProductSchema.plugin(MongooseDelete, {
  overrideMethods: 'all',
  deletedAt: true,
  deletedBy: false
})

const ProductModel = mongoose.model<IProduct, SoftDeleteModel<IProduct>>('products', ProductSchema)

export default ProductModel
