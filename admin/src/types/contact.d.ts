export interface IContact {
  _id: string
  name: string
  email: string
  phone: string
  message: string
  createdAt: string
  updatedAt: string
  deletedAt?: string
  deleted: boolean
}

export type Contactvalues = Omit<IContact, '_id' | 'createdAt' | 'updatedAt' | 'deleted'>