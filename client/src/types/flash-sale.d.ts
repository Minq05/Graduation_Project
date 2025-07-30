export interface IFlashSale {
  _id: string
  name: string
  description?: string
  startDate: string | Date
  endDate: string | Date
  isActive?: boolean
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
  flashSaleId: string | IFlashSale
  productId: {
    _id: string
    name: string
    price?: number
    image?: string | string[]
    img?: string | string[]
    brand?: string
    description?: string
  }
  variantId?: {
    _id: string
    sku: string
    price: number
    stock: number
    attributes?: any[]
  }
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

export interface IActiveFlashSaleProduct extends IFlashSaleItem {
  flashSale: IFlashSale
  timeRemaining?: {
    hours: number
    minutes: number
    seconds: number
  }
}