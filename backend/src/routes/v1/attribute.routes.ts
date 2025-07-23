import express from 'express'
import { attributeController } from '~/controllers/attribute.controller'
import { attributeValidation } from '~/validations/attribute.validation'

const Router = express.Router()

Router.route('/')
  .post(attributeValidation.createAttributeValidation, attributeController.createAttribute)
  .get(attributeValidation.fetchAllAttributesValidation, attributeController.fetchAllAttributes)

Router.route('/:attributeId')
  .get(attributeValidation.fetchInfoAttributeValidation, attributeController.fetchInfoAttribute)
  .patch(attributeValidation.updateAttributeValidation, attributeController.updateAttribute)
  .delete(attributeValidation.deleteAttributeValidation, attributeController.deleteAttribute)

export const attributeRoute = Router
