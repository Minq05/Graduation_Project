import express from 'express'
import { cateblogController } from '~/controllers/blogcategory.controller'
import { cateblogValidation } from '~/validations/blogcategory.validation'

const Router = express.Router()

Router.route('/')
  .post(cateblogValidation.createCateblogValidation, cateblogController.createCateblog)
  .get(cateblogValidation.fetchAllCateblogValidation, cateblogController.fetchAllCateblog)

Router.route('/:cateblogId')
  .get(cateblogValidation.fetchInfoCateblogValidation, cateblogController.fetchInfoCateblog)
  .patch(cateblogValidation.updateCateblogValidation, cateblogController.updateCateblog)
  .delete(cateblogValidation.deleteCateblogValidation, cateblogController.deleteCateblog)

export const cateblogRoute = Router
