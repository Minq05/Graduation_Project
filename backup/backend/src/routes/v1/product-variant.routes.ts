import express from 'express'
import { productVariantController } from '~/controllers/product-variant.controller'
import { productVariantValidation } from '~/validations/product-variant.validation'

const Router = express.Router()

Router.route('/')
  .post(productVariantValidation.createProductVariantValidation, productVariantController.createProductVariant)
  .get(productVariantValidation.fetchAllProductVariantValidation, productVariantController.fetchAllProductVariants)

Router.route('/:variantId')
  .get(productVariantValidation.fetchInfoProductVariantValidation, productVariantController.fetchInfoProductVariant)
  .patch(productVariantValidation.updateProductVariantValidation, productVariantController.updateProductVariant)
  .delete(productVariantValidation.deleteProductVariantValidation, productVariantController.deleteProductVariant)

export const productVariantRoute = Router
