/* eslint-disable @typescript-eslint/no-explicit-any */
import aqp from 'api-query-params'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import ProductVariantModel, { IProductVariant } from '~/models/product-variant.model'
import { isExistObject, isValidMongoId } from '~/utils/utils'
import '../models/product.model'

const handleCreateProductVariant = async (data: IProductVariant) => {
  await isExistObject(
    ProductVariantModel,
    { sku: data.sku, productId: data.productId },
    {
      checkExisted: true,
      errorMessage: 'SKU của biến thể sản phẩm đã tồn tại!'
    }
  )

  const result = await ProductVariantModel.create(data)
  return result.toObject()
}

const handleFetchAllProductVariants = async ({
  currentPage,
  limit,
  qs
}: {
  currentPage: number
  limit: number
  qs: string
}) => {
  const { filter, sort } = aqp(qs)
  delete filter.current
  delete filter.pageSize

  const offset = (currentPage - 1) * limit
  const defaultLimit = limit || 10

  const totalItems = await ProductVariantModel.countDocuments(filter)
  const totalPages = Math.ceil(totalItems / defaultLimit)

  const results = await ProductVariantModel.find(filter)
    .skip(offset)
    .limit(defaultLimit)
    .sort(sort as any)
    .populate({ path: 'productId', model: 'products', select: 'name' })
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

const handleFetchInfoProductVariant = async (variantId: string) => {
  isValidMongoId(variantId)

  const variant = await ProductVariantModel.findById(variantId)
    .populate({ path: 'productId', model: 'products', select: 'name' })
    .lean()
    .exec()

  if (!variant) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Biến thể sản phẩm không tồn tại!')
  }

  return variant
}

const handleUpdateProductVariant = async (variantId: string, data: Partial<IProductVariant>) => {
  isValidMongoId(variantId)

  const updated = await ProductVariantModel.updateOne({ _id: variantId }, data)
  if (updated.modifiedCount === 0) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy biến thể sản phẩm để cập nhật!')
  }

  return updated
}

const handleDeleteProductVariant = async (variantId: string): Promise<any> => {
  isValidMongoId(variantId)

  const deleted = await ProductVariantModel.deleteById(variantId)
  if (!deleted) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy biến thể sản phẩm để xóa!')
  }

  return deleted
}

export const productVariantService = {
  handleCreateProductVariant,
  handleFetchAllProductVariants,
  handleFetchInfoProductVariant,
  handleUpdateProductVariant,
  handleDeleteProductVariant
}
