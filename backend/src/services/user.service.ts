/* eslint-disable @typescript-eslint/no-explicit-any */
import UserModel from '~/models/user.model'
import { hashPassword, isExistObject, isValidMongoId } from '~/utils/utils'
import aqp from 'api-query-params'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

const handleCreateUser = async (data: IUser) => {
  await isExistObject(UserModel, { email: data.email }, { checkExisted: true, errorMessage: 'Người dùng đã tồn tại' })
  const hashPass = await hashPassword(data.password as string)
  const result = await UserModel.create({ ...data, password: hashPass })

  const userObj = result.toObject()
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  delete userObj.password

  return userObj
}

const handleFetchAllUser = async ({ currentPage, limit, qs }: { currentPage: number; limit: number; qs: string }) => {
  const { filter, sort, population } = aqp(qs)

  if (filter.keyword) {
    const keyword = String(filter.keyword).trim()
    delete filter.keyword

    if (keyword) {
      filter.$or = [{ fullName: { $regex: keyword, $options: 'i' } }, { email: { $regex: keyword, $options: 'i' } }]
    }
  }

  if (filter.status) {
    const statuses = String(filter.status)
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s !== '')
    delete filter.status

    if (statuses.length === 1) {
      filter.status = statuses[0]
    } else if (statuses.length > 1) {
      filter.status = { $in: statuses }
    }
  }

  if (filter.role) {
    const roles = String(filter.role)
      .split(',')
      .map((r) => r.trim())
      .filter((r) => r !== '')
    delete filter.role

    if (roles.length === 1) {
      filter.role = roles[0]
    } else if (roles.length > 1) {
      filter.role = { $in: roles }
    }
  }

  delete filter.current
  delete filter.pageSize

  const page = Math.max(1, currentPage)
  const perPage = limit > 0 ? limit : 10
  const offset = (page - 1) * perPage

  const totalItems = await UserModel.countDocuments(filter)
  const totalPages = Math.ceil(totalItems / perPage)

  // Query dữ liệu
  const results = await UserModel.find(filter)
    .skip(offset)
    .limit(perPage)
    .sort(sort as any)
    .select('-password')
    .populate(population)
    .lean()
    .exec()

  return {
    meta: {
      current: page,
      pageSize: perPage,
      pages: totalPages,
      total: totalItems
    },
    results
  }
}

const handleFetchInfoUser = async (userId: string) => {
  isValidMongoId(userId)
  const user = await UserModel.findById(userId).select('-password').lean().exec()
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Người dùng không tồn tại')
  }
  return user
}

const handleUpdateUser = async (userId: string, data: Partial<IUser>) => {
  isValidMongoId(userId)
  const user = await UserModel.updateOne({ _id: userId }, { ...data })
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Người dùng không tồn tại')
  }
  return user
}

const handleDeleteUser = async (userId: string): Promise<any> => {
  isValidMongoId(userId)
  const user = await UserModel.deleteById(userId)
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Người dùng không tồn tại')
  }
  return user
}

export const userService = {
  handleCreateUser,
  handleFetchAllUser,
  handleFetchInfoUser,
  handleUpdateUser,
  handleDeleteUser
}
