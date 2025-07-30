/* eslint-disable @typescript-eslint/no-explicit-any */
import aqp from 'api-query-params'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import CartItemModel, { ICartItem } from '~/models/cartitem.model'

const handleCreateCartItem = async (data: ICartItem): Promise<ICartItem> => {
  // Optional: Kiểm tra nếu cartId đã tồn tại thì không thêm nữa
  const existing = await CartItemModel.findOne({
    cartId: data.cartId
  })

  if (existing) {
    throw new ApiError(StatusCodes.CONFLICT, 'Mục này đã tồn tại trong giỏ hàng')
  }

  const result = await CartItemModel.create(data)
  return result.toObject()
}

const handleFetchAllCartItems = async ({
  currentPage,
  limit,
  qs
}: {
  currentPage: number
  limit: number
  qs: string
}): Promise<{
  meta: {
    current: number
    pageSize: number
    pages: number
    total: number
  }
  results: ICartItem[]
}> => {
  const { filter = {}, sort = {}, population } = aqp(qs)
  delete filter.current
  delete filter.pageSize

  const offset = (currentPage - 1) * limit
  const totalItems = await CartItemModel.countDocuments(filter)
  const totalPages = Math.ceil(totalItems / limit)

  const results = await CartItemModel.find(filter)
    .skip(offset)
    .limit(limit)
    .sort(sort as any)
    .populate(population)
    .lean()
    .exec()

  return {
    meta: {
      current: currentPage,
      pageSize: limit,
      pages: totalPages,
      total: totalItems
    },
    results
  }
}

const handleFetchCartItemInfo = async (id: string): Promise<ICartItem> => {
  const item = await CartItemModel.findById(id).lean().exec()
  if (!item) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy mục giỏ hàng')
  }
  return item
}

const handleUpdateCartItem = async (
  id: string,
  data: Partial<ICartItem>
): Promise<{ acknowledged: boolean; modifiedCount: number; matchedCount: number }> => {
  const item = await CartItemModel.updateOne({ _id: id }, { $set: data })
  if (!item.matchedCount) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không thể cập nhật: mục giỏ hàng không tồn tại')
  }
  return item
}

const handleDeleteCartItem = async (id: string): Promise<{ acknowledged: boolean; deletedCount: number }> => {
  const result = await CartItemModel.deleteOne({ _id: id })
  if (!result.deletedCount) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không thể xoá: mục giỏ hàng không tồn tại')
  }
  return result
}

export const CartItemService = {
  handleCreateCartItem,
  handleFetchAllCartItems,
  handleFetchCartItemInfo,
  handleUpdateCartItem,
  handleDeleteCartItem
}
