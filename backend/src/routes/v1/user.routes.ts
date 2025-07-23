import express from 'express'
import { addressController } from '~/controllers/address.controller'
import { userController } from '~/controllers/user.controller'
import verifyAccessToken from '~/middlewares/verifyToken'
import { addressValidation } from '~/validations/address.validation'
import { userValidation } from '~/validations/user.validation'

const Router = express.Router()

Router.route('/')
  .post(verifyAccessToken, userValidation.createUserValidation, userController.createUser)
  .get(verifyAccessToken, userValidation.fetchAllUserValidation, userController.fetchAllUser)

Router.route('/:userId')
  .get(verifyAccessToken, userValidation.fetchInfoUserValidation, userController.fetchInfoUser)
  .patch(verifyAccessToken, userValidation.updateUserValidation, userController.updateUser)
  .delete(verifyAccessToken, userValidation.deleteUserValidation, userController.deleteUser)

Router.route('/:userId/addresses')
  .post(verifyAccessToken, addressValidation.createAddressValidation, addressController.createAddressController)
  .get(verifyAccessToken, addressController.fetchAllAddressController)

Router.route('/:userId/addresses/:addressId')
  .patch(verifyAccessToken, addressValidation.updateAddressValidation, addressController.updateAddressController)
  .get(verifyAccessToken, addressController.fetchInfoAddressController)
  .delete(verifyAccessToken, addressController.deleteAddressController)

export const userRoute = Router
