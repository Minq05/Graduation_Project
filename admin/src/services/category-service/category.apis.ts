import axios from '@/config/axios.customize'

export const fetchAllCategories = async (params: string = '') => {
  const url = '/api/v1/categories' + params
  return axios.get<IBackendResponse<IResponseList<ICategory>>>(url)
}
