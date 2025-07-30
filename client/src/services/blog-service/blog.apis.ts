import axios from '@/config/axios.customize'

export const fetchListBlog = async (params: any) => {
  const response = await axios.get('/api/v1/blogs', { params })
  return response
}

export const fetchBlogByCategory = async (categoryId: string, params: any) => {
  const response = await axios.get(`/api/v1/blogs/by-category/${categoryId}`, { params })
  return response
}

export const fetchBlogDetail = async (blogId: string) => {
  const response = await axios.get(`/api/v1/blogs/${blogId}`)
  return response
}

export const fetchListCateBlog = async () => {
  const response = await axios.get('/api/v1/cateblog')
  return response
}
