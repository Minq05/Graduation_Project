import express from 'express'
import { orderController } from '~/controllers/order.controller'
import verifyAccessToken from '~/middlewares/verifyToken'
import { orderValidation } from '~/validations/order.validation'

const Router = express.Router()

Router.route('/')
  .post(verifyAccessToken, orderValidation.createOrderValidation, orderController.createOrder)
  .get(verifyAccessToken, orderController.fetchAllOrdersForAdmin)

Router.route('/:orderId').get(
  verifyAccessToken,
  orderValidation.fetchOrderInfoValidation,
  orderController.fetchOrderInfo
)

Router.route('/:orderId/cancel').patch(
  verifyAccessToken,
  orderValidation.cancelOrderValidation,
  orderController.cancelOrder
)

Router.route('/:orderId/status').patch(
  verifyAccessToken,
  orderValidation.updateStatusOrderValidation,
  orderController.updateStatusOrder
)

Router.route('/:orderId/items').get(
  verifyAccessToken,
  orderValidation.fetchItemOfOrderValidation,
  orderController.fetchItemOfOrder
)

Router.route('/by-user/:userId').get(
  verifyAccessToken,
  orderValidation.fetchAllOrdersValidation,
  orderController.fetchAllOrders
)

export const orderRoute = Router
