import axios from '@/config/axios.customize'

export const fetchAllAttributes = async () => {
  const url = `/api/v1/attributes`
  const response = await axios.get<IBackendResponse<IResponseList<IAttributes>>>(url)
  return response
}
