import express from 'express'
import { shippingController } from '~/controllers/shipping.controller'
import { shippingValidation } from '~/validations/shipping.validation'
import validateRequest from '~/middlewares/validateRequest'

const Router = express.Router()

// Tính phí vận chuyển
Router.post('/calculate', validateRequest(shippingValidation.calculateShippingFee), shippingController.calculateShippingFee)

// Lấy danh sách phương thức vận chuyển
Router.get('/methods', shippingController.getShippingMethods)

export const shippingRoute = Router
