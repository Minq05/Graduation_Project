import 'express'

declare global {
  namespace Express {
    interface Request {
      user?: {
        role: string
        email: string
        // name: string
        _id: string
      }
    }

    interface Response {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      json: (data: any) => Response
    }
  }

  interface ErrorWithStatus extends Error {
    statusCode?: number
  }
  interface IUser {
    _id: string
    email: string
    name: string
    role: string
    password?: string
    passwordResetToken?: string
    passwordResetExpires?: Date
    verifyEmailToken?: string
    verifyEmailExpires?: Date
  }

  interface ICateBlog {
    _id: string
    name: string
    slug: string
  }

  interface IMeta {
    current: number
    pages: number
    pageSize: number
    total: number
  }
}
