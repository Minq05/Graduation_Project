import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import configEnv from '~/config/env'

interface User {
  email: string
  name: string
  role: string
}

const checkPermissions = (requiredRole: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).send('Unauthorized')
    }

    try {
      const decoded = jwt.verify(token, configEnv.jwt.accessTokenSecret) as User
      req.user = decoded

      if (req.user.role === requiredRole) {
        next()
      } else {
        res.status(403).send('Forbidden')
      }
    } catch (error) {
      res.status(401).send('Invalid token')
    }
  }
}

export default checkPermissions
