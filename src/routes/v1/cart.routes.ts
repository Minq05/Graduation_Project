import express from 'express'
import { cartController } from '~/controllers/cart.controller'
import verifyAccessToken from '~/middlewares/verifyToken'
import { cartValidation } from '~/validations/cart.validation'

const Router = express.Router()

Router.route('/').post(verifyAccessToken, cartValidation.createCartValidation, cartController.createCart)

Router.route('/user/:userId').get(verifyAccessToken, cartController.fetchCartByUser)

Router.route('/:cartId')
  .get(verifyAccessToken, cartValidation.fetchInfoCartValidation, cartController.fetchInfoCart)
  .post(verifyAccessToken, cartValidation.addItemToCartValidation, cartController.addItemToCart)
  .patch(verifyAccessToken, cartValidation.updateCartValidation, cartController.updateCart)
  .delete(verifyAccessToken, cartValidation.clearCartValidation, cartController.clearCart)

Router.route('/:cartId/items/:itemId').delete(
  verifyAccessToken,
  cartValidation.deleteItemFromCartValidation,
  cartController.deleteItemFromCart
)

export const CartRoute = Router
