import mongoose, { Schema } from 'mongoose'
import MongooseDelete, { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete'

export interface IAddress extends SoftDeleteDocument {
  userId: string
  province?: string
  district?: string
  ward?: string
  address?: string
  isPrimary?: boolean
  createdBy?: {
    _id: string
    email: string
  }
  updatedBy?: {
    _id: string
    email: string
  }
}

const AddressSchema: Schema<IAddress> = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    province: { type: String },
    district: { type: String },
    ward: { type: String },
    address: { type: String },
    isPrimary: { type: Boolean, default: false },
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
AddressSchema.plugin(MongooseDelete, { overrideMethods: 'all', deletedBy: true, deletedByType: String })

const AddressModel = mongoose.model<IAddress, SoftDeleteModel<IAddress>>('addresses', AddressSchema)

export default AddressModel
