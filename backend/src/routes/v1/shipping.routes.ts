import express from 'express'
import { shippingController } from '~/controllers/shipping.controller'
import verifyToken from '~/middlewares/verifyToken'

const router = express.Router()

// Protected routes for shipping management
router.use(verifyToken)
router.patch('/status/:orderId', shippingController.updateShippingStatus)

export const shippingRoute = router