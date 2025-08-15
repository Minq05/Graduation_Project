import axios from '@/config/axios.customize'
import { IProduct } from '@/types/product'

export const fetchListProduct = async (params: unknown) => {
  const response = await axios.get('/api/v1/products', { params })
  return response
}

export const fetchListCategory = async () => {
  const response = await axios.get('/api/v1/categories')
  return response
}

export const fetchListBrand = async () => {
  const response = await axios.get('/api/v1/brand')
  return response
}

export const fetchInfoProduct = async (id: string) => {
  const url = `/api/v1/products/${id}`
  const response = await axios.get<IBackendResponse<IProduct>>(url)
  return response
}

export const fetchBrandById = async (id: string) => {
  const response = await axios.get(`/api/v1/brand/${id}`)
  return response
}

export const fetchCategoryById = async (id: string) => {
  const response = await axios.get(`/api/v1/categories/${id}`)
  return response
}
