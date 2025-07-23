export interface IOrder {
  _id: string
  userId: {
    _id: string
    fullName: string
    email: string
    phone: string
  }
  addressId: {
    hamlet?: string
    ward?: string
    district?: string
    province?: string
  }
  addressFree?: string
  discountId?: string | null
  createdAt: string
  updatedAt: string
  totalPrice: number
  shippingPrice: number
  status: string
  statusLabel: string
  shippingMethod: string
  paymentMethod: string
  note?: string
  reason:string
  items?: IOrderItem[]
  estimatedDeliveryDate?: string
}
export interface IOrderItem {
  _id: string
  orderId: string
  productId: {
    _id: string
    name: string
    image: string[]
  }
  price: number
  quantity: number

}
export interface OrderItem {
  id: string
  orderNumber: string
  orderDate: string
  estimatedDelivery: string
  status: string
  statusLabel?: string
  paymentMethod: string
  product: {
    name: string
    quantity: number
    total: string
    image: string
  }
  statusUpdatedAt: number

}
