import express from 'express'
import { vnpayController } from '~/controllers/vnpay.controller'

const Router = express.Router()

Router.post('/create-payment', vnpayController.createPayment)
Router.get('/return', vnpayController.vnpayReturn)
Router.get('/ipn', vnpayController.vnpayIPN)
Router.get('/test', (req, res) => res.json({ message: 'VNPAY route works!' }))

export const vnpayRoute = Router
