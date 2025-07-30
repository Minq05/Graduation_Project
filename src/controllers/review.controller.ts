import { Request, Response } from 'express'
import Review from '../models/review.model'
import Product from '../models/product.model'
import OrderModel from '../models/order.model'
import OrderItemModel from '../models/orderItems.model'
import ApiError from '../utils/ApiError'
import { ApiResponse } from '../utils/ApiResponse'
import mongoose from 'mongoose'
import UserModel from '../models/user.model'

// Danh sách từ ngữ tục tĩu và không phù hợp
const badWords = [
  'đụ', 'địt', 'lồn', 'cặc', 'buồi', 'dái', 'đéo', 'đít', 'đĩ', 'đm', 'đmm', 'dmm',
  'fuck', 'shit', 'bitch', 'dick', 'pussy', 'asshole', 'cunt',
  'ngu', 'óc chó', 'súc vật', 'chó', 'lợn', 'mẹ mày', 'con mẹ', 'cmm', 'vcl', 'vl'
]

// Hàm kiểm tra từ ngữ tục tĩu trong nội dung
const checkForBadWords = (text: string): boolean => {
  if (!text) return false
  const lowerText = text.toLowerCase()
  for (const word of badWords) {
    if (lowerText.includes(word)) {
      return true
    }
  }
  return false
}

// Test đơn giản từng bước
export const simpleTest = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params
    
    // Bước 1: Kiểm tra user
    const user = await UserModel.findById(userId)
    if (!user) {
      return res.json({ step: 1, error: 'User not found', userId })
    }
    
    // Bước 2: Kiểm tra đơn hàng
    const allOrders = await OrderModel.find({ userId })
    const completedOrders = await OrderModel.find({ userId, status: 'completed' })
    
    if (completedOrders.length === 0) {
      return res.json({ 
        step: 2, 
        error: 'No completed orders', 
        allOrders: allOrders.length,
        orderStatuses: allOrders.map(o => o.status)
      })
    }
    
    // Bước 3: Kiểm tra OrderItems
    const orderIds = completedOrders.map(o => o._id)
    const orderItems = await OrderItemModel.find({ orderId: { $in: orderIds } })
    
    if (orderItems.length === 0) {
      return res.json({ 
        step: 3, 
        error: 'No order items found',
        completedOrderIds: orderIds
      })
    }
    
    // Bước 4: Kiểm tra Products
    const productIds = orderItems.map(oi => oi.productId)
    const products = await Product.find({ _id: { $in: productIds } })
    
    // Bước 5: Kiểm tra Reviews
    const reviews = await Review.find({ userId })
    
    return res.json({
      success: true,
      step: 'all_passed',
      data: {
        user: { id: user._id, name: user.fullName },
        completedOrders: completedOrders.length,
        orderItems: orderItems.length,
        products: products.length,
        reviews: reviews.length,
        sampleOrderItem: orderItems[0],
        sampleProduct: products[0]
      }
    })
    
  } catch (error) {
    res.json({ error: error.message, stack: error.stack })
  }
}

// Lấy danh sách sản phẩm có thể đánh giá từ đơn hàng đã hoàn thành
export const getReviewableProducts = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params
    
    const completedOrders = await OrderModel.find({
      userId,
      status: 'completed'
    })
    
    if (completedOrders.length === 0) {
      return res.status(200).json(
        new ApiResponse(200, [], 'Không có đơn hàng đã hoàn thành nào')
      )
    }
    
    const orderIds = completedOrders.map(order => order._id)
    const orderItems = await OrderItemModel.find({
      orderId: { $in: orderIds }
    })
    
    const populatedOrderItems = await OrderItemModel.find({
      orderId: { $in: orderIds }
    }).populate('productId', 'name image price')
    
    const validOrderItems = populatedOrderItems.filter(item => item.productId && item.productId._id)
    
    if (validOrderItems.length === 0) {
      return res.status(200).json(
        new ApiResponse(200, [], 'Không có sản phẩm hợp lệ nào')
      )
    }
    
    const productReviewCounts = await Review.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId)
        }
      },
      {
        $group: {
          _id: '$productId',
          count: { $sum: 1 }
        }
      }
    ])
    
    const reviewCountMap = new Map()
    productReviewCounts.forEach(item => {
      reviewCountMap.set(item._id.toString(), item.count)
    })
    
    const reviewableProducts = validOrderItems
      .filter(item => {
        const productId = item.productId._id.toString()
        const reviewCount = reviewCountMap.get(productId) || 0
        return reviewCount < 2
      })
      .map(item => ({
        orderId: item.orderId,
        productId: item.productId._id,
        productName: item.productId.name,
        productImage: item.productId.image?.[0] || '',
        productPrice: item.productId.price,
        quantity: item.quantity,
        reviewCount: reviewCountMap.get(item.productId._id.toString()) || 0,
        canReview: true
      }))
    
    const uniqueProducts = []
    const seenProductIds = new Set()
    
    for (const product of reviewableProducts) {
      if (!seenProductIds.has(product.productId.toString())) {
        seenProductIds.add(product.productId.toString())
        uniqueProducts.push(product)
      }
    }
    
    res.status(200).json(
      new ApiResponse(200, uniqueProducts, `Tìm thấy ${uniqueProducts.length} sản phẩm có thể đánh giá`)
    )
  } catch (error) {
    res.status(500).json(
      new ApiResponse(500, null, 'Lỗi khi lấy danh sách sản phẩm có thể đánh giá: ' + error.message)
    )
  }
}

// Tạo đánh giá mới
export const createReview = async (req: Request, res: Response) => {
  try {
    let { userId, productId, orderId, rating, comment, images } = req.body

    const product = await Product.findById(productId)
    if (!product) {
      throw new ApiError(404, 'Sản phẩm không tồn tại')
    }

    const orders = await OrderModel.find({
      userId,
      status: 'completed'
    })
    
    if (orders.length === 0) {
      throw new ApiError(403, 'Bạn chỉ có thể đánh giá sản phẩm từ đơn hàng đã hoàn thành')
    }

    const orderIds = orders.map(order => order._id)
    
    let orderItem = await OrderItemModel.findOne({
      orderId: { $in: orderIds },
      productId: productId
    })

    if (!orderItem) {
      throw new ApiError(403, 'Sản phẩm này không có trong đơn hàng đã hoàn thành của bạn')
    }

    if (!orderId) {
      orderId = orderItem.orderId
    }

    const reviewCount = await Review.countDocuments({
      userId,
      productId
    })

    if (reviewCount >= 2) {
      throw new ApiError(403, 'Bạn đã đạt giới hạn đánh giá cho sản phẩm này (tối đa 2 lần)')
    }

    const hasBadWords = checkForBadWords(comment)
    if (hasBadWords) {
      throw new ApiError(400, 'Nội dung đánh giá chứa từ ngữ không phù hợp. Vui lòng viết lại.')
    }
    
    const review = await Review.create({
      userId,
      productId,
      orderId,
      rating,
      comment,
      images: images || [],
      status: 'approved'
    })

    const message = 'Đánh giá của bạn đã được gửi thành công!'
    res.status(201).json(new ApiResponse(201, review, message))
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json(new ApiResponse(error.statusCode, null, error.message))
    } else {
      res.status(500).json(new ApiResponse(500, null, 'Lỗi khi tạo đánh giá'))
    }
  }
}

// Lấy tất cả đánh giá (có phân trang và lọc)
export const getAllReviews = async (req: Request, res: Response) => {
  try {
    console.log('=== getAllReviews called ===')
    console.log('Query params:', req.query)
    const { page = 1, limit = 10, status, search, startDate, endDate } = req.query as { page?: string, limit?: string, status?: string, search?: string, startDate?: string, endDate?: string }
    const query: any = {}
    console.log('Building query...')
    if (status) {
      query.status = status
      console.log('Added status filter:', status)
    }
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      }
      console.log('Added date filter:', startDate, endDate)
    }
    if (search) {
      console.log('Processing search:', search)
      const productIds = await Product.find({
        name: { $regex: search, $options: 'i' }
      }).distinct('_id')
      console.log('Found product IDs:', productIds.length)
      const userIds = await UserModel.find({
        $or: [{ fullName: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' }}]
      }).distinct('_id')
      console.log('Found user IDs:', userIds.length)
      query.$or = [
        { productId: { $in: productIds }},
        { userId: { $in: userIds }}
      ]
    }
    console.log('Final query:', JSON.stringify(query, null, 2))
    const options = {
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10),
      sort: { createdAt: -1 },
      populate: [
        { path: 'userId', select: 'fullName email' },
        { path: 'productId', select: 'name image' }
      ]
    }
    console.log('Pagination options:', options)
    console.log('Calling Review.paginate...')
    // Test simple find first
    const simpleReviews = await Review.find(query).limit(10).sort({ createdAt: -1 })
    console.log('Simple reviews found:', simpleReviews.length)
    if (simpleReviews.length > 0) {
      console.log('Sample review:', simpleReviews[0])
    }
    const reviews = await Review.paginate(query, options)
    console.log('Reviews found:', reviews.docs.length)
    console.log('Total docs:', reviews.totalDocs)
    res.status(200).json(
      new ApiResponse(200, {
        results: reviews.docs,
        meta: {
          total: reviews.totalDocs,
          page: reviews.page,
          limit: reviews.limit,
          pages: reviews.totalPages
        }
      }, 'Danh sách đánh giá')
    )
  } catch (error) {
    console.error('=== getAllReviews ERROR ===')
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    res.status(500).json(
      new ApiResponse(500, null, `Lỗi khi lấy danh sách đánh giá: ${error.message}`)
    )
  }
}

// Lấy đánh giá theo ID sản phẩm
export const getReviewsByProduct = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params
    if (!productId) {
      return res.status(200).json(
        new ApiResponse(200, {
          results: [],
          meta: { total: 0, page: 1, limit: 10, pages: 0 }
        }, 'Không có ID sản phẩm')
      )
    }
    
    const { page = 1, limit = 10 } = req.query as { page?: string, limit?: string }
    const pageNum = parseInt(page as string, 10) || 1
    const limitNum = parseInt(limit as string, 10) || 10
    
    // Tìm đánh giá đã approved
    let allReviews = await Review.find({
      productId,
      status: 'approved'
    }).sort({ createdAt: -1 }).lean()
    
    // Lấy thông tin user riêng và gắn vào review
    for (let i = 0; i < allReviews.length; i++) {
      try {
        const user = await UserModel.findById(allReviews[i].userId).select('fullName email avatar').lean()
        
        allReviews[i] = {
          ...allReviews[i],
          userId: {
            _id: allReviews[i].userId,
            fullName: user?.fullName || user?.email || 'Người dùng ẩn danh',
            avatar: user?.avatar || null
          }
        }
      } catch (error) {
        allReviews[i] = {
          ...allReviews[i],
          userId: {
            _id: allReviews[i].userId,
            fullName: 'Người dùng ẩn danh',
            avatar: null
          }
        }
      }
    }
    
    const startIndex = (pageNum - 1) * limitNum
    const endIndex = startIndex + limitNum
    const paginatedReviews = allReviews.slice(startIndex, endIndex)
    
    return res.status(200).json(
      new ApiResponse(200, {
        results: paginatedReviews,
        meta: {
          total: allReviews.length,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(allReviews.length / limitNum)
        }
      }, `Tìm thấy ${allReviews.length} đánh giá`)
    )
  } catch (error: any) {
    console.error('Error in getReviewsByProduct:', error.message)
    return res.status(200).json(
      new ApiResponse(200, {
        results: [],
        meta: { total: 0, page: 1, limit: 10, pages: 0 }
      }, 'Không tìm thấy đánh giá nào')
    )
  }
}

// Lấy đánh giá theo ID người dùng
export const getReviewsByUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params
    const { page = 1, limit = 10 } = req.query as { page?: string, limit?: string }
    const options = {
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10),
      sort: { createdAt: -1 },
      populate: { path: 'productId', select: 'name image' }
    }
    const reviews = await Review.paginate({ userId }, options)
    res.status(200).json(
      new ApiResponse(200, {
        results: reviews.docs,
        meta: {
          total: reviews.totalDocs,
          page: reviews.page,
          limit: reviews.limit,
          pages: reviews.totalPages
        }
      }, 'Danh sách đánh giá của người dùng')
    )
  } catch (error) {
    res.status(500).json(
      new ApiResponse(500, null, 'Lỗi khi lấy đánh giá của người dùng')
    )
  }
}

// Debug API để kiểm tra dữ liệu
export const debugReviewableProducts = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params
    const user = await UserModel.findById(userId)
    const allOrders = await OrderModel.find({ userId })
    const completedOrders = await OrderModel.find({ userId, status: 'completed' })
    const orderIds = completedOrders.map(order => order._id)
    const orderItems = await OrderItemModel.find({ orderId: { $in: orderIds } })
    const productIds = orderItems.map(item => item.productId)
    const products = await Product.find({ _id: { $in: productIds } })
    const reviews = await Review.find({ userId })
    res.status(200).json(
      new ApiResponse(200, {
        user: user ? { _id: user._id, fullName: user.fullName } : null,
        allOrdersCount: allOrders.length,
        completedOrdersCount: completedOrders.length,
        completedOrders: completedOrders.map(o => ({ _id: o._id, status: o.status, createdAt: o.createdAt })),
        orderItemsCount: orderItems.length,
        orderItems: orderItems.map(oi => ({ _id: oi._id, orderId: oi.orderId, productId: oi.productId })),
        productsCount: products.length,
        products: products.map(p => ({ _id: p._id, name: p.name })),
        reviewsCount: reviews.length,
        reviews: reviews.map(r => ({ _id: r._id, productId: r.productId, rating: r.rating }))
      }, 'Debug data')
    )
  } catch (error) {
    res.status(500).json(
      new ApiResponse(500, null, 'Lỗi debug: ' + error.message)
    )
  }
}

// Phê duyệt đánh giá
export const approveReview = async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params
    const existingReview = await Review.findById(reviewId)
    if (!existingReview) {
      throw new ApiError(404, 'Không tìm thấy đánh giá')
    }
    const hasBadWords = checkForBadWords(existingReview.comment)
    if (hasBadWords) {
      return res.status(400).json(
        new ApiResponse(400, null, 'Đánh giá chứa nội dung không phù hợp và không thể được phê duyệt')
      )
    }
    const review = await Review.findByIdAndUpdate(
      reviewId,
      { status: 'approved' },
      { new: true }
    )
    res.status(200).json(
      new ApiResponse(200, review, 'Đánh giá đã được phê duyệt')
    )
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json(
        new ApiResponse(error.statusCode, null, error.message)
      )
    } else {
      res.status(500).json(
        new ApiResponse(500, null, 'Lỗi khi phê duyệt đánh giá')
      )
    }
  }
}

// Từ chối đánh giá
export const rejectReview = async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params
    const { reason } = req.body
    if (!reason || reason.trim() === '') {
      throw new ApiError(400, 'Lý do từ chối là bắt buộc')
    }
    const review = await Review.findByIdAndUpdate(
      reviewId,
      { 
        status: 'rejected',
        rejectReason: reason.trim()
      },
      { new: true }
    )
    if (!review) {
      throw new ApiError(404, 'Không tìm thấy đánh giá')
    }
    res.status(200).json(
      new ApiResponse(200, review, 'Đánh giá đã được từ chối')
    )
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json(
        new ApiResponse(error.statusCode, null, error.message)
      )
    } else {
      res.status(500).json(
        new ApiResponse(500, null, 'Lỗi khi từ chối đánh giá')
      )
    }
  }
}

// Xóa đánh giá
export const deleteReview = async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params
    const review = await Review.findByIdAndDelete(reviewId)
    if (!review) {
      throw new ApiError(404, 'Không tìm thấy đánh giá')
    }
    res.status(200).json(
      new ApiResponse(200, null, 'Đánh giá đã được xóa thành công')
    )
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json(
        new ApiResponse(error.statusCode, null, error.message)
      )
    } else {
      res.status(500).json(
        new ApiResponse(500, null, 'Lỗi khi xóa đánh giá')
      )
    }
  }
}

// Lấy chi tiết đánh giá
export const getReviewDetail = async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params
    const review = await Review.findById(reviewId)
      .populate('userId', 'fullName email')
      .populate('productId', 'name image')
    if (!review) {
      throw new ApiError(404, 'Không tìm thấy đánh giá')
    }
    res.status(200).json(
      new ApiResponse(200, review, 'Chi tiết đánh giá')
    )
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json(
        new ApiResponse(error.statusCode, null, error.message)
      )
    } else {
      res.status(500).json(
        new ApiResponse(500, null, 'Lỗi khi lấy chi tiết đánh giá')
      )
    }
  }
}

// Lấy thống kê đánh giá
export const getReviewStats = async (req: Request, res: Response) => {
  try {
    const totalReviews = await Review.countDocuments()
    const pendingReviews = await Review.countDocuments({ status: 'pending' })
    const approvedReviews = await Review.countDocuments({ status: 'approved' })
    const rejectedReviews = await Review.countDocuments({ status: 'rejected' })
    const stats = {
      total: totalReviews,
      pending: pendingReviews,
      approved: approvedReviews,
      rejected: rejectedReviews
    }
    res.status(200).json(
      new ApiResponse(200, stats, 'Thống kê đánh giá')
    )
  } catch (error) {
    res.status(500).json(
      new ApiResponse(500, null, 'Lỗi khi lấy thống kê đánh giá')
    )
  }
}

// Kiểm tra số lần đánh giá của user cho sản phẩm
export const checkUserReviewCount = async (req: Request, res: Response) => {
  try {
    const { userId, productId } = req.params
    const reviewCount = await Review.countDocuments({
      userId,
      productId
    })
    const canReview = reviewCount < 2
    res.status(200).json(
      new ApiResponse(200, {
        count: reviewCount,
        canReview,
        maxReviews: 2
      }, 'Thông tin đánh giá của người dùng')
    )
  } catch (error) {
    res.status(500).json(
      new ApiResponse(500, null, 'Lỗi khi kiểm tra số lần đánh giá')
    )
  }
}

// API test để debug database
export const debugDatabase = async (req: Request, res: Response) => {
  try {
    const orders = await OrderModel.find({}).limit(5)
    const orderItems = await OrderItemModel.find({}).limit(5)
    const products = await Product.find({}).limit(5)
    const reviews = await Review.find({})
    console.log('=== DEBUG DATABASE ===')
    console.log('Total reviews found:', reviews.length)
    console.log('Reviews:', reviews.map(r => ({ 
      _id: r._id, 
      userId: r.userId, 
      productId: r.productId, 
      status: r.status,
      comment: r.comment,
      rating: r.rating,
      createdAt: r.createdAt
    })))
    
    res.status(200).json(
      new ApiResponse(200, {
        orders: orders.map(o => ({ _id: o._id, status: o.status, userId: o.userId })),
        orderItems: orderItems.map(oi => ({ _id: oi._id, orderId: oi.orderId, productId: oi.productId })),
        products: products.map(p => ({ _id: p._id, name: p.name })),
        reviews: reviews.map(r => ({ 
          _id: r._id, 
          userId: r.userId, 
          productId: r.productId, 
          status: r.status,
          comment: r.comment,
          rating: r.rating,
          createdAt: r.createdAt
        })),
        totalReviews: reviews.length
      }, 'Debug database')
    )
  } catch (error) {
    res.status(500).json(
      new ApiResponse(500, null, 'Lỗi khi debug database')
    )
  }
}

// Lấy sản phẩm từ đơn hàng cụ thể
export const getOrderProducts = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params
    const order = await OrderModel.findById(orderId)
    if (!order) {
      throw new ApiError(404, 'Không tìm thấy đơn hàng')
    }
    if (order.status !== 'completed') {
      return res.status(200).json(
        new ApiResponse(200, [], 'Đơn hàng chưa hoàn thành')
      )
    }
    
    const orderItems = await OrderItemModel.find({ orderId })
      .populate('productId', 'name image price')
    
    const products = orderItems.map(item => ({
      productId: item.productId._id,
      productName: item.productId.name,
      productImage: item.productId.image,
      productPrice: item.productId.price,
      quantity: item.quantity,
      orderId: item.orderId
    }))
    
    res.status(200).json(
      new ApiResponse(200, products, 'Danh sách sản phẩm trong đơn hàng')
    )
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json(
        new ApiResponse(error.statusCode, null, error.message)
      )
    } else {
      res.status(500).json(
        new ApiResponse(500, null, 'Lỗi khi lấy sản phẩm từ đơn hàng')
      )
    }
  }
}

// Debug API để kiểm tra user cụ thể
export const debugUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params
    
    const user = await UserModel.findById(userId)
    const userLean = await UserModel.findById(userId).lean()
    const userSelect = await UserModel.findById(userId).select('fullName avatar').lean()
    
    res.status(200).json(
      new ApiResponse(200, {
        userId,
        user: user ? { _id: user._id, fullName: user.fullName, email: user.email } : null,
        userLean,
        userSelect
      }, 'Debug user info')
    )
  } catch (error) {
    res.status(500).json(
      new ApiResponse(500, null, 'Lỗi debug user: ' + error.message)
    )
  }
}

export const checkProductReviewableFromOrder = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params
    const order = await OrderModel.findById(orderId)
    if (!order) {
      throw new ApiError(404, 'Không tìm thấy đơn hàng')
    }
    if (order.status !== 'completed') {
      return res.status(200).json(
        new ApiResponse(200, {
          reviewableProducts: [],
          debug: {
            orderId,
            orderStatus: order.status,
            message: 'Đơn hàng chưa hoàn thành'
          }
        }, 'Đơn hàng chưa hoàn thành')
      )
    }
    
    const orderItems = await OrderItemModel.find({ orderId })
      .populate('productId', 'name image')
    
    if (orderItems.length === 0) {
      return res.status(200).json(
        new ApiResponse(200, {
          reviewableProducts: [],
          debug: {
            orderId,
            message: 'Không có sản phẩm trong đơn hàng'
          }
        }, 'Không có sản phẩm trong đơn hàng')
      )
    }
    const reviewableProducts = await Promise.all(
      orderItems.map(async (item: any) => {
        const reviewCount = await Review.countDocuments({
          userId: order.userId,
          productId: item.productId?._id
        })
        return {
          productId: item.productId?._id?.toString() || '',
          productName: item.productId?.name || 'Unknown Product',
          productImage: item.productId?.image?.[0] || '',
          canReview: reviewCount < 2,
          reviewCount
        }
      })
    )
    res.status(200).json(
      new ApiResponse(200, {
        reviewableProducts,
        debug: {
          orderId,
          orderStatus: order.status,
          orderItemsCount: orderItems.length,
          userId: order.userId
        }
      }, 'Danh sách sản phẩm có thể đánh giá')
    )
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json(
        new ApiResponse(error.statusCode, null, error.message)
      )
    } else {
      res.status(500).json(
        new ApiResponse(500, null, 'Lỗi khi kiểm tra sản phẩm có thể đánh giá')
      )
    }
  }
}