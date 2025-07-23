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

export const flashSaleRoute = Router
