import express from 'express'
import upload from '~/config/multer'
import { fileController } from '~/controllers/file.controller'
import verifyAccessToken from '~/middlewares/verifyToken'

const Router = express.Router()

Router.route('/upload').post(verifyAccessToken, upload.single('image'), fileController.uploadFile)
Router.route('/').get(verifyAccessToken, fileController.fetchAllFiles)
Router.route('/:fileId').delete(verifyAccessToken, fileController.deleteFile)

export const fileRoute = Router
