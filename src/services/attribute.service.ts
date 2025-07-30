/* eslint-disable @typescript-eslint/no-explicit-any */
import aqp from 'api-query-params'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import AttributeModel, { IAttribute } from '~/models/attribute.model'
import { isValidMongoId } from '~/utils/utils'

const handleCreateAttribute = async (data: IAttribute) => {
  const result = await AttributeModel.create(data)
  return result.toObject()
}

const handleFetchAllAttributes = async ({
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

  const totalItems = await AttributeModel.countDocuments(filter)
  const totalPages = Math.ceil(totalItems / defaultLimit)

  const results = await AttributeModel.find(filter)
    .skip(offset)
    .limit(defaultLimit)
    .sort(sort as any)
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

const handleFetchInfoAttribute = async (attributeId: string) => {
  isValidMongoId(attributeId)

  const attribute = await AttributeModel.findById(attributeId).lean().exec()

  if (!attribute) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Thuộc tính không tồn tại!')
  }

  return attribute
}

const handleUpdateAttribute = async (attributeId: string, data: Partial<IAttribute>) => {
  isValidMongoId(attributeId)

  const updated = await AttributeModel.updateOne({ _id: attributeId }, data)
  if (updated.modifiedCount === 0) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy thuộc tính để cập nhật!')
  }

  return updated
}

const handleDeleteAttribute = async (attributeId: string): Promise<any> => {
  isValidMongoId(attributeId)

  const deleted = await AttributeModel.deleteById(attributeId)
  if (!deleted) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy thuộc tính để xóa!')
  }

  return deleted
}

export const attributeService = {
  handleCreateAttribute,
  handleFetchAllAttributes,
  handleFetchInfoAttribute,
  handleUpdateAttribute,
  handleDeleteAttribute
}
