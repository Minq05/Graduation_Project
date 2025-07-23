/* eslint-disable @typescript-eslint/no-explicit-any */
import BlogModel, { IBlog } from '~/models/blog.model'
import { isExistObject } from '~/utils/utils'
import aqp from 'api-query-params'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

const handleCreateBlog = async (data: IBlog) => {
  await isExistObject(BlogModel, { slug: data.slug }, { checkExisted: true, errorMessage: 'Slug đã tồn tại' })
  const result = await BlogModel.create({ ...data })
  return result
}

// ...existing code...
const handleFetchAllBlog = async ({ currentPage, limit, qs }: { currentPage: number; limit: number; qs: string }) => {
  let filter: any = {}
  let sort: any = {}
  let population: any = undefined

  // Nếu có từ khóa tìm kiếm
  if (qs && typeof qs === 'string' && qs.trim() !== '') {
    filter.$or = [{ title: { $regex: qs, $options: 'i' } }, { slug: { $regex: qs, $options: 'i' } }]
  } else {
    // Nếu không có từ khóa thì parse filter như cũ
    const aqpResult = aqp(qs)
    filter = aqpResult.filter
    sort = aqpResult.sort
    population = aqpResult.population
    delete filter.current
    delete filter.pageSize
  }

  const offset = (currentPage - 1) * limit
  const defaultLimit = limit ? limit : 10
  const totalItems = await BlogModel.countDocuments(filter)
  const totalPages = Math.ceil(totalItems / defaultLimit)

  const results = await BlogModel.find(filter)
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
// ...existing code...

const handleFetchInfoBlog = async (blogId: string) => {
  const blog = await BlogModel.findById(blogId).lean().exec()
  if (!blog) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Bài viết không tồn tại')
  }
  return blog
}

const handleFetchBlogByCategory = async ({
  categoryId,
  currentPage,
  limit,
  qs
}: {
  categoryId: string
  currentPage: number
  limit: number
  qs: string
}) => {
  const { filter, sort, population } = aqp(qs)
  filter.categoryBlogId = categoryId
  delete filter.current
  delete filter.pageSize

  const offset = (currentPage - 1) * limit
  const defaultLimit = limit ? limit : 10
  const totalItems = await BlogModel.countDocuments(filter)
  const totalPages = Math.ceil(totalItems / defaultLimit)

  const results = await BlogModel.find(filter)
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

const handleUpdateBlog = async (blogId: string, data: IBlog) => {
  const blog = await BlogModel.updateOne({ _id: blogId }, { ...data })
  if (!blog) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Bài viết không tồn tại')
  }
  return blog
}

const handleUpdateBlogStatus = async (blogId: string, data: { isPublic: boolean }) => {
  const blog = await BlogModel.updateOne({ _id: blogId }, { isPublic: data.isPublic })
  if (!blog) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Bài viết không tồn tại')
  }
  return blog
}

const handleDeleteBlog = async (blogId: string): Promise<any> => {
  const blog = await BlogModel.deleteById(blogId)
  if (!blog) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Bài viết không tồn tại')
  }
  return blog
}

export const blogService = {
  handleCreateBlog,
  handleFetchAllBlog,
  handleFetchInfoBlog,
  handleFetchBlogByCategory,
  handleUpdateBlog,
  handleUpdateBlogStatus,
  handleDeleteBlog
}
