import express from 'express'
import { variantAttributesController } from '~/controllers/variantAttribute.controller'
import { variantAttributeValidation } from '~/validations/variantAttribute.validation'

const Router = express.Router()

Router.route('/')
  .post(variantAttributeValidation.createVariantAttributeValidation, variantAttributesController.createVariantAttribute)
  .get(
    variantAttributeValidation.fetchAllVariantAttributesValidation,
    variantAttributesController.fetchAllVariantAttributes
  )

Router.route('/:variantAttributeId')
  .get(
    variantAttributeValidation.fetchInfoVariantAttributeValidation,
    variantAttributesController.fetchInfoVariantAttribute
  )
  .patch(
    variantAttributeValidation.updateVariantAttributeValidation,
    variantAttributesController.updateVariantAttribute
  )
  .delete(
    variantAttributeValidation.deleteVariantAttributeValidation,
    variantAttributesController.deleteVariantAttribute
  )

export const variantAttributesRoute = Router
