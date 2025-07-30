import { Request, Response, NextFunction } from 'express'
import { Schema } from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

/**
 * Middleware to validate request data against a Joi schema
 * @param schema Joi schema to validate against
 * @param property Request property to validate ('body', 'query', 'params')
 */
const validateRequest = (schema: Schema, property: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req[property])

    if (!error) {
      next()
    } else {
      const { details } = error
      const message = details.map((i) => i.message).join(', ')

      next(new ApiError(StatusCodes.BAD_REQUEST, message))
    }
  }
}

export default validateRequest
