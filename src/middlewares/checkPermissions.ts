import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import configEnv from '~/config/env'

interface User {
  email: string
  name: string
  role: string
}

const checkPermissions = (requiredRoles: string | string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      res.status(401).send('Unauthorized')
      return
    }

    try {
      const decoded = jwt.verify(token, configEnv.jwt.accessTokenSecret) as User
      req.user = decoded

      // Chuyển đổi requiredRoles thành mảng nếu nó là string
      const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]

      if (roles.includes(req.user.role)) {
        next()
      } else {
        res.status(403).send('Forbidden')
      }
    } catch (error) {
      res.status(401).send('Invalid token')
    }
  }
}

export { checkPermissions }
export default checkPermissions