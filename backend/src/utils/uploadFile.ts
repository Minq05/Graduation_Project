import multer, { FileFilterCallback } from 'multer'
import path from 'path'
import { Request } from 'express'

export const uploadFile = () => {
  const storage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, 'public/uploads/images/')
      } else if (file.mimetype.startsWith('audio/')) {
        cb(null, 'public/uploads/audios/')
      }
    },
    filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
      cb(null, uniqueSuffix + '-' + file.originalname)
    }
  })

  // Hàm lọc file để xác định file nào là hình ảnh hoặc video
  const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const fileTypes = /jpeg|jpg|png|webp|gif|mov|mp3|wav|ogg|mpeg|m4a|mp4/
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = fileTypes.test(file.mimetype)

    if (extname && mimetype) {
      cb(null, true)
    } else {
      cb(new Error('Chỉ hỗ trợ định dạng hình ảnh và audio!'))
    }
  }

  // Tạo multer với cấu hình storage và fileFilter
  return multer({
    storage: storage,
    fileFilter: fileFilter
  }).fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'audioFile', maxCount: 1 }
  ])
}

export const uploadMultipleFile = () => {
  const storage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, 'public/uploads/images/')
      } else if (file.mimetype.startsWith('audio/')) {
        cb(null, 'public/uploads/audios/')
      }
    },
    filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
      cb(null, uniqueSuffix + '-' + file.originalname)
    }
  })

  // Hàm lọc file để xác định file nào là hình ảnh hoặc video
  const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const fileTypes = /jpeg|jpg|png|webp|gif|mov|mp3|wav|ogg|mpeg|m4a/
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = fileTypes.test(file.mimetype)

    if (extname && mimetype) {
      cb(null, true)
    } else {
      cb(new Error('Chỉ hỗ trợ định dạng hình ảnh và audio!'))
    }
  }

  // Tạo multer với cấu hình storage và fileFilter
  return multer({
    storage: storage,
    fileFilter: fileFilter
  }).fields([
    { name: 'thumbnail', maxCount: 10 },
    { name: 'audioFile', maxCount: 10 }
  ])
}
