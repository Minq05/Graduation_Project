import mongoose, { Schema } from 'mongoose'
import MongooseDelete, { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete'

export interface IFlashSale extends SoftDeleteDocument {
  name: string
  description?: string
  startDate: Date
  endDate: Date
  isActive: boolean
  createdBy?: {
    _id: string
    email: string
  }
  updatedBy?: {
    _id: string
    email: string
  }
}

const FlashSaleSchema: Schema<IFlashSale> = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: '' },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: false },
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

FlashSaleSchema.plugin(MongooseDelete, {
  overrideMethods: 'all',
  deletedAt: true,
  deletedBy: false
})

const FlashSaleModel = mongoose.model<IFlashSale, SoftDeleteModel<IFlashSale>>('flash_sales', FlashSaleSchema)

export default FlashSaleModel
