export {}

declare global {
  interface ICategory {
    _id: string
    name: string
    slug: string
    icon?: string
    description?: string
    isPublic?: boolean
    createdAt: Date
    updatedAt: Date
  }

  interface ICategoryFormData {
    name: string
    slug: string
    icon?: string
    description?: string
    isPublic?: boolean
  }

  interface ICategoryResponse {
    categories: ICategory[]
  }
}
