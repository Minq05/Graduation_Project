
export interface IProduct {
  _id: string
  name: string
  description?: string
  price: number
  categoryId: {
    name: string
    _id: string
  }
  brandId?: {
    name: string
    _id: string
  }
  image?: string[]
  stock?: number
  status?: string
  variants?: {
    _id?: string
    sku: string
    stock: number
    price: number
    image: string
    variant_attributes: {
      _id?: string
      variantId: string
      value: string
      attributeId: {
        name: string
        slug: string
        _id: string
      }
    }[]
  }[]
}
