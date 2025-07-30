import express from 'express'
import { flashSaleItemController } from '~/controllers/flash_sale_item.controller'
import { createFlashSaleItemValidation } from '~/validations/flash_sale_item.validation'

const Router = express.Router()

Router.route('/')
  .post(createFlashSaleItemValidation, flashSaleItemController.createFlashSaleItem)
  .get(flashSaleItemController.fetchAllFlashSaleItems)

Router.route('/active')
  .get(flashSaleItemController.fetchActiveFlashSaleItems)

Router.route('/:itemId')
  .get(flashSaleItemController.fetchInfoFlashSaleItem)
  .patch(flashSaleItemController.updateFlashSaleItem)
  .delete(flashSaleItemController.deleteFlashSaleItem)

export const flashSaleItemRoute = Router
