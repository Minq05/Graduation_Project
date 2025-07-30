import express from 'express'
import { wishlistController } from '~/controllers/wishlist.controller'
import { wishlistValidation } from '~/validations/wishlist.validation'
import verifyAccessToken from '~/middlewares/verifyToken'

const Router = express.Router()

Router.route('/')
  .post(verifyAccessToken, wishlistValidation.createWishlistValidation, wishlistController.createWishlist)
  .get(verifyAccessToken, wishlistValidation.fetchWishlistByUserValidation, wishlistController.fetchWishlistByUser)

Router.route('/product/:productId')
  .get(verifyAccessToken, wishlistValidation.checkWishlistValidation, wishlistController.checkWishlist)
  .delete(verifyAccessToken, wishlistValidation.checkWishlistValidation, wishlistController.deleteWishlistByProduct)

Router.route('/:wishlistId')
  .delete(verifyAccessToken, wishlistValidation.deleteWishlistValidation, wishlistController.deleteWishlist)

export const wishlistRoute = Router
