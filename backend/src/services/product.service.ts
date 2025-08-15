import aqp from 'api-query-params'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import ProductModel from '~/models/product.model'
import { convertSlugUrl, isExistObject, isValidMongoId } from '~/utils/utils'
import '../models/category.model'
import '../models/brand.model'
import mongoose, { Types } from 'mongoose'
import ProductVariantModel from '~/models/product-variant.model'
import VariantAttributeModel from '~/models/variant-attribute.model'
import OrderItemModel from '~/models/orderItems.model'

export interface IAttributeValue {
  attributeId: string
  value: string
}

export interface IVariantAttribute {
  attributeId: string
  variantId: string
  value: string
}

export interface IProductVariant {
  sku: string
  price: number
  stock: number
  image: string
  attributes: IAttributeValue[]
}

export interface IProduct {
  name: string
  slug: string
  price?: number
  description?: string
  categoryId?: string
  brandId?: string
  image?: string
  stock?: number
  capacity: number
  variants?: IProductVariant | IProductVariant[]
}

const handleCreateProduct = async (productData: IProduct) => {
  // 1. Bắt đầu session + transaction
  const session = await mongoose.startSession()
  session.startTransaction()
  try {
    // 2. Kiểm tra sản phẩm đã tồn tại hay chưa (theo name)
    await isExistObject(
      ProductModel,
      { name: productData.name },
      {
        checkExisted: true,
        errorMessage: 'Sản phẩm đã tồn tại!'
      }
    )

    // 3. Tạo slug nếu chưa có
    const slug = productData.slug ?? convertSlugUrl(productData.name)

    // 4. Tạo product chính
    const createdProducts = await ProductModel.create(
      [
        {
          ...productData,
          slug
        }
      ],
      { session }
    )
    const product = createdProducts[0]

    // 5. Nếu không có variants -> commit và return luôn
    if (!productData.variants || !Array.isArray(productData.variants) || productData.variants.length === 0) {
      await session.commitTransaction()
      session.endSession()
      // Trả về product dạng Object (lean)
      return product.toObject()
    }

    // 6. Nếu có variants, xử lý tiếp:
    // 6.1 Tạo các ProductVariant (chưa include attributes)
    const variantDocs = productData.variants.map((variant: IProductVariant) => ({
      productId: product._id,
      sku: variant.sku,
      price: variant.price,
      stock: variant.stock,
      image: variant.image
    }))
    const createdVariants = await ProductVariantModel.insertMany(variantDocs, { session })

    let variantAttributes: IVariantAttribute[] = []
    if (Array.isArray(productData.variants)) {
      variantAttributes = (productData.variants as IProductVariant[]).flatMap(
        (variant: IProductVariant, idx: number) => {
          return (variant.attributes || []).map((attr: IAttributeValue, index: number) => {
            return {
              variantId: String(createdVariants[idx]._id),
              attributeId: (variant.attributes && variant.attributes[index]?.attributeId) || '',
              value: attr.value
            }
          })
        }
      )
    }
    // 6.2 Tạo các VariantAttribute từ attributes của từng variant
    if (variantAttributes.length > 0) {
      await VariantAttributeModel.insertMany(variantAttributes, { session })
    }

    // 7. Commit transaction & kết thúc
    await session.commitTransaction()
    session.endSession()

    return 'Tạo sản phẩm thành công!'
  } catch (error) {
    // Nếu bất kỳ lỗi nào xảy ra -> rollback và throw
    await session.abortTransaction()
    session.endSession()
    // Nên log thêm error gốc (nếu dùng logger) để dễ debug
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Có lỗi xảy ra trong quá trình tạo sản phẩm!')
  }
}

const handleFetchAllProduct = async ({
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

  const totalItems = await ProductModel.countDocuments(filter)
  const totalPages = Math.ceil(totalItems / defaultLimit)

  const results = await ProductModel.find(filter)
    .skip(offset)
    .limit(defaultLimit)
    .sort(sort && Object.keys(sort).length > 0 ? sort as any : { createdAt: -1 })
    .populate({ path: 'categoryId', model: 'Category', select: 'name' })
    .populate({ path: 'brandId', model: 'Brand', select: 'name' })
    .populate({
      path: 'variants',
      model: 'ProductVariant',
      match: { deleted: false },
      populate: {
        path: 'variant_attributes',
        model: 'VariantAttribute',
        select: 'value',
        match: { deleted: false },
        populate: {
          path: 'attributeId',
          model: 'attributes',
          match: { deleted: false },
          select: 'name slug'
        }
      }
    })
    .lean()
    .exec()

  // Xử lý giá sản phẩm, tồn kho và mô tả
  const processedResults = results.map(product => {
    if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
      // Lấy giá từ variant đầu tiên
      product.price = product.variants[0].price
      product.stock = product.variants.reduce((sum, variant) => sum + (variant.stock || 0), 0)
    }
    // Giữ nguyên HTML trong mô tả
    // if (product.description) {
    //   product.description = stripHtmlTags(product.description)
    // }
    return product
  })

  return {
    meta: {
      current: currentPage,
      pageSize: defaultLimit,
      pages: totalPages,
      total: totalItems
    },
    results: processedResults
  }
}

const handleFetchInfoProduct = async (productId: string) => {
  isValidMongoId(productId)

  const product = await ProductModel.findById(productId)
    .populate({ path: 'categoryId', model: 'Category', select: 'name' })
    .populate({ path: 'brandId', model: 'Brand', select: 'name' })
    .populate({
      path: 'variants',
      model: 'ProductVariant',
      match: { deleted: false },
      populate: {
        path: 'variant_attributes',
        model: 'VariantAttribute',
        select: 'value',
        match: { deleted: false },
        populate: {
          path: 'attributeId',
          model: 'attributes',
          match: { deleted: false },
          select: 'name slug'
        }
      }
    })
    .lean()
    .exec()

  if (!product) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Sản phẩm không tồn tại!')
  }

  // Xử lý giá sản phẩm và tồn kho: nếu có variants thì lấy giá của variant đầu tiên và tổng tồn kho của tất cả variants
  if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
    product.price = product.variants[0].price
    product.stock = product.variants.reduce((sum, variant) => sum + (variant.stock || 0), 0)
  }

  // Giữ nguyên HTML trong mô tả
  // if (product.description) {
  //   product.description = stripHtmlTags(product.description)
  // }

  return product
}

const handleUpdateProduct = async (productId: string, productData: IProduct) => {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    // 1. Kiểm tra sản phẩm tồn tại
    if (!Types.ObjectId.isValid(productId)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'ID sản phẩm không hợp lệ')
    }
    const existingProduct = await ProductModel.findById(productId).session(session)
    if (!existingProduct) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Sản phẩm không tồn tại')
    }

    // 2. Cập nhật thông tin product chính
    const slug = productData.slug ?? convertSlugUrl(productData.name)
    existingProduct.set({
      name: productData.name,
      description: productData.description,
      price: productData.price,
      image: productData.image,
      slug,
      categoryId: productData.categoryId,
      brandId: productData.brandId
    })
    await existingProduct.save({ session })

    // 3. Xóa hết variants và variantAttributes cũ của product này
    const oldVariants = await ProductVariantModel.find({ productId }, '_id').session(session)
    const oldVariantIds = oldVariants.map(v => v._id)
    if (oldVariantIds.length > 0) {
      await VariantAttributeModel.deleteMany({ variantId: { $in: oldVariantIds } }).session(session)
      await ProductVariantModel.deleteMany({ productId }).session(session)
    }

    // 4. Nếu có variants mới, tạo lại
    if (Array.isArray(productData.variants) && productData.variants.length > 0) {
      // 4.1 Tạo ProductVariant
      const variantDocs = productData.variants.map((variant: IProductVariant) => ({
        productId: existingProduct._id,
        sku: variant.sku,
        price: variant.price,
        stock: variant.stock,
        image: variant.image
      }));
      const createdVariants = await ProductVariantModel.insertMany(variantDocs, { session })

      // 4.2 Tạo VariantAttribute
      const variantAttributes: IVariantAttribute[] = []
      createdVariants.forEach((createdVar, idx) => {
        const attrs = productData.variants[idx].attributes || []
        attrs.forEach(attr => {
          variantAttributes.push({
            variantId: String(createdVar._id),
            attributeId: attr.attributeId,
            value: attr.value
          })
        })
      })
      if (variantAttributes.length > 0) {
        await VariantAttributeModel.insertMany(variantAttributes, { session })
      }
    }

    // 5. Commit và end session
    await session.commitTransaction()
    session.endSession()

    // Trả về object lean
    return existingProduct.toObject()
  } catch (error) {
    // Rollback
    await session.abortTransaction()
    session.endSession()

    // Nếu là ApiError thì ném tiếp, ngược lại bọc chung
    if (error instanceof ApiError) throw error
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Có lỗi xảy ra khi cập nhật sản phẩm')
  }
}

const handleDeleteProduct = async (productId: string) => {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    // 1. Kiểm tra productId hợp lệ
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'productId không hợp lệ')
    }

    // 2. Tìm sản phẩm chính
    const product = await ProductModel.findById(productId).session(session)
    if (!product) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Sản phẩm không tồn tại')
    }

    // 3. Kiểm tra xem sản phẩm đã có trong đơn hàng nào chưa
    const orderItemExists = await OrderItemModel.findOne({ productId: product._id, deleted: false }).session(session)
    
    if (orderItemExists) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST, 
        'Không thể xóa sản phẩm này vì đã có trong đơn hàng. Vui lòng ngừng kinh doanh sản phẩm thay vì xóa.'
      )
    }

    // 4. Soft-delete sản phẩm chính
    //    plugin mongoose-delete cung cấp method `delete()` trên document
    await product.delete({ session })

    // 5. Soft-delete tất cả variant liên quan
    //    Sử dụng Model.deleteMany hoặc statics do plugin cung cấp
    await ProductVariantModel.delete({ productId: product._id }).session(session)

    // 6. Commit transaction
    await session.commitTransaction()
    session.endSession()

    return { message: 'Xóa sản phẩm thành công (soft-delete)' }
  } catch (err) {
    // Rollback nếu có lỗi
    await session.abortTransaction()
    session.endSession()

    if (err instanceof ApiError) throw err
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Có lỗi khi xóa sản phẩm')
  }
}

export const productService = {
  handleCreateProduct,
  handleFetchAllProduct,
  handleFetchInfoProduct,
  handleUpdateProduct,
  handleDeleteProduct
}
