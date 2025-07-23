/* eslint-disable @typescript-eslint/no-explicit-any */
import { isExistObject, isValidMongoId } from '~/utils/utils'
import aqp from 'api-query-params'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import CateblogModel, { ICateblog } from '~/models/blogcategory.model'

const handleCreateCateblog = async (data: ICateblog) => {
  await isExistObject(
    CateblogModel,
    { slug: data.slug },
    {
      checkExisted: true,
      errorMessage: 'Bài viết đã tồn tại danh mục này!'
    }
  )

  const result = await CateblogModel.create(data)

  return result.toObject()
}

const handleFetchAllCateblog = async ({
  currentPage,
  limit,
  qs
}: {
  currentPage: number
  limit: number
  qs: string
}) => {
  const { filter, sort, population } = aqp(qs)
  delete filter.current
  delete filter.pageSize

  const offset = (+currentPage - 1) * +limit
  const defaultLimit = +limit ? +limit : 10
  const totalItems = await CateblogModel.countDocuments(filter)
  const totalPages = Math.ceil(totalItems / defaultLimit)

  const results = await CateblogModel.find(filter)
    .skip(offset)
    .limit(defaultLimit)
    .sort(sort as any)
    .populate(population)
    .lean()
    .exec()

  return {
    meta: {
      current: currentPage,
      pageSize: defaultLimit,
      pages: totalPages,
      total: totalItems
    },
    results
  }
}

const handleFetchInfoCateblog = async (cateblogId: string) => {
  isValidMongoId(cateblogId)
  const cateblog = await CateblogModel.findById(cateblogId).lean().exec()
  if (!cateblog) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Bài viết không tồn tại danh mục này!')
  }
  return cateblog
}

const handleUpdateCateblog = async (cateblogId: string, data: Partial<ICateblog>) => {
  isValidMongoId(cateblogId)
  const cateblog = await CateblogModel.updateOne({ _id: cateblogId }, { ...data })
  if (!cateblog) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Bài viết không tồn tại danh mục này!')
  }
  return cateblog
}

const handleDeleteCateblog = async (cateblogId: string): Promise<any> => {
  isValidMongoId(cateblogId)
  const cateblog = await CateblogModel.deleteById(cateblogId)
  if (!cateblog) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Bài viết không tồn tại danh mục này!')
  }
  return cateblog
}

export const cateblogService = {
  handleCreateCateblog,
  handleFetchAllCateblog,
  handleFetchInfoCateblog,
  handleUpdateCateblog,
  handleDeleteCateblog
}
