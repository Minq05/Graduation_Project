import { StatusCodes } from 'http-status-codes'
import path from 'path'
import FileModel from '~/models/file.model'
import ApiError from '~/utils/ApiError'
import fs from 'fs'

const handleUploadFile = async (file: Express.Multer.File) => {
  const filePath = `/uploads/images/${file.filename}`

  const res = await FileModel.create({
    filename: file.filename,
    originalname: file.originalname,
    filePath: filePath,
    fileType: file.fieldname,
    fileSize: file.size,
    mimetype: file.mimetype
  })
  if (!res) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Có lỗi xảy ra trong quá trình lưu file')
  }

  return res
}

const handleFetchAllFiles = async () => {
  const files = await FileModel.find().sort({ createdAt: -1 })
  if (!files) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy file nào')
  }
  return {
    meta: {
      current: 1,
      pageSize: 10,
      pages: Math.ceil(files.length / 10),
      total: files.length
    },
    results: files
  }
}

const handleDeleteFile = async (fileId: string, filename: string) => {
  const filePath = path.join(__dirname, '../../public/uploads/images', filename)

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error('Lỗi khi xóa file:', err)
    } else {
      console.log('Đã xóa file thành công:', filename)
    }
  })

  const file = await FileModel.findByIdAndDelete(fileId)
  if (!file) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy file để xóa')
  }
  return file
}

export const fileService = {
  handleUploadFile,
  handleFetchAllFiles,
  handleDeleteFile
}
