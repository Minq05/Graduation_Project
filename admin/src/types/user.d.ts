export {}

declare global {
  interface IUser {
    _id: string
    fullName?: string
    email: string
    password: string
    phone?: string
    address?: string
    gender?: string
    birthday?: Date
    avatar?: string
    verifyCode?: string
    verifyCodeExpired?: Date
    isVerified?: boolean
    role?: string
    status?: string
    refreshToken?: string
    refreshTokenExpired?: Date
    createdBy?: {
      _id: string
      email: string
    }
    updatedBy?: {
      _id: string
      email: string
    }
    createdAt?: string
    updatedAt?: string
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface IUserFormData extends Omit<IUser, '_id'> {}

}
