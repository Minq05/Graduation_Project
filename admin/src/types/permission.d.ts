export {}

declare global {

  interface IPermission {
    _id: string
    name: string
    apiPath: string
    method: string
    module: string
    isPublic: string
    description: string
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface IPermissionFormData extends Omit<IPermission, '_id'> {}
}
