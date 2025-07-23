import aqp from 'api-query-params'
import { StatusCodes } from 'http-status-codes'
import mongoose from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import WishlistModel from '~/models/wishlist.model'
import ApiError from '~/utils/ApiError'
import { isValidMongoId } from '~/utils/utils'

export interface IWishlist {
  userId: string
  productId: string
}

const handleCreateWishlist = async (wishlistData: IWishlist) => {
  try {
    // Check if wishlist item already exists
    const existingWishlist = await WishlistModel.findOne({
      userId: wishlistData.userId,
      productId: wishlistData.productId,
      deleted: false
    })

    if (existingWishlist) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Sản phẩm đã tồn tại trong danh sách yêu thích!')
    }

    // Create new wishlist item with UUID
    const wishlist = await WishlistModel.create({
      _id: uuidv4(),
      ...wishlistData
    })

    return wishlist.toObject()
  } catch (error) {
    if (error instanceof ApiError) throw error
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Có lỗi xảy ra khi thêm vào danh sách yêu thích!')
  }
}

const handleFetchWishlistByUser = async ({
  userId,
  currentPage,
  limit,
  qs
}: {
  userId: string
  currentPage: number
  limit: number
  qs: string
}) => {
  try {
    const { filter, sort } = aqp(qs)
    delete filter.current
    delete filter.pageSize

    // Add userId filter
    filter.userId = userId
    filter.deleted = false

    const offset = (+currentPage - 1) * +limit
    const defaultLimit = +limit || 10

    const totalItems = await WishlistModel.countDocuments(filter)
    const totalPages = Math.ceil(totalItems / defaultLimit)

    const results = await WishlistModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate({ path: 'productId', model: 'products' })
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
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Có lỗi xảy ra khi lấy danh sách yêu thích!')
  }
}

const handleDeleteWishlist = async (wishlistId: string) => {
  try {
    // Check if wishlist item exists
    const wishlist = await WishlistModel.findById(wishlistId)
    if (!wishlist) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy sản phẩm trong danh sách yêu thích!')
    }

    // Soft delete the wishlist item
    await wishlist.delete()

    return { message: 'Xóa sản phẩm khỏi danh sách yêu thích thành công!' }
  } catch (error) {
    if (error instanceof ApiError) throw error
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Có lỗi xảy ra khi xóa sản phẩm khỏi danh sách yêu thích!')
  }
}

const handleCheckWishlist = async (userId: string, productId: string) => {
  try {
    const wishlist = await WishlistModel.findOne({
      userId,
      productId,
      deleted: false
    })

    return {
      exists: !!wishlist,
      wishlistId: wishlist ? wishlist._id : null
    }
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Có lỗi xảy ra khi kiểm tra danh sách yêu thích!')
  }
}

const handleDeleteWishlistByProduct = async (userId: string, productId: string) => {
  try {
    const wishlist = await WishlistModel.findOne({
      userId,
      productId,
      deleted: false
    })

    if (!wishlist) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy sản phẩm trong danh sách yêu thích!')
    }

    await wishlist.delete()

    return { message: 'Xóa sản phẩm khỏi danh sách yêu thích thành công!' }
  } catch (error) {
    if (error instanceof ApiError) throw error
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Có lỗi xảy ra khi xóa sản phẩm khỏi danh sách yêu thích!')
  }
}

export const wishlistService = {
  handleCreateWishlist,
  handleFetchWishlistByUser,
  handleDeleteWishlist,
  handleDeleteWishlistByProduct,
  handleCheckWishlist
}
