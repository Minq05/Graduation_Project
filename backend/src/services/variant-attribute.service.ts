/* eslint-disable @typescript-eslint/no-explicit-any */
import aqp from 'api-query-params'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { isExistObject, isValidMongoId } from '~/utils/utils'
import VariantAttributeModel, { IVariantAttribute } from '~/models/variant-attribute.model'

const handleCreateVariantAttribute = async (data: IVariantAttribute) => {
  await isExistObject(
    VariantAttributeModel,
    { variantId: data.variantId, attributeId: data.attributeId, value: data.value },
    {
      checkExisted: true,
      errorMessage: 'Thuộc tính biến thể đã tồn tại!'
    }
  )

  const result = await VariantAttributeModel.create(data)
  return result.toObject()
}

const handleFetchAllVariantAttributes = async ({
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

  const totalItems = await VariantAttributeModel.countDocuments(filter)
  const totalPages = Math.ceil(totalItems / defaultLimit)

  const results = await VariantAttributeModel.find(filter)
    .skip(offset)
    .limit(defaultLimit)
    .sort(sort as any)
    .populate({ path: 'variantId', model: 'product_variants', select: 'sku' })
    .populate({ path: 'attributeId', model: 'attributes', select: 'name' })
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

const handleFetchInfoVariantAttribute = async (variantAttributeId: string) => {
  isValidMongoId(variantAttributeId)

  const variantAttribute = await VariantAttributeModel.findById(variantAttributeId)
    .populate({ path: 'variantId', model: 'product_variants', select: 'sku' })
    .populate({ path: 'attributeId', model: 'attributes', select: 'name' })
    .lean()
    .exec()

  if (!variantAttribute) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Thuộc tính biến thể không tồn tại!')
  }

  return variantAttribute
}

const handleUpdateVariantAttribute = async (variantAttributeId: string, data: Partial<IVariantAttribute>) => {
  isValidMongoId(variantAttributeId)

  const updated = await VariantAttributeModel.updateOne({ _id: variantAttributeId }, data)
  if (updated.modifiedCount === 0) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy thuộc tính biến thể để cập nhật!')
  }

  return updated
}

const handleDeleteVariantAttribute = async (variantAttributeId: string): Promise<any> => {
  isValidMongoId(variantAttributeId)

  const deleted = await VariantAttributeModel.deleteById(variantAttributeId)
  if (!deleted) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy thuộc tính biến thể để xóa!')
  }

  return deleted
}

export const variantAttributesService = {
  handleCreateVariantAttribute,
  handleFetchAllVariantAttributes,
  handleFetchInfoVariantAttribute,
  handleUpdateVariantAttribute,
  handleDeleteVariantAttribute
}
