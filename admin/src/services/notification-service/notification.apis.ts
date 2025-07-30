import axios from '@/config/axios.customize'
import { INotification } from '@/types/notification'

export const getAllNotifications = async (params: {
  current: number
  pageSize: number
  qs?: string
}) => {
  const { current, pageSize, qs = '' } = params
  const queryString = `current=${current}&pageSize=${pageSize}${qs ? `&${qs}` : ''}`
  return await axios.get(`/api/v1/notifications?${queryString}`)
}

export const getNotificationById = async (id: string) => {
  return await axios.get(`/api/v1/notifications/${id}`)
}

export const createNotification = async (data: Omit<INotification, '_id' | 'createdAt' | 'updatedAt'>) => {
  return await axios.post('/api/v1/notifications', data)
}

export const updateNotification = async (id: string, data: Partial<INotification>) => {
  return await axios.patch(`/api/v1/notifications/${id}`, data)
}

export const deleteNotification = async (id: string) => {
  return await axios.delete(`/api/v1/notifications/${id}`)
}