import express from 'express'
import { brandController } from '~/controllers/brand.controller'
import { brandValidation } from '~/validations/brand.validation'
const Router = express.Router()
Router.route('/')
  .post(brandValidation.createBrandValidation, brandController.createBrand)
  .get(brandValidation.fetchAllBrandValidation, brandController.fetchAllBrand)
Router.route('/all')
  .get(brandController.getAllBrands)
Router.route('/:brandID')
  .get(brandValidation.fetchBrandByIdValidation, brandController.fetchBrandById)
  .patch(brandValidation.updateBrandValidation, brandController.updateBrand)
  .delete(brandValidation.deleteBrandValidation, brandController.deleteBrand)

export const brandRoute = Router
