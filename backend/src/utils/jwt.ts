import Jwt from 'jsonwebtoken'
import configEnv from '~/config/env'

export const generateToken = (payload: object, expiresIn: string = '1d'): string => {
  return Jwt.sign(payload, configEnv.jwt.accessTokenSecret, { expiresIn: expiresIn })
}

export const verifyToken = (token: string): any => {
  return Jwt.verify(token, configEnv.jwt.accessTokenSecret as string)
}
