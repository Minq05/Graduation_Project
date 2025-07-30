import express from 'express'
import { ghnController } from '~/controllers/ghn.controller'
import verifyToken from '~/middlewares/verifyToken'
import validateRequest from '~/middlewares/validateRequest'
import { availableServicesSchema, shippingFeeSchema } from '~/validations/ghn.validation'

const router = express.Router()

// Public routes for address data
router.get('/provinces', ghnController.getProvinces)
router.get('/districts/:provinceId', ghnController.getDistricts)
router.get('/wards/:districtId', ghnController.getWards)
router.get('/available-services', validateRequest(availableServicesSchema, 'query'), ghnController.getAvailableServices)
router.post('/shipping-fee', validateRequest(shippingFeeSchema), ghnController.calculateShippingFee)

// Protected routes for order management
router.use(verifyToken)
router.post('/create-order/:orderId', ghnController.createShippingOrder)
router.get('/order-status/:orderId', ghnController.getShippingOrderStatus)
router.post('/cancel-order/:orderId', ghnController.cancelShippingOrder)

export default router
