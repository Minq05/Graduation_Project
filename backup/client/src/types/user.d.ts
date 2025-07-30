export {}

declare global {
  interface IUser {
    fullName: string
    phone: string
    createdAt: string
    deleted: boolean
    email: string
    gender: string
    isVerified: boolean
    refreshToken: string
    refreshTokenExpired: string
    role: string
    status: string
    updatedAt: string
    verifyCode: string
    verifyCodeExpired: string
    _id: string
  }

  interface IAddress {
    _id: string
    userId: string
    province: string
    district: string
    ward: string
    address: string
    isPrimary: boolean
  }

  interface IAddressListResponse {
    meta: {
      current: number
      pageSize: number
      pages: number
      total: number
    }
    results: IAddress[]
  }
}
