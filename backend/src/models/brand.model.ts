import mongoose from 'mongoose'
import MongooseDelete, { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete'
import { Schema } from 'mongoose'
export interface IBrand extends SoftDeleteDocument {
  name: string
  slug: string
  avatar?: string
  isPublic: boolean
  createdBy?: {
    _id: string
    email: string
  }
  updateBy?: {
    _id: string
    email: string
  }
}
const BrandSchema: Schema<IBrand> = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    avatar: { type: String },
    isPublic: { type: Boolean, default: false },
    createdBy: {
      _id: { type: String },
      email: { type: String }
    },
    updateBy: {
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
BrandSchema.plugin(MongooseDelete, {
  overrideMethods: 'all',
  deletedBy: true,
  deletedByType: String
})
const BrandModel = mongoose.model<IBrand, SoftDeleteModel<IBrand>>('Brand', BrandSchema)
export default BrandModel
