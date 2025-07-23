import express from 'express'
import { productController } from '~/controllers/product.controller'
import { productValidation } from '~/validations/product.validation'

const Router = express.Router()

Router.route('/')
  .post(productValidation.createProductValidation, productController.createProduct)
  .get(productValidation.fetchAllProductValidation, productController.fetchAllProducts)

Router.route('/:productId')
  .get(productValidation.fetchInfoProductValidation, productController.fetchInfoProduct)
  .patch(productValidation.updateProductValidation, productController.updateProduct)
  .delete(productValidation.deleteProductValidation, productController.deleteProduct)

export const productRoute = Router
