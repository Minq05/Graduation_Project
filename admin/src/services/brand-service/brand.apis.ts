import axios from '@/config/axios.customize'
import { IBrand } from '@/types/brand'

export const fetchAllBrandsAPI = async (params: string = '') => {
  const url = '/api/v1/brand' + params
  return axios.get<IBackendResponse<IResponseList<IBrand>>>(url)
}
