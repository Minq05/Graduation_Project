import axios from '@/config/axios.customize'

export const getUserNotifications = async () => {
  return await axios.get(`/api/v1/notifications?userId=all&sort=-createdAt`)
}

export const markAsRead = async (notificationId: string) => {
  return await axios.patch(`/api/v1/notifications/${notificationId}`, { isRead: true })
}