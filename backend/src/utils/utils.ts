import { ObjectId } from 'mongodb'
import slugify from 'slugify'
import { ERROR_MESSAGES } from './constants'
import { FilterQuery, HydratedDocument } from 'mongoose'
import { SoftDeleteModel } from 'mongoose-delete'
import ApiError from './ApiError'
import { StatusCodes } from 'http-status-codes'
import bcrypt, { compareSync } from 'bcryptjs'
/**
 * @param string - The string to be converted to a slug.
 * @description This function converts a given string into a URL-friendly slug format.
 * It replaces spaces with hyphens, removes special characters, and converts the string to lowercase.
 * It uses the 'slugify' library to perform the conversion.
 */
export const createSlug = (text: string) => {
  const normalized = slugify(text, {
    lower: false,
    locale: 'vi',
    remove: /[*+~.()'"!:@?&%$#]/g
  })

  return normalized.split(' ').filter(Boolean).join('-')
}
export const convertSlugUrl = (string: string) => {
  if (!string) return ''

  const slug = slugify(string, {
    lower: true,
    locale: 'vi'
  })

  return slug
}

/**
 * Extracts metadata from the authenticated user.
 * @param user - The authenticated user.
 * @returns An object containing the user's ID and email.
 */
export const getUserMetadata = (user: IUser): { _id: string; email: string } => {
  return { _id: user._id, email: user.email }
}

/**
 * Validates if a MongoDB ObjectId is valid.
 * @param id - The ID to validate.
 * @throws BadRequestException if the ID is invalid.
 */
export const isValidMongoId = (id: string): void => {
  if (!ObjectId.isValid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, ERROR_MESSAGES.INVALID.ID)
  }
}

interface ExistObjectOptions {
  checkNotDeleted?: boolean
  errorMessage?: string
  checkExisted?: boolean
  statusCode?: StatusCodes
}

/**
 * Checks if an object exists in the database.
 * @param model - The Mongoose model to check against.
 * @param conditions - The conditions to find the object.
 * @param options - Optional settings for the check.
 * @param options.checkNotDeleted - Whether to check for non-deleted objects (default: true).
 * @param options.errorMessage - The error message to throw if the object is not found (default: 'Object not found').
 * @throws NotFoundException if the object is not found.
 */
export const isExistObject = async <T extends Omit<HydratedDocument<unknown>, 'delete'>>(
  model: SoftDeleteModel<T>,
  conditions: FilterQuery<T>,
  options: ExistObjectOptions = {}
): Promise<void> => {
  const { checkNotDeleted = true, errorMessage = 'Object not found', checkExisted = false, statusCode } = options

  const queryConditions: FilterQuery<T> = {
    ...conditions,
    ...(checkNotDeleted && { deleted: false })
  }

  const isExist = await model.exists(queryConditions)

  if (!isExist && !checkExisted) {
    throw new ApiError(statusCode ?? StatusCodes.NOT_FOUND, errorMessage)
  }

  if (isExist && checkExisted) {
    throw new ApiError(statusCode ?? StatusCodes.BAD_REQUEST, errorMessage)
  }
}

/**
 * Checks if a given date string is expired.
 * @param dateString - The date string to check.
 * @returns True if the date is expired, false otherwise.
 */

export const checkExpiredCode = (dateString: string): boolean => {
  const expirationDate = new Date(dateString)
  const currentDate = new Date()
  return currentDate < expirationDate
}

/**
 * @returns A random 6-digit activation code as a string.
 * @description This function generates a random 6-digit activation code.
 * It uses Math.random() to create a random number between 100000 and 999999,
 * and then converts it to a string.
 * The generated code can be used for various purposes, such as user verification or authentication.
 */
export const generateCode = () => {
  const activationCode = Math.floor(100000 + Math.random() * 900000)
  return activationCode.toString()
}

/**
 * @param password - The password to hash.
 * @description This function hashes a password using bcrypt.
 * It uses a salt or rounds value of 10 to generate the hash.
 * The hashed password can be stored securely in a database.
 * Hashing passwords is a common practice to enhance security and protect user credentials.
 * @see https://www.npmjs.com/package/bcrypt
 * @see https://www.npmjs.com/package/bcryptjs
 * @returns The hashed password as a string.
 * @throws Error if the hashing process fails.
 */
export const hashPassword = async (password: string) => {
  const saltOrRounds = 10
  const hashPassword = await bcrypt.hash(password, saltOrRounds)
  return hashPassword
}

/**
 * @param password - The password to compare.
 * @param hashPassword - The hashed password to compare against.
 * @description This function compares a password with a hashed password using bcrypt.
 * It checks if the provided password matches the hashed password.
 * This is commonly used during user authentication to verify the user's credentials.
 * @see https://www.npmjs.com/package/bcrypt
 * @see https://www.npmjs.com/package/bcryptjs
 * @returns A boolean indicating whether the password matches the hashed password.
 * @throws Error if the comparison process fails.
 */
export const comparePassword = async (password: string, hashPassword: string) => {
  return await compareSync(password, hashPassword)
}
