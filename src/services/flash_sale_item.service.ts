import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import FlashSaleItemModel from '~/models/flash_sale_item.model'
import { Types } from 'mongoose'

export interface IFlashSaleItem {
  flashSaleId: string
  productId: string
  variantId?: string
  discountPercent: number
}

const handleCreateFlashSaleItem = async (data: IFlashSaleItem) => {
  // Kiểm tra trùng sản phẩm trong cùng flash sale
  const query: any = {
    flashSaleId: data.flashSaleId,
    productId: data.productId
  }
  
  // Nếu có variantId, thêm vào điều kiện tìm kiếm
  if (data.variantId) {
    query.variantId = data.variantId
  } else {
    // Nếu không có variantId, kiểm tra xem đã có flash sale cho sản phẩm này chưa (không có variantId)
    query.variantId = { $exists: false }
  }
  
  const existed = await FlashSaleItemModel.findOne(query)
  if (existed) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Sản phẩm đã có trong flash sale này!')
  }
  const created = await FlashSaleItemModel.create(data)
  return created.toObject()
}

const handleFetchAllFlashSaleItems = async ({
  flashSaleId,
  currentPage,
  limit
}: {
  flashSaleId?: string
  currentPage: number
  limit: number
}) => {
  const filter: any = {}
  if (flashSaleId) filter.flashSaleId = flashSaleId

  const offset = (+currentPage - 1) * +limit
  const defaultLimit = +limit || 10

  const totalItems = await FlashSaleItemModel.countDocuments(filter)
  const totalPages = Math.ceil(totalItems / defaultLimit)

  const results = await FlashSaleItemModel.find(filter)
    .skip(offset)
    .limit(defaultLimit)
    .populate({ path: 'productId', select: 'name price image' })
    .populate({ 
      path: 'variantId', 
      select: 'sku price stock',
      options: { allowEmptyArray: true } 
    })
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

const handleFetchInfoFlashSaleItem = async (itemId: string) => {
  if (!Types.ObjectId.isValid(itemId)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'ID flash sale item không hợp lệ')
  }
  const item = await FlashSaleItemModel.findById(itemId)
    .populate({ path: 'productId', select: 'name price image' })
    .populate({ 
      path: 'variantId', 
      select: 'sku price stock',
      options: { allowEmptyArray: true } 
    })
    .lean()
    .exec()
  if (!item) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Flash sale item không tồn tại!')
  }
  return item
}

const handleUpdateFlashSaleItem = async (itemId: string, data: Partial<IFlashSaleItem>) => {
  if (!Types.ObjectId.isValid(itemId)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'ID flash sale item không hợp lệ')
  }
  const updated = await FlashSaleItemModel.findByIdAndUpdate(itemId, { $set: data }, { new: true }).lean()
  if (!updated) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Flash sale item không tồn tại!')
  }
  return updated
}

const handleDeleteFlashSaleItem = async (itemId: string) => {
  if (!Types.ObjectId.isValid(itemId)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'ID flash sale item không hợp lệ')
  }
  const deleted = await FlashSaleItemModel.delete({ _id: itemId })
  if (!deleted) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Flash sale item không tồn tại!')
  }
  return { message: 'Xóa flash sale item thành công (soft-delete)' }
}

const handleFetchActiveFlashSaleItems = async () => {
  const now = new Date()
  
  // Tìm flash sales đang hoạt động
  const activeFlashSales = await FlashSaleItemModel.aggregate([
    {
      $lookup: {
        from: 'flash_sales',
        localField: 'flashSaleId',
        foreignField: '_id',
        as: 'flashSale'
      }
    },
    {
      $unwind: '$flashSale'
    },
    {
      $match: {
        'flashSale.isActive': true,
        'flashSale.deleted': { $ne: true }
      }
    },
    {
      $lookup: {
        from: 'products',
        localField: 'productId',
        foreignField: '_id',
        as: 'productId'
      }
    },
    {
      $unwind: '$productId'
    },
    {
      $lookup: {
        from: 'variants',
        localField: 'variantId',
        foreignField: '_id',
        as: 'variantId'
      }
    },
    {
      $unwind: {
        path: '$variantId',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $project: {
        _id: 1,
        flashSaleId: 1,
        productId: {
          _id: '$productId._id',
          name: '$productId.name',
          price: '$productId.price',
          image: '$productId.image'
        },
        variantId: {
          $cond: {
            if: { $ne: ['$variantId', null] },
            then: {
              _id: '$variantId._id',
              sku: '$variantId.sku',
              price: '$variantId.price',
              stock: '$variantId.stock'
            },
            else: null
          }
        },
        discountPercent: 1,
        createdAt: 1,
        updatedAt: 1
      }
    }
  ])
  
  return activeFlashSales
}

export const flashSaleItemService = {
  handleCreateFlashSaleItem,
  handleFetchAllFlashSaleItems,
  handleFetchInfoFlashSaleItem,
  handleUpdateFlashSaleItem,
  handleDeleteFlashSaleItem,
  handleFetchActiveFlashSaleItems
}
