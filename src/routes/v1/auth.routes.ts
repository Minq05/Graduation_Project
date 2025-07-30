import express from 'express'
import { authController } from '~/controllers/auth.controller'
import verifyAccessToken from '~/middlewares/verifyToken'
import { authValidation } from '~/validations/auth.validation'

const Router = express.Router()

Router.route('/signup').post(authValidation.signupValidation, authController.signup)
Router.route('/verify-email').post(authValidation.verifyValidation, authController.verifyEmail)
Router.route('/resend-code').post(authValidation.reSendCodeValidation, authController.reSendCode)
Router.route('/signin').post(authValidation.signinValidation, authController.signin)
Router.route('/signout').post(verifyAccessToken, authController.signout)
Router.route('/refresh-token').get(authController.refreshToken)
Router.route('/account').get(verifyAccessToken, authController.account)
Router.route('/forgot-password').post(authValidation.forgotPasswordValidation, authController.forgotPassword)
Router.route('/verify-forgot-password-code').post(
  authValidation.verifyValidation,
  authController.verifyForgotPasswordCode
)
Router.route('/reset-password').post(authValidation.resetPasswordValidation, authController.resetPassword)
Router.route('/change-password').post(
  verifyAccessToken,
  authValidation.changePasswordValidation,
  authController.changePassword
)

export const authRoute = Router
