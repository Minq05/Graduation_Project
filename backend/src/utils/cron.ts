import cron from 'node-cron'
import { createLogger } from '~/config/logger'
import { flashSaleCronService } from '~/services/flash_sale_cron.service'

// Tạo logger cho module này
const logger = createLogger(__filename)

/**
 * Khởi tạo các tác vụ cron cho flash sale
 */
export const initFlashSaleCronJobs = () => {
  // Tác vụ kiểm tra và cập nhật trạng thái flash sale (chạy mỗi phút)
  cron.schedule('* * * * *', async () => {
    try {
      await flashSaleCronService.checkAndUpdateFlashSaleStatus()
    } catch (error) {
      logger.error('Lỗi khi xử lý cron job flash sale:', error)
    }
  })

  // Tác vụ tạo báo cáo hàng ngày (chạy mỗi ngày lúc 00:00)
  cron.schedule('0 0 * * *', async () => {
    try {
      await flashSaleCronService.generateDailyReport()
    } catch (error) {
      logger.error('Lỗi khi tạo báo cáo hàng ngày về flash sale:', error)
    }
  })

  logger.info('Đã khởi tạo các tác vụ cron cho flash sale')
}