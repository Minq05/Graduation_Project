import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { Request } from 'express'

const uploadDir = path.join(__dirname, '../../public/uploads/images')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req: Request, file, cb) => {
    cb(null, uploadDir)
  },

  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + file.originalname
    cb(null, uniqueSuffix)
  }
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fileFilter = (req: Request, file: Express.Multer.File, cb: any) => {
  if (/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Chỉ cho phép upload file ảnh (jpeg, png, webp, gif).'), false)
  }
}

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter
})

export default upload
