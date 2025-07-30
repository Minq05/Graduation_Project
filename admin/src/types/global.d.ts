export {}

declare global {
  interface IBackendResponse<T> {
    error?: string | string[]
    message: string | string[]
    statusCode: number | string
    data?: T
  }

  interface IMeta {
    current: number
    pageSize: number
    total: number
    pages?: number
  }

  interface IResponseList<T>{
    results: T[]
    meta: IMeta
  }

  interface IPagination {
    current: number
    pageSize: number
    total: number
    pages?: number
  }

  interface IUserAuth {
    _id: string
    email: string
    role: string
  }

  interface IAuth {
    access_token: string
    user: IUserAuth
  }
}
