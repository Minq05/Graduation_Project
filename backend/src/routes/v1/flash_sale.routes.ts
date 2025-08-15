import express from 'express'
import { flashSaleController } from '~/controllers/flash_sale.controller'

const Router = express.Router()

Router.route('/').post(flashSaleController.createFlashSale).get(flashSaleController.fetchAllFlashSales)

Router.route('/:flashSaleId')
  .get(flashSaleController.fetchInfoFlashSale)
  .patch(flashSaleController.updateFlashSale)
  .delete(flashSaleController.deleteFlashSale)

// Thêm routes để kích hoạt/hủy kích hoạt flash sale
Router.route('/:flashSaleId/activate').post(flashSaleController.activateFlashSale)
Router.route('/:flashSaleId/deactivate').post(flashSaleController.deactivateFlashSale)

// Route để lấy sản phẩm Flash Sale đang hoạt động
Router.route('/active-products').get(flashSaleController.getActiveFlashSaleProducts)

// Route để kiểm tra giới hạn flash sale
Router.route('/check-limit').post(flashSaleController.checkFlashSaleLimit)

export const flashSaleRoute = Router
