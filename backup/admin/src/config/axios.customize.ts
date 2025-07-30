import axios, { InternalAxiosRequestConfig } from 'axios'
import { Mutex } from 'async-mutex'
import { store } from '@/redux/store'
import { setAccessToken, setRefreshToken } from '@/redux/slices/auth.slice'

interface AccessTokenResponse {
  access_token: string;
}

let accessToken = store.getState().auth.access_token
store.subscribe(() => {
  const newAccessToken = store.getState().auth.access_token
  if (newAccessToken !== accessToken) {
    accessToken = newAccessToken
  }
})

// Set config defaults when creating the instance
const instance = axios.create({
  // baseURL: import.meta.env.VITE_BACKEND_URL as string,
  baseURL: 'http://localhost:8080',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
})

const mutex = new Mutex()

const handleRefreshToken = async (): Promise<string | null> => {
  return await mutex.runExclusive(async () => {
    const res = await instance.get<IBackendResponse<AccessTokenResponse>>(
      '/api/v1/auth/refresh-token'
    )
    if (res && res.data) return res.data.access_token
    else return null
  })
}

// Add a request interceptor
instance.interceptors.request.use(
  function (config: InternalAxiosRequestConfig) {
    // Do something before request is sent
    const access_token = store.getState().auth.access_token
    if (access_token) {
      config.headers.Authorization = `Bearer ${access_token}`
    }

    return config
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function (error: any) {
    // Do something with request error
    return Promise.reject(error)
  }
)

instance.interceptors.response.use(
  (res) => res.data,
  async (error) => {
    if (
      error.config &&
      error.response &&
      +error.response.status === 401 &&
      error.config.url !== '/api/v1/auth/signin'
    ) {
      const access_token = await handleRefreshToken()
      if (access_token) {
        error.config.headers['Authorization'] = `Bearer ${access_token}`
        store.dispatch(setAccessToken({ access_token: access_token }))
        return instance.request(error.config)
      }
    }

    if (
      error.config &&
      error.response &&
      +error.response.status === 400 &&
      error.config.url === '/api/v1/auth/refresh-token'
    ) {
      const message = error?.response?.data?.message ?? 'Có lỗi xảy ra, vui lòng đăng nhập!'
      store.dispatch(setRefreshToken({ status: true, message: message }))
    }

    return Promise.reject(error)
  }
)

export default instance
