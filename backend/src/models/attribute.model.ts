import mongoose, { Schema } from 'mongoose'
import MongooseDelete, { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete'

export interface IAttribute extends SoftDeleteDocument {
  name: string
  slug: string
  createdAt?: Date
  updatedAt?: Date
  deletedAt?: Date
  deleted?: boolean
}

const AttributeSchema: Schema<IAttribute> = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true }
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true
  }
)

AttributeSchema.plugin(MongooseDelete, {
  overrideMethods: 'all',
  deletedAt: true,
  deletedBy: false
})

const AttributeModel = mongoose.model<IAttribute, SoftDeleteModel<IAttribute>>('attributes', AttributeSchema)

export default AttributeModel
