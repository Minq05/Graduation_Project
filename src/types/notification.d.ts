export interface INotification {
  _id: string
  userId: string
  title: string
  content: string
  isRead: boolean
  createdAt: string
  updatedAt: string
  deletedAt?: string
  deleted: boolean
}