import aqp from 'api-query-params'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import FlashSaleModel from '~/models/flash_sale.model'
import { Types } from 'mongoose'

export interface IFlashSale {
  name: string
  description?: string
  startDate: Date
  endDate: Date
  isActive?: boolean
}

const handleCreateFlashSale = async (flashSaleData: IFlashSale) => {
  try {
    // Kiểm tra trùng tên
    const existed = await FlashSaleModel.findOne({ name: flashSaleData.name })
    if (existed) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Flash sale đã tồn tại!')
    }
    const created = await FlashSaleModel.create(flashSaleData)
    return created.toObject()
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Có lỗi xảy ra trong quá trình tạo flash sale!')
  }
}

const handleFetchAllFlashSales = async ({
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

  const offset = (+currentPage - 1) * +limit
  const defaultLimit = +limit || 10

  const totalItems = await FlashSaleModel.countDocuments(filter)
  const totalPages = Math.ceil(totalItems / defaultLimit)

  const results = await FlashSaleModel.find(filter)
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

const handleFetchInfoFlashSale = async (flashSaleId: string) => {
  if (!Types.ObjectId.isValid(flashSaleId)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'ID flash sale không hợp lệ')
  }
  const flashSale = await FlashSaleModel.findById(flashSaleId).lean().exec()
  if (!flashSale) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Flash sale không tồn tại!')
  }
  return flashSale
}

const handleUpdateFlashSale = async (flashSaleId: string, flashSaleData: IFlashSale) => {
  if (!Types.ObjectId.isValid(flashSaleId)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'ID flash sale không hợp lệ')
  }
  const updated = await FlashSaleModel.findByIdAndUpdate(flashSaleId, { $set: flashSaleData }, { new: true }).lean()
  if (!updated) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Flash sale không tồn tại!')
  }
  return updated
}

const handleDeleteFlashSale = async (flashSaleId: string) => {
  if (!Types.ObjectId.isValid(flashSaleId)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'ID flash sale không hợp lệ')
  }
  const deleted = await FlashSaleModel.delete({ _id: flashSaleId })
  if (!deleted) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Flash sale không tồn tại!')
  }
  return { message: 'Xóa flash sale thành công (soft-delete)' }
}

// Kích hoạt flash sale
const handleActivateFlashSale = async (flashSaleId: string) => {
  if (!Types.ObjectId.isValid(flashSaleId)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'ID flash sale không hợp lệ')
  }
  
  const flashSale = await FlashSaleModel.findById(flashSaleId).lean()
  if (!flashSale) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Flash sale không tồn tại!')
  }
  
  // Kiểm tra nếu flash sale đã kết thúc
  if (new Date(flashSale.endDate) < new Date()) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Flash sale đã kết thúc, không thể kích hoạt!')
  }
  
  // Cập nhật trạng thái isActive = true
  const updated = await FlashSaleModel.findByIdAndUpdate(
    flashSaleId, 
    { $set: { isActive: true } }, 
    { new: true }
  ).lean()
  
  if (!updated) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Flash sale không tồn tại!')
  }
  
  return { message: 'Kích hoạt flash sale thành công', data: updated }
}

// Hủy kích hoạt flash sale
const handleDeactivateFlashSale = async (flashSaleId: string) => {
  if (!Types.ObjectId.isValid(flashSaleId)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'ID flash sale không hợp lệ')
  }
  
  const flashSale = await FlashSaleModel.findById(flashSaleId).lean()
  if (!flashSale) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Flash sale không tồn tại!')
  }
  
  // Cập nhật trạng thái isActive = false
  const updated = await FlashSaleModel.findByIdAndUpdate(
    flashSaleId, 
    { $set: { isActive: false } }, 
    { new: true }
  ).lean()
  
  if (!updated) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Flash sale không tồn tại!')
  }
  
  return { message: 'Hủy kích hoạt flash sale thành công', data: updated }
}

// Lấy sản phẩm Flash Sale đang hoạt động
const handleGetActiveFlashSaleProducts = async () => {
  try {
    const FlashSaleItemModel = require('~/models/flash_sale_item.model').default
    
    // Lấy tất cả flash sale đang hoạt động
    const now = new Date()
    const activeFlashSales = await FlashSaleModel.find({
      startDate: { $lte: now },
      endDate: { $gte: now },
      isActive: true,
      deleted: false
    }).lean()
    
    if (activeFlashSales.length === 0) {
      return []
    }
    
    const flashSaleIds = activeFlashSales.map(fs => fs._id)
    
    // Lấy tất cả flash sale items của các flash sale đang hoạt động
    const flashSaleItems = await FlashSaleItemModel.find({
      flashSaleId: { $in: flashSaleIds },
      deleted: false
    })
    .populate({
      path: 'productId',
      select: 'name image price description slug categoryId brandId'
    })
    .populate({
      path: 'variantId', 
      select: 'price sku stock'
    })
    .lean()
    
    return flashSaleItems
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Có lỗi xảy ra khi lấy danh sách sản phẩm Flash Sale')
  }
}

export const flashSaleService = {
  handleCreateFlashSale,
  handleFetchAllFlashSales,
  handleFetchInfoFlashSale,
  handleUpdateFlashSale,
  handleDeleteFlashSale,
  handleActivateFlashSale,
  handleDeactivateFlashSale,
  handleGetActiveFlashSaleProducts
}
