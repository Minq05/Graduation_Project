import mongoose, { Schema } from 'mongoose'
import MongooseDelete, { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete'

export interface IBlog extends SoftDeleteDocument {
  title: string
  slug: string
  content: string
  image?: string
  categoryBlogId?: string
  isPublic?: boolean
  createdBy?: {
    _id: string
    email: string
  }
  updatedBy?: {
    _id: string
    email: string
  }
}

const BlogSchema: Schema<IBlog> = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    image: { type: String },
    categoryBlogId: { type: String },
    isPublic: { type: Boolean, default: false },
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
BlogSchema.plugin(MongooseDelete, {
  overrideMethods: 'all',
  deletedBy: true,
  deletedByType: String
})

const BlogModel = mongoose.model<IBlog, SoftDeleteModel<IBlog>>('Blog', BlogSchema)
export default BlogModel
