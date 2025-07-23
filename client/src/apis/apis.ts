import axios from '@/config/axios.customize'

export const fetchListProduct = async (params: any) => {
  const response = await axios.get('/api/v1/products', { params })
  return response
}

export const fetchListBlog = async (params: any) => {
  const response = await axios.get('/api/v1/blogs', { params })
  return response
}

export const fetchBlogDetail = async (blogId: string) => {
  const response = await axios.get(`/api/v1/blogs/${blogId}`)
  return response
}

// Cart APIs
export const fetchAllCarts = async (params: any) => {
  const response = await axios.get('/api/v1/carts', { params })
  return response
}

export const fetchCartDetail = async (cartId: string) => {
  const response = await axios.get(`/api/v1/carts/${cartId}`)
  return response
}

export const createCart = async (data: any) => {
  const response = await axios.post('/api/v1/carts', data)
  return response
}

export const updateCart = async (cartId: string, data: any) => {
  const response = await axios.patch(`/api/v1/carts/cart/${cartId}`, data)
  return response
}

// Cart Item APIs
export const fetchAllCartItems = async (params: any) => {
  const response = await axios.get('/api/v1/cartitems', { params })
  return response
}

export const fetchCartItemDetail = async (cartItemId: string) => {
  const response = await axios.get(`/api/v1/cartitems/${cartItemId}`)
  return response
}

export const createCartItem = async (data: any) => {
  const response = await axios.post('/api/v1/cartitems', data)
  return response
}

export const updateCartItem = async (cartItemId: string, data: any) => {
  const response = await axios.patch(`/api/v1/cartitems/${cartItemId}`, data)
  return response
}

export const deleteCartItem = async (cartItemId: string) => {
  const response = await axios.delete(`/api/v1/cartitems/${cartItemId}`)
  return response
}

