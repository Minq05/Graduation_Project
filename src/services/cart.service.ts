import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import CartModel, { ICart } from '~/models/cart.model'
import CartItemModel, { ICartItem } from '~/models/cartitem.model'
import ProductVariantModel from '~/models/product-variant.model'
import ProductModel from '~/models/product.model'
import mongoose from 'mongoose'
import VariantAttributeModel from '~/models/variant-attribute.model'

const handleFetchCartByUser = async (userId: string) => {
  const carts = await CartModel.findOne({ userId }).populate('userId', 'name email').lean().exec()
  return carts
}

// Tạo giỏ hàng mới
const handleCreateCart = async (data: ICart): Promise<ICart> => {
  const existing = await CartModel.findOne({ userId: data.userId })
  if (existing) {
    throw new ApiError(StatusCodes.CONFLICT, 'Giỏ hàng cho người dùng này đã tồn tại')
  }

  const result = await CartModel.create(data)
  return result.toObject()
}

const handleAddItemToCart = async (cartId: string, item: ICartItem) => {
  const session = await mongoose.startSession()
  try {
    session.startTransaction()

    // 1. Kiểm tra giỏ hàng tồn tại
    const cart = await CartModel.findById(cartId).session(session)
    if (!cart) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Giỏ hàng không tồn tại')
    }

    // 2. Lấy product và variant (trong cùng session)
    const [product, variant] = await Promise.all([
      ProductModel.findById(item.productId).session(session),
      ProductVariantModel.findById(item.variantId).session(session)
    ])
    const valueProduct = await VariantAttributeModel.findOne({ variantId: item.variantId })
    if (!product) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Sản phẩm không tồn tại')
    }
    if (!variant) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Biến thể sản phẩm không tồn tại')
    }
    if (product.deleted || variant.deleted) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Sản phẩm hoặc biến thể đã bị xoá')
    }
    if (variant.price <= 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Giá sản phẩm không hợp lệ')
    }

    // 3. Thêm mới hoặc cập nhật số lượng với upsert
    const updatedItem = await CartItemModel.findOneAndUpdate(
      { cartId, productId: item.productId, variantId: item.variantId, value: valueProduct?.value },
      { $inc: { quantity: item.quantity } },
      {
        new: true, // trả về document sau update
        upsert: true, // nếu chưa có thì create mới
        session,
        runValidators: true, // chạy validator theo schema
        setDefaultsOnInsert: true
      }
    )

    // 4. Sau khi update, kiểm tra tồn kho
    if (updatedItem.quantity > variant.stock) {
      throw new ApiError(StatusCodes.BAD_REQUEST, `Không đủ hàng trong kho. Tồn kho: ${variant.stock}`)
    }

    await session.commitTransaction()
    return updatedItem
  } catch (err) {
    await session.abortTransaction()
    throw err
  } finally {
    session.endSession()
  }
}

// Lấy chi tiết giỏ hàng theo ID
const handleFetchCartInfo = async (id: string) => {
  const cartInfo = await CartItemModel.find({ cartId: id }).populate('productId').populate('variantId').lean().exec()
  if (!cartInfo) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy giỏ hàng')
  } else {
    return cartInfo
  }
}

// Cập nhật giỏ hàng
const handleUpdateCart = async (cartId: string, cartItemId: string, newQuantity: number) => {
  const session = await mongoose.startSession()
  try {
    session.startTransaction()

    // 1. Kiểm tra giỏ hàng tồn tại
    const cart = await CartModel.findById(cartId).session(session)
    if (!cart) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Giỏ hàng không tồn tại')
    }

    // 2. Kiểm tra mục giỏ hàng tồn tại và thuộc về giỏ
    const cartItem = await CartItemModel.findById(cartItemId).session(session)
    if (!cartItem || cartItem.cartId.toString() !== (cart._id as mongoose.Types.ObjectId).toString()) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Mục giỏ hàng không tồn tại')
    }

    // 3. Nếu newQuantity <= 0 → xoá mục đó
    if (newQuantity <= 0) {
      await cartItem.deleteOne({ session })
      await session.commitTransaction()
      return { message: 'Đã xoá mục khỏi giỏ hàng' }
    }

    // 4. Lấy variant để kiểm tra tồn kho
    const variant = await ProductVariantModel.findById(cartItem.variantId).session(session)
    if (!variant) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Biến thể sản phẩm không tồn tại')
    }
    if (variant.deleted) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Biến thể đã bị xoá')
    }
    if (newQuantity > variant.stock) {
      throw new ApiError(StatusCodes.BAD_REQUEST, `Không đủ hàng trong kho. Tồn kho hiện tại: ${variant.stock}`)
    }

    // 5. Cập nhật số lượng
    cartItem.quantity = newQuantity
    await cartItem.save({ session })

    await session.commitTransaction()
    return cartItem
  } catch (err) {
    await session.abortTransaction()
    throw err
  } finally {
    session.endSession()
  }
}

// Xoá sản phẩm khỏi giỏ hàng
const handleDeleteProductFromCart = async (cartId: string) => {
  const session = await mongoose.startSession()
  try {
    session.startTransaction()

    // 1. Kiểm tra giỏ hàng tồn tại
    const cart = await CartModel.findById(cartId).session(session)
    if (!cart) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Giỏ hàng không tồn tại')
    }

    // 2. Xóa tất cả mục trong giỏ
    const { deletedCount } = await CartItemModel.deleteMany({ cartId }).session(session)

    // 3. Commit transaction
    await session.commitTransaction()

    return {
      success: true,
      message: `Đã xóa ${deletedCount} mục khỏi giỏ hàng.`,
      deletedCount
    }
  } catch (err) {
    await session.abortTransaction()
    throw err
  } finally {
    session.endSession()
  }
}

// Xoá giỏ hàng
const handleDeleteCart = async (id: string): Promise<{ acknowledged: boolean; deletedCount: number }> => {
  const result = await CartModel.deleteOne({ _id: id })
  if (!result.deletedCount) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không thể xoá: giỏ hàng không tồn tại')
  }
  return result
}

const handleDeleteItemFromCart = async (
  cartId: string,
  itemId: string
): Promise<{ acknowledged: boolean; deletedCount: number }> => {
  const result = await CartItemModel.deleteOne({ _id: itemId, cartId })
  if (!result.deletedCount) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không thể xoá: mục giỏ hàng không tồn tại')
  }
  return result
}

export const cartService = {
  handleCreateCart,
  handleFetchCartInfo,
  handleUpdateCart,
  handleDeleteCart,
  handleAddItemToCart,
  handleDeleteProductFromCart,
  handleFetchCartByUser,
  handleDeleteItemFromCart
}
