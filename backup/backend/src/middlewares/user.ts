import { NextFunction, Request, Response } from 'express'
import { verifyToken } from '~/utils/jwt'

const userDecorator = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.status(401).send('Unauthorized')
  }

  const user = verifyToken(token)
  console.log('🚀 ~ userDecorator ~ user:', user)
}

export default userDecorator
