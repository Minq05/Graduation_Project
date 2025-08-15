import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import CartModel, { ICart } from '~/models/cart.model'
import CartItemModel, { ICartItem } from '~/models/cartitem.model'
import ProductVariantModel from '~/models/product-variant.model'
import ProductModel from '~/models/product.model'
import FlashSaleItemModel from '~/models/flash_sale_item.model'
import FlashSaleModel from '~/models/flash_sale.model'
import mongoose from 'mongoose'
import VariantAttributeModel from '~/models/variant-attribute.model'

// Helper function để kiểm tra giá flash sale
const getFlashSalePrice = async (productId: string, variantId: string) => {
  try {
    const now = new Date()
    
    // Tìm flash sale item cho variant cụ thể
    const flashSaleItem = await FlashSaleItemModel.findOne({
      productId,
      variantId,
      deleted: false
    }).populate({
      path: 'flashSaleId',
      match: {
        startDate: { $lte: now },
        endDate: { $gte: now },
        isActive: true,
        deleted: false
      }
    }).lean()
    
    if (flashSaleItem && flashSaleItem.flashSaleId) {
      const remainingQuantity = flashSaleItem.limitQuantity - flashSaleItem.soldQuantity
      return {
        hasFlashSale: true,
        discountPercent: flashSaleItem.discountPercent,
        limitQuantity: flashSaleItem.limitQuantity,
        soldQuantity: flashSaleItem.soldQuantity,
        remainingQuantity,
        flashSaleItemId: flashSaleItem._id
      }
    }
    
    return { hasFlashSale: false, discountPercent: 0, remainingQuantity: 0 }
  } catch (error) {
    console.error('Error checking flash sale:', error)
    return { hasFlashSale: false, discountPercent: 0 }
  }
}

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

    // 3. Kiểm tra giá flash sale và giới hạn
    const flashSaleInfo = await getFlashSalePrice(item.productId, item.variantId)
    let finalPrice = variant.price
    let canApplyFlashSale = false
    
    if (flashSaleInfo.hasFlashSale && flashSaleInfo.remainingQuantity > 0) {
      // Kiểm tra số lượng hiện tại trong giỏ hàng
      const existingCartItem = await CartItemModel.findOne({
        cartId, productId: item.productId, variantId: item.variantId
      }).session(session)
      
      const currentCartQuantity = existingCartItem ? existingCartItem.quantity : 0
      
      // Chỉ áp dụng flash sale cho số lượng thêm vào nếu còn slot
      const availableFlashSaleSlots = Math.max(0, flashSaleInfo.remainingQuantity - currentCartQuantity)
      
      if (availableFlashSaleSlots > 0) {
        const flashSaleQuantityForThisAdd = Math.min(item.quantity, availableFlashSaleSlots)
        if (flashSaleQuantityForThisAdd > 0) {
          canApplyFlashSale = true
          
          if (flashSaleQuantityForThisAdd === item.quantity) {
            // Toàn bộ số lượng thêm vào đều được flash sale
            finalPrice = variant.price * (1 - flashSaleInfo.discountPercent / 100)
          } else {
            // Một phần flash sale, một phần giá gốc
            const regularQuantity = item.quantity - flashSaleQuantityForThisAdd
            const flashSalePrice = variant.price * (1 - flashSaleInfo.discountPercent / 100)
            
            // Tính giá trung bình cho item này
            finalPrice = (flashSalePrice * flashSaleQuantityForThisAdd + variant.price * regularQuantity) / item.quantity
          }
        }
      }
    }

    // 4. Thêm mới hoặc cập nhật số lượng với upsert
    const existingItem = await CartItemModel.findOne({
      cartId, productId: item.productId, variantId: item.variantId, value: valueProduct?.value
    }).session(session)
    
    let updatedItem
    if (existingItem) {
      // Cập nhật item hiện có
      const newTotalQuantity = existingItem.quantity + item.quantity
      
      // Tính lại giá cho toàn bộ số lượng mới
      let newFinalPrice = variant.price
      let newCanApplyFlashSale = false
      
      if (flashSaleInfo.hasFlashSale && flashSaleInfo.remainingQuantity > 0) {
        if (newTotalQuantity <= flashSaleInfo.remainingQuantity) {
          // Toàn bộ số lượng đều được flash sale
          newCanApplyFlashSale = true
          newFinalPrice = variant.price * (1 - flashSaleInfo.discountPercent / 100)
        } else {
          // Một phần flash sale, một phần giá gốc
          const flashSaleQuantity = flashSaleInfo.remainingQuantity
          const regularQuantity = newTotalQuantity - flashSaleQuantity
          const flashSalePrice = variant.price * (1 - flashSaleInfo.discountPercent / 100)
          
          // Tính giá trung bình
          newFinalPrice = (flashSalePrice * flashSaleQuantity + variant.price * regularQuantity) / newTotalQuantity
          newCanApplyFlashSale = flashSaleQuantity > 0
        }
      }
      
      updatedItem = await CartItemModel.findOneAndUpdate(
        { _id: existingItem._id },
        {
          quantity: newTotalQuantity,
          price: newFinalPrice,
          originalPrice: variant.price,
          hasFlashSale: newCanApplyFlashSale,
          discountPercent: newCanApplyFlashSale ? (flashSaleInfo.discountPercent || 0) : 0,
          flashSaleItemId: newCanApplyFlashSale ? (flashSaleInfo.flashSaleItemId || null) : null
        },
        { new: true, session }
      )
    } else {
      // Tạo item mới
      updatedItem = await CartItemModel.create([{
        cartId,
        productId: item.productId,
        variantId: item.variantId,
        value: valueProduct?.value,
        quantity: item.quantity,
        price: finalPrice,
        originalPrice: variant.price,
        hasFlashSale: canApplyFlashSale,
        discountPercent: canApplyFlashSale ? (flashSaleInfo.discountPercent || 0) : 0,
        flashSaleItemId: canApplyFlashSale ? (flashSaleInfo.flashSaleItemId || null) : null
      }], { session })
      updatedItem = updatedItem[0]
    }

    // 5. Sau khi update, kiểm tra tồn kho
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
  const cartInfo = await CartItemModel.find({ cartId: id })
    .populate('productId')
    .populate('variantId')
    .lean()
    .exec()
  
  if (!cartInfo) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy giỏ hàng')
  }
  
  // Cập nhật giá flash sale cho các item (nếu cần)
  const updatedCartInfo = await Promise.all(
    cartInfo.map(async (item) => {
      const flashSaleInfo = await getFlashSalePrice(item.productId, item.variantId)
      
      // Nếu có flash sale mới hoặc flash sale đã hết hạn, cập nhật lại
      if (item.hasFlashSale !== flashSaleInfo.hasFlashSale || 
          item.discountPercent !== flashSaleInfo.discountPercent) {
        
        const variant = await ProductVariantModel.findById(item.variantId)
        if (variant) {
          let newPrice = variant.price
          let hasFlashSale = false
          let discountPercent = 0
          let flashSaleItemId = null
          
          if (flashSaleInfo.hasFlashSale && flashSaleInfo.remainingQuantity > 0) {
            if (item.quantity <= flashSaleInfo.remainingQuantity) {
              // Toàn bộ số lượng đều được flash sale
              hasFlashSale = true
              discountPercent = flashSaleInfo.discountPercent
              flashSaleItemId = flashSaleInfo.flashSaleItemId
              newPrice = variant.price * (1 - flashSaleInfo.discountPercent / 100)
            } else {
              // Một phần flash sale, một phần giá gốc
              const flashSaleQuantity = flashSaleInfo.remainingQuantity
              const regularQuantity = item.quantity - flashSaleQuantity
              const flashSalePrice = variant.price * (1 - flashSaleInfo.discountPercent / 100)
              
              // Tính giá trung bình
              newPrice = (flashSalePrice * flashSaleQuantity + variant.price * regularQuantity) / item.quantity
              hasFlashSale = flashSaleQuantity > 0
              discountPercent = hasFlashSale ? flashSaleInfo.discountPercent : 0
              flashSaleItemId = hasFlashSale ? flashSaleInfo.flashSaleItemId : null
            }
          }
          
          await CartItemModel.updateOne(
            { _id: item._id },
            {
              price: newPrice,
              originalPrice: variant.price,
              hasFlashSale: hasFlashSale,
              discountPercent: discountPercent,
              flashSaleItemId: flashSaleItemId
            }
          )
          
          return {
            ...item,
            price: newPrice,
            originalPrice: variant.price,
            hasFlashSale: hasFlashSale,
            discountPercent: discountPercent,
            flashSaleItemId: flashSaleItemId
          }
        }
      }
      
      return item
    })
  )
  
  return updatedCartInfo
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

    // 5. Kiểm tra flash sale và tính lại giá
    const flashSaleInfo = await getFlashSalePrice(cartItem.productId.toString(), cartItem.variantId.toString())
    let newPrice = variant.price
    let hasFlashSale = false
    let discountPercent = 0
    let flashSaleItemId = null
    
    if (flashSaleInfo.hasFlashSale && flashSaleInfo.remainingQuantity > 0) {
      if (newQuantity <= flashSaleInfo.remainingQuantity) {
        // Toàn bộ số lượng đều được flash sale
        hasFlashSale = true
        discountPercent = flashSaleInfo.discountPercent
        flashSaleItemId = flashSaleInfo.flashSaleItemId
        newPrice = variant.price * (1 - flashSaleInfo.discountPercent / 100)
      } else {
        // Một phần flash sale, một phần giá gốc
        const flashSaleQuantity = flashSaleInfo.remainingQuantity
        const regularQuantity = newQuantity - flashSaleQuantity
        const flashSalePrice = variant.price * (1 - flashSaleInfo.discountPercent / 100)
        
        // Tính giá trung bình
        newPrice = (flashSalePrice * flashSaleQuantity + variant.price * regularQuantity) / newQuantity
        hasFlashSale = flashSaleQuantity > 0
        discountPercent = hasFlashSale ? flashSaleInfo.discountPercent : 0
        flashSaleItemId = hasFlashSale ? flashSaleInfo.flashSaleItemId : null
      }
    }

    // 6. Cập nhật số lượng và giá
    cartItem.quantity = newQuantity
    cartItem.price = newPrice
    cartItem.originalPrice = variant.price
    cartItem.hasFlashSale = hasFlashSale
    cartItem.discountPercent = discountPercent
    cartItem.flashSaleItemId = flashSaleItemId
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
