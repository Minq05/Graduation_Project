import axios from '@/config/axios.customize'

export const signinAPI = (data: { email: string; password: string }) => {
  const url = '/api/v1/auth/signin'
  return axios.post<IBackendResponse<IAuth>>(url, { ...data })
}

export const signoutAPI = () => {
  const url = '/api/v1/auth/signout'
  return axios.post<IBackendResponse<null>>(url)
}
