import express from 'express'
import { contactController } from '~/controllers/contact.controller'
import { contactValidation } from '~/validations/contact.validation'

const Router = express.Router()

Router.route('/')
  .post(contactValidation.createContactValidation, contactController.createContact)
  .get(contactValidation.fetchAllContactValidation, contactController.fetchAllContact)

Router.route('/:contactId')
  .get(contactValidation.fetchInfoContactValidation, contactController.fetchInfoContact)
  .patch(contactValidation.updateContactValidation, contactController.updateContact)
  .delete(contactValidation.deleteContactValidation, contactController.deleteContact)

export const contactRoute = Router
