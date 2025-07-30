import express from 'express'
import { discountsController } from '~/controllers/discounts.controller'
import { discountsValidation } from '~/validations/discounts.validation'
const Router = express.Router()
Router.route('/')
  .post(discountsValidation.createDiscountsValidation, discountsController.createDiscounts)
  .get(discountsValidation.fetchAllDiscountsValidation, discountsController.fetchAllDiscounts)
Router.route('/apply')
  .post(discountsController.applyDiscount)

Router.route('/:discountsID')
  .get(discountsValidation.fetchDiscountsByIdValidation, discountsController.fetchDiscountsById)
  .patch(discountsValidation.updateDiscountsValidation, discountsController.updateDiscounts)
  .delete(discountsValidation.deleteDiscountsValidation, discountsController.deleteDiscounts)

export const discountsRoute = Router
