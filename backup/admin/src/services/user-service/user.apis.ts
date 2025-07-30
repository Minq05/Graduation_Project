import axios from '@/config/axios.customize'
import { IOrderItem } from '@/types/orders';
// Write functions to call APIs here

export const getBrandList = (
  { current = 1, pageSize = 10, params = '' }: { current: number; pageSize: number; params?: string }
) => {
  return axios.get(`/api/v1/brand?current=${current}&pageSize=${pageSize}&${params || ''}`)
}


export const getUserList = (
  { current = 1, pageSize = 10, params = '' }: { current: number; pageSize: number; params?: string }
) => {
  return axios.get(`/api/v1/users?current=${current}&pageSize=${pageSize}&${params || ''}`)
}

export const createUser = (data: IUserFormData) => {
  return axios.post<IBackendResponse<IResponseList<IUser>>>('/api/v1/users', data)
}

export const updateUser = (id: string, data: IUserFormData) => {
  return axios.patch(`/api/v1/users/${id}`, { ...data })
}

export const updateUserStatus = (id: string, status: boolean) => {
  return axios.patch(`/api/v1/users/${id}/status`, { status })
}

export const deleteUser = (id: string) => {
  return axios.delete(`/api/v1/users/${id}`)
}

export const fetchAccountAPI = async () => {
  const url = '/api/v1/auth/account'
  return axios.get<IBackendResponse<IUserAuth>>(url)
}


export const fetchOrderByUser = async (userId: string) => {
  const url = `/api/v1/orders/by-user/${userId}`
  return axios.get<IBackendResponse<IResponseList<IOrderItem>>>(url)
}
