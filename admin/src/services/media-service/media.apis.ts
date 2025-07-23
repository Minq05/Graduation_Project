import axios from '@/config/axios.customize'

export const fetchListMediaAPI = async () => {
  const url = '/api/v1/files'
  return axios.get<IBackendResponse<IResponseList<IMedia>>>(url)
}

export const deleteMediaAPI = async (_id: string, filename: string) => {
  const url = `/api/v1/files/${_id}`
  return axios.delete<IBackendResponse<IMedia>>(url, { data: { filename: filename } })
}

export const uploadMediaAPI = async (formData: FormData) => {
  const url = '/api/v1/files/upload'
  return axios.post<IBackendResponse<IMedia>>(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
