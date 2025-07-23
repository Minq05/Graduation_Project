import { createLogger } from '~/config/logger'
import FlashSaleModel from '~/models/flash_sale.model'
import FlashSaleItemModel from '~/models/flash_sale_item.model'
import ProductModel from '~/models/product.model'
import dayjs from 'dayjs'

// Tạo logger cho module này
const logger = createLogger(__filename)

/**
 * Service xử lý các tác vụ liên quan đến flash sale và cron
 */
export const flashSaleCronService = {
  /**
   * Xử lý khi flash sale bắt đầu
   */
  handleFlashSaleStart: async (flashSaleId: string) => {
    try {
      const flashSale = await FlashSaleModel.findById(flashSaleId).lean()
      if (!flashSale) {
        logger.error(`Không tìm thấy flash sale với ID: ${flashSaleId}`)
        return
      }

      logger.info(`Đang xử lý flash sale bắt đầu: ${flashSale.name}`)
      
      // Lấy tất cả các sản phẩm trong flash sale
      const flashSaleItems = await FlashSaleItemModel.find({ flashSaleId }).lean()
      
      // Cập nhật trạng thái sản phẩm (ví dụ: đánh dấu là đang trong flash sale)
      for (const item of flashSaleItems) {
        await ProductModel.findByIdAndUpdate(item.productId, {
          $set: {
            isInFlashSale: true,
            flashSaleId: flashSaleId,
            flashSalePrice: item.flashSalePrice,
            flashSaleQuantity: item.quantity,
            flashSaleStartDate: flashSale.startDate,
            flashSaleEndDate: flashSale.endDate
          }
        })
      }
      
      logger.info(`Đã cập nhật ${flashSaleItems.length} sản phẩm cho flash sale: ${flashSale.name}`)
      
      // Thêm logic khác nếu cần (ví dụ: gửi thông báo, cập nhật cache)
    } catch (error) {
      logger.error('Lỗi khi xử lý flash sale bắt đầu:', error)
    }
  },

  /**
   * Xử lý khi flash sale kết thúc
   */
  handleFlashSaleEnd: async (flashSaleId: string) => {
    try {
      const flashSale = await FlashSaleModel.findById(flashSaleId).lean()
      if (!flashSale) {
        logger.error(`Không tìm thấy flash sale với ID: ${flashSaleId}`)
        return
      }

      logger.info(`Đang xử lý flash sale kết thúc: ${flashSale.name}`)
      
      // Lấy tất cả các sản phẩm trong flash sale
      const flashSaleItems = await FlashSaleItemModel.find({ flashSaleId }).lean()
      
      // Cập nhật trạng thái sản phẩm (đánh dấu không còn trong flash sale)
      for (const item of flashSaleItems) {
        await ProductModel.findByIdAndUpdate(item.productId, {
          $unset: {
            isInFlashSale: "",
            flashSaleId: "",
            flashSalePrice: "",
            flashSaleQuantity: "",
            flashSaleStartDate: "",
            flashSaleEndDate: ""
          }
        })
      }
      
      logger.info(`Đã cập nhật ${flashSaleItems.length} sản phẩm sau khi flash sale kết thúc: ${flashSale.name}`)
      
      // Thêm logic khác nếu cần (ví dụ: gửi thông báo, cập nhật thống kê)
    } catch (error) {
      logger.error('Lỗi khi xử lý flash sale kết thúc:', error)
    }
  },

  /**
   * Kiểm tra và cập nhật trạng thái của tất cả flash sale
   */
  checkAndUpdateFlashSaleStatus: async () => {
    try {
      const now = new Date()
      
      // Tìm các flash sale vừa bắt đầu (trong vòng 1 phút trước)
      const justStartedFlashSales = await FlashSaleModel.find({
        startDate: {
          $lte: now,
          $gte: new Date(now.getTime() - 60 * 1000)
        }
      }).lean()
      
      // Xử lý các flash sale vừa bắt đầu
      for (const flashSale of justStartedFlashSales) {
        await flashSaleCronService.handleFlashSaleStart(flashSale._id.toString())
      }
      
      // Tìm các flash sale vừa kết thúc (trong vòng 1 phút trước)
      const justEndedFlashSales = await FlashSaleModel.find({
        endDate: {
          $lte: now,
          $gte: new Date(now.getTime() - 60 * 1000)
        }
      }).lean()
      
      // Xử lý các flash sale vừa kết thúc
      for (const flashSale of justEndedFlashSales) {
        await flashSaleCronService.handleFlashSaleEnd(flashSale._id.toString())
      }
      
      // Tạo báo cáo tổng hợp nếu cần
      if (justStartedFlashSales.length > 0 || justEndedFlashSales.length > 0) {
        logger.info(`Báo cáo cập nhật flash sale: ${justStartedFlashSales.length} bắt đầu, ${justEndedFlashSales.length} kết thúc`)
      }
    } catch (error) {
      logger.error('Lỗi khi kiểm tra và cập nhật trạng thái flash sale:', error)
    }
  },

  /**
   * Tạo báo cáo hàng ngày về flash sale
   */
  generateDailyReport: async () => {
    try {
      const today = dayjs().startOf('day')
      const tomorrow = dayjs().add(1, 'day').startOf('day')
      
      // Tìm các flash sale đang diễn ra
      const activeFlashSales = await FlashSaleModel.find({
        startDate: { $lte: tomorrow.toDate() },
        endDate: { $gte: today.toDate() }
      }).lean()
      
      // Tìm các flash sale sắp diễn ra trong 24h tới
      const upcomingFlashSales = await FlashSaleModel.find({
        startDate: {
          $gte: today.toDate(),
          $lte: tomorrow.toDate()
        }
      }).lean()
      
      // Tìm các flash sale đã kết thúc trong 24h qua
      const endedFlashSales = await FlashSaleModel.find({
        endDate: {
          $gte: today.toDate(),
          $lte: tomorrow.toDate()
        }
      }).lean()
      
      logger.info(`Báo cáo flash sale hàng ngày: ${activeFlashSales.length} đang diễn ra, ${upcomingFlashSales.length} sắp diễn ra, ${endedFlashSales.length} đã kết thúc`)
      
      // Thêm logic lưu báo cáo hoặc gửi email nếu cần
    } catch (error) {
      logger.error('Lỗi khi tạo báo cáo hàng ngày về flash sale:', error)
    }
  }
}