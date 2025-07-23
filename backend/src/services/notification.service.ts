/* eslint-disable @typescript-eslint/no-explicit-any */
import NotificationModel from '~/models/notification.model'
import { isValidMongoId } from '~/utils/utils'
import aqp from 'api-query-params'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { createLogger } from '~/config/logger'

const logger = createLogger(__filename)

const handleCreateNotification = async (data: any) => {
  const result = await NotificationModel.create(data)
  return result.toObject()
}

const handleFetchAllNotifications = async ({
  currentPage,
  limit,
  qs
}: {
  currentPage: number
  limit: number
  qs: string
}) => {
  // ✅ Dùng aqp để parse toàn bộ qs
  const { filter: rawFilter, sort, population } = aqp(qs)

  const filter: any = { ...rawFilter }

  // ✅ Nếu có keyword trong filter thì chuyển thành điều kiện $or
  if (filter.keyword) {
    const keyword = String(filter.keyword).trim()
    delete filter.keyword

    if (keyword) {
      filter.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { content: { $regex: keyword, $options: 'i' } }
      ]
    }
  }

  // ✅ Xóa các field không liên quan
  delete filter.current
  delete filter.pageSize

  const offset = (+currentPage - 1) * +limit
  const defaultLimit = +limit || 10
  const totalItems = await NotificationModel.countDocuments(filter)
  const totalPages = Math.ceil(totalItems / defaultLimit)

  const results = await NotificationModel.find(filter)
    .skip(offset)
    .limit(defaultLimit)
    .sort(sort as any)
    .populate(population)
    .lean()
    .exec()

  return {
    meta: {
      current: currentPage,
      pageSize: defaultLimit,
      pages: totalPages,
      total: totalItems
    },
    results
  }
}


const handleFetchNotificationById = async (notificationId: string) => {
  isValidMongoId(notificationId)
  const notification = await NotificationModel.findById(notificationId).lean().exec()
  if (!notification) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Thông báo không tồn tại')
  }
  return notification
}

const handleDeleteNotification = async (notificationId: string): Promise<any> => {
  isValidMongoId(notificationId)
  const notification = await NotificationModel.deleteOne({ _id: notificationId })
  if (!notification || notification.deletedCount === 0) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Thông báo không tồn tại')
  }
  return notification
}
const handleUpdateNotification = async (id: string, data: Partial<any>) => {
  isValidMongoId(id)
  const updated = await NotificationModel.findByIdAndUpdate(id, data, { new: true }).lean().exec()
  if (!updated) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy thông báo để cập nhật')
  }
  return updated
}



export const notificationService = {
  handleCreateNotification,
  handleFetchAllNotifications,
  handleFetchNotificationById,
  handleDeleteNotification,
  handleUpdateNotification
}
