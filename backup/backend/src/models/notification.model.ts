import mongoose, { Schema } from 'mongoose'

export interface INotification {
  
  userId: string
  title: string
  content: string
  isRead: boolean
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date
  deleted: boolean
}

const NotificationSchema: Schema<INotification> = new mongoose.Schema(
  {

    userId: { type: String, required: true }, // uuid
    title: { type: String, required: true },
    content: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    deletedAt: { type: Date },
    deleted: { type: Boolean, default: false }
  },
  {
    versionKey: false,
    strict: true
  }
)

const NotificationModel = mongoose.model<INotification>('Notification', NotificationSchema)
export default NotificationModel
