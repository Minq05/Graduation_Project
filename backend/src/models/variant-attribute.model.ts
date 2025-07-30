import mongoose, { Schema, Types } from 'mongoose'
import MongooseDelete, { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete'

export interface IVariantAttribute extends SoftDeleteDocument {
  variantId: Types.ObjectId
  attributeId: Types.ObjectId
  value: string
  createdBy?: { _id: string; email: string }
  updatedBy?: { _id: string; email: string }
}

const VariantAttributeSchema: Schema<IVariantAttribute> = new mongoose.Schema(
  {
    variantId: { type: Schema.Types.ObjectId, ref: 'product_variants', required: true },
    attributeId: { type: Schema.Types.ObjectId, ref: 'attributes', required: true },
    value: { type: String, required: true },
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

VariantAttributeSchema.virtual('attributes', {
  ref: 'attributes',
  localField: 'attributeId',
  foreignField: '_id',
  justOne: false
})
VariantAttributeSchema.set('toObject', { virtuals: true })
VariantAttributeSchema.set('toJSON', { virtuals: true })

VariantAttributeSchema.plugin(MongooseDelete, {
  overrideMethods: 'all',
  deletedAt: true,
  deletedBy: false
})

const VariantAttributeModel = mongoose.model<IVariantAttribute, SoftDeleteModel<IVariantAttribute>>(
  'variant_attributes',
  VariantAttributeSchema
)

export default VariantAttributeModel
