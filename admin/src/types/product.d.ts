export {}

declare global {
  interface IAttributes {
    _id?: string
    name: string
    slug: string
    value: string
  }

  interface IVariants {
    _id?: string
    sku: string
    stock: number
    price: number
    image: string
    attributes: IAttributes[]
  }

  interface IProduct {
    _id: string
    name: string
    description?: string
    price: number
    category: string
    brand?: string
    images?: string[]
    stock?: number
    status?: string
    variants?: IVariants[]
    createdBy?: {
      _id: string
      email: string
    }
    updatedBy?: {
      _id: string
      email: string
    }
    createdAt?: Date
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface IProductFormData extends Omit<IProduct, '_id'> {}


  interface IProductInitialData {
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
    images?: string[]
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
        slug: string
        attributeId: {
          name: string
          slug: string
          _id: string
        }
      }[]
    }[]
  }
}
