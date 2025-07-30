import axios from '@/config/axios.customize'

interface ICart {
  _id: string
  userId: string
  items: ICartItem[]
  totalPrice: number
}

export interface ICartItem {
  _id: string
  productId: {
    _id: string
    name: string
    image: string[]
  }
  variantId: {
    _id: string
    sku: string
    price: number
    stock: number
    image: string
  }
  value: string
  cartId: string
  quantity: number
}

export const createCartAPI = async (userId: string) => {
  const url = '/api/v1/carts'
  const response = await axios.post<IBackendResponse<ICart>>(url, { userId })
  return response
}

export const fetchInfoCartAPI = async (cartId: string) => {
  const url = `/api/v1/carts/${cartId}`
  const response = await axios.get<IBackendResponse<ICartItem[]>>(url)
  return response
}

export const addToCartAPI = async (cartId: string, productId: string, variantId: string, quantity: number) => {
  const url = `/api/v1/carts/${cartId}`
  const response = await axios.post<IBackendResponse<ICartItem>>(url, { cartId, productId, variantId, quantity })
  return response
}

export const updateCartItemAPI = async (cartId: string, cartItemId: string, newQuantity: number) => {
  const url = `/api/v1/carts/${cartId}`
  const response = await axios.patch<IBackendResponse<ICartItem>>(url, { cartId, cartItemId, newQuantity })
  return response
}

export const deleteCartItemAPI = async (cartId: string) => {
  const url = `/api/v1/carts/${cartId}`
  const response = await axios.delete<IBackendResponse<ICartItem>>(url)
  return response
}

export const deleteItemFromCartAPI = async (cartId: string, itemId: string) => {
  const url = `/api/v1/carts/${cartId}/items/${itemId}`
  const response = await axios.delete<IBackendResponse<ICart>>(url)
  return response
}

export const fetchCartByUserAPI = async (userId: string) => {
  const url = `/api/v1/carts/user/${userId}`
  const response = await axios.get(url)
  return response
}
