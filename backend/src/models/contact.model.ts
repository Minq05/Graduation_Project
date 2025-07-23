import mongoose, { Schema } from 'mongoose'
import MongooseDelete, { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete'

export interface IContact extends SoftDeleteDocument {
  _id: string
  name: string
  email: string
  phone: string
  message: string
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
  deleted: boolean
}

const ContactSchema: Schema<IContact> = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    message: { type: String, required: true }
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true
  }
)

ContactSchema.plugin(MongooseDelete, {
  overrideMethods: 'all',
  deletedAt: true,
  deletedBy: true,
  deletedByType: String
})

const ContactModel = mongoose.model<IContact, SoftDeleteModel<IContact>>('Contact', ContactSchema)
export default ContactModel
