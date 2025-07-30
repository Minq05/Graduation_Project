export {}

declare global {
  interface IRole {
    _id: string
    name: string
    description: string
    isPublic: boolean
    permissions?: string[]
    createdAt?: string
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface IRoleFormData extends Omit<IRole, '_id'> {}

}
