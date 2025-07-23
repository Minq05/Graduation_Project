import mongoose, { Schema } from 'mongoose'
import MongooseDelete, { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete'

export interface ICateblog extends SoftDeleteDocument {
  name?: string
  slug: string
  createdBy?: {
    _id: string
    email: string
  }
  updatedBy?: {
    _id: string
    email: string
  }
}

const CateblogSchema: Schema<ICateblog> = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true },
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
CateblogSchema.plugin(MongooseDelete, { overrideMethods: 'all', deletedBy: true, deletedByType: String })

const CateblogModel = mongoose.model<ICateblog, SoftDeleteModel<ICateblog>>('cateblogs', CateblogSchema)

export default CateblogModel
