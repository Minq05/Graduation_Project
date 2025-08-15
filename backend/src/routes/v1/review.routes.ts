import express from 'express'
import * as reviewController from '~/controllers/review.controller'
import { verifyToken } from '~/middlewares/verifyToken'
import { checkPermissions } from '~/middlewares/checkPermissions'
import { reviewValidation } from '~/validations/review.validation'

const Router = express.Router()

// Route cho người dùng
Router.route('/').post(verifyToken, reviewValidation.createReviewValidation, reviewController.createReview)
Router.route('/public').get(reviewController.getPublicReviews)
Router.route('/product/:productId').get(reviewController.getReviewsByProduct)
Router.route('/user/:userId').get(verifyToken, reviewController.getReviewsByUser)
Router.route('/user/:userId/reviewable').get(verifyToken, reviewController.getReviewableProducts)
Router.route('/user/:userId/debug').get(verifyToken, reviewController.debugReviewableProducts)
Router.route('/user/:userId/simple-test').get(verifyToken, reviewController.simpleTest)
Router.route('/order/:orderId/products').get(verifyToken, reviewController.getOrderProducts)
Router.route('/check/:userId/:productId').get(verifyToken, reviewController.checkUserReviewCount)
Router.route('/order/:orderId/reviewable').get(verifyToken, reviewController.checkProductReviewableFromOrder)
Router.route('/debug').get(reviewController.debugDatabase)
Router.route('/debug/user/:userId').get(reviewController.debugUser)



// Route cho admin
Router.route('/').get(verifyToken, checkPermissions(['admin']), reviewController.getAllReviews)
Router.route('/stats').get(verifyToken, checkPermissions(['admin']), reviewController.getReviewStats)
Router.route('/:reviewId').get(verifyToken, checkPermissions(['admin']), reviewController.getReviewDetail)
Router.route('/:reviewId/approve').patch(verifyToken, checkPermissions(['admin']), reviewController.approveReview)
Router.route('/:reviewId/reject').patch(verifyToken, checkPermissions(['admin']), reviewValidation.updateReviewStatusValidation, reviewController.rejectReview)
Router.route('/:reviewId').delete(verifyToken, checkPermissions(['admin']), reviewValidation.deleteReviewValidation, reviewController.deleteReview)

export const reviewRoute = Router