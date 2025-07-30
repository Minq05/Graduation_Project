export interface IFlashSale {
  _id: string
  name: string
  description?: string
  startDate: string | Date
  endDate: string | Date
  createdAt?: string
  updatedAt?: string
  createdBy?: {
    _id: string
    email: string
  }
  updatedBy?: {
    _id: string
    email: string
  }
}

export interface IFlashSaleItem {
  _id: string
  flashSaleId: string
  productId: {
    _id: string
    name: string
    price: number
    image?: string
  } | string
  variantId?: {
    _id: string
    sku: string
    price: number
    stock: number
  } | string
  discountPercent: number
  createdAt?: string
  updatedAt?: string
}

export interface IFlashSaleResponse {
  meta: {
    current: number
    pageSize: number
    pages: number
    total: number
  }
  results: IFlashSale[]
}

export interface IFlashSaleItemResponse {
  meta: {
    current: number
    pageSize: number
    pages: number
    total: number
  }
  results: IFlashSaleItem[]
}