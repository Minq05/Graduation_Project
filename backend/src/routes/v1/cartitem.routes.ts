import express from 'express'
import { CartItemController } from '~/controllers/cartiem.controller'
import { cartItemValidation } from '~/validations/cartitem.validation'

const Router = express.Router()

Router.route('/')
  .post(cartItemValidation.createCartItemValidation, CartItemController.createCartItem)
  .get(cartItemValidation.fetchAllCartItemsValidation, CartItemController.fetchAllCartItem)

Router.route('/:CartItemId')
  .get(cartItemValidation.fetchInfoCartItemValidation, CartItemController.fetchInfoCartItem)
  .patch(cartItemValidation.updateCartItemValidation, CartItemController.updateCartItem)
  .delete(cartItemValidation.deleteCartItemValidation, CartItemController.deleteCartItem)

export const CartItemRoute = Router
