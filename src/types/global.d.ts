export {}

declare global {
  interface IBackendResponse<T> {
    error?: string | string[]
    message: string | string[]
    statusCode: number | string
    data?: T
  }

  interface IResponseList<T>{
    result: T[]
    meta: IMeta
  }

  interface IMeta {
    current: number
    pageSize: number
    total: number
  }

  interface IAuth {
    access_token: string
    user: IUserAuth
  }

  interface IUserAuth {
    _id: string
    email: string
    role: string
  }
}

declare module 'react' {
  interface CSSProperties {
    [key: `--${string}`]: string | number
  }
}
