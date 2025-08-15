/* eslint-disable @typescript-eslint/no-explicit-any */
import BrandModel, { IBrand } from '~/models/brand.model'
import { createSlug, isExistObject, isValidMongoId } from '~/utils/utils'
import aqp from 'api-query-params'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

const handleCreateBrand = async (payload: IBrand) => {
  await isExistObject(BrandModel, { name: payload.name }, { checkExisted: true, errorMessage: `Tên brand ${payload.name} đã tồn tại.` });

  let slug = payload.slug || createSlug(payload.name)
  const baseSlug = slug

  while (await BrandModel.exists({ slug })) {
    slug = `${baseSlug}`
  }

  const newBrand = await BrandModel.create({
    ...payload,
    slug
  })

  return newBrand.toObject()
}
const handleFetchAllBrand = async ({ currentPage, limit, qs }: { currentPage: number; limit: number; qs: string }) => {
  let filter: any = {}
  let sort: any = {}
  let population: any = undefined
  if (qs && typeof qs === 'string' && qs.trim() !== '') {
    filter.$or = [{ name: { $regex: qs, $options: 'i' } }, { slug: { $regex: qs, $options: 'i' } }]
  } else {
    const aqpResult = aqp(qs)
    filter = aqpResult.filter
    sort = aqpResult.sort
    population = aqpResult.population
    delete filter.current
    delete filter.pageSize
  }

  const offset = (+currentPage - 1) * +limit
  const defaultLimit = +limit || 10
  const totalItems = await BrandModel.countDocuments(filter)
  const totalPages = Math.ceil(totalItems / defaultLimit)

  const results = await BrandModel.find(filter)
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
const handleFetchBrandById = async (categoryId: string) => {
  isValidMongoId(categoryId)
  const category = await BrandModel.findById(categoryId).lean().exec()
  if (!category) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Brand không tồn tại')
  }
  return category
}
const handleUpdateBrand = async (brandId: string, data: Partial<IBrand>) => {
  isValidMongoId(brandId)

  if (data.name) {
    const existed = await BrandModel.findOne({ name: data.name, _id: { $ne: brandId } })
    if (existed) {
      throw new ApiError(StatusCodes.CONFLICT, `Tên brand ${data.name} đã tồn tại.`)
    }

    let slug = createSlug(data.name)
    const baseSlug = slug

    while (await BrandModel.exists({ slug, _id: { $ne: brandId } })) {
      slug = `${baseSlug}`
    }

    data.slug = slug
  }

  const brand = await BrandModel.findByIdAndUpdate(brandId, data, {
    new: true,
    runValidators: true
  }).lean()

  if (!brand) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Brand không tồn tại')
  }

  return brand
}

const handleDeleteBrand = async (categoryId: string): Promise<any> => {
  isValidMongoId(categoryId)
  const category = await BrandModel.findByIdAndDelete(categoryId)
  if (!category) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Brand không tồn tại')
  }
  return category
}

const handleGetAllBrands = async () => {
  const brands = await BrandModel.find({}).select('_id name slug').lean().exec()
  return brands
}

export const brandService = {
  handleCreateBrand,
  handleDeleteBrand,
  handleFetchBrandById,
  handleFetchAllBrand,
  handleUpdateBrand,
  handleGetAllBrands
}
