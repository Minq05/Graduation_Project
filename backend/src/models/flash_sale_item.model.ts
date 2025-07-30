import mongoose, { Schema, Types } from 'mongoose'
import MongooseDelete, { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete'

export interface IFlashSaleItem extends SoftDeleteDocument {
  flashSaleId: Types.ObjectId
  productId: Types.ObjectId
  variantId?: Types.ObjectId
  discountPercent: number
}

const FlashSaleItemSchema: Schema<IFlashSaleItem> = new mongoose.Schema(
  {
    flashSaleId: { type: Schema.Types.ObjectId, ref: 'flash_sales', required: true },
    productId: { type: Schema.Types.ObjectId, ref: 'products', required: true },
    variantId: { type: Schema.Types.ObjectId, ref: 'product_variants', required: false },
    discountPercent: { type: Number, required: true }
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true
  }
)

FlashSaleItemSchema.plugin(MongooseDelete, {
  overrideMethods: 'all',
  deletedAt: true,
  deletedBy: false
})

const FlashSaleItemModel = mongoose.model<IFlashSaleItem, SoftDeleteModel<IFlashSaleItem>>('flash_sale_items', FlashSaleItemSchema)

export default FlashSaleItemModel
