import express from 'express'
import { notificationController } from '~/controllers/notification.controller'
import verifyAccessToken from '~/middlewares/verifyToken'
import { notificationValidation } from '~/validations/notification.validation'

const Router = express.Router()

Router.route('/')
  .post(
    verifyAccessToken,
    notificationValidation.createNotificationValidation,
    notificationController.createNotification
  )
  .get(
    verifyAccessToken,
    notificationValidation.fetchAllNotificationsValidation,
    notificationController.fetchAllNotifications
  )

Router.route('/:notificationId')
  .get(
    verifyAccessToken,
    notificationValidation.fetchNotificationByIdValidation,
    notificationController.fetchNotificationById
  )
  .delete(
    verifyAccessToken,
    notificationValidation.deleteNotificationValidation,
    notificationController.deleteNotification
  )
  .patch(
    verifyAccessToken,
     notificationController.updateNotification)


export const notificationRoute = Router
