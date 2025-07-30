import axios from '@/config/axios.customize'

export const fetchAccountAPI = async () => {
  const url = '/api/v1/auth/account'
  return axios.get<IBackendResponse<IUserAuth>>(url)
}

export const fetchUserAPI = async (id: string) => {
  const url = `/api/v1/users/${id}`
  return axios.get<IBackendResponse<IUser>>(url)
}

//Api updateinfor
export const updateUserAPI = async (id: string, data: { fullName: string; phone: string }) => {
  const url = `/api/v1/users/${id}`
  return axios.patch<IBackendResponse<IUser>>(url, data)
}

// Api handle address
export const createAddressAPI = async (userId: string, address: IAddress) => {
  const url = `/api/v1/users/${userId}/addresses`
  return axios.post<IBackendResponse<IAddress>>(url, address)
}

export const updateAddressAPI = async (userId: string, addressId: string, address: IAddress) => {
  const url = `/api/v1/users/${userId}/addresses/${addressId}`
  return axios.patch<IBackendResponse<IAddress>>(url, address)
}

export const fetchAllAddressByUserAPI = async (userId: string) => {
  const url = `/api/v1/users/${userId}/addresses`
  return axios.get<IBackendResponse<IAddress[]>>(url)
}

export const fetchInfoAddressByUserAPI = async (userId: string, addressId: string) => {
  const url = `/api/v1/users/${userId}/addresses/${addressId}`
  return axios.get<IBackendResponse<IAddress>>(url)
}

export const deleteAddressAPI = async (userId: string, addressId: string) => {
  const url = `/api/v1/users/${userId}/addresses/${addressId}`
  return axios.delete<IBackendResponse<IAddress>>(url)
}
