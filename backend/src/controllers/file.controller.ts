import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { fileService } from '~/services/file.service'
import ApiError from '~/utils/ApiError'
import sendApiResponse from '~/utils/response.message'

const uploadFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req?.file) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Không có file nào được upload')
    }
    const result = await fileService.handleUploadFile(req?.file)
    if (!result) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Có lỗi xảy ra trong quá trình upload file')
    }
    sendApiResponse(res, StatusCodes.OK, {
      statusCode: StatusCodes.OK,
      message: 'Upload file thành công',
      data: result
    })
  } catch (error) {
    const err = error as ErrorWithStatus
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình upload file'
    const statusCode = err.statusCode ?? StatusCodes.UNPROCESSABLE_ENTITY
    const customError = new ApiError(statusCode, errorMessage)
    next(customError)
  }
}

const fetchAllFiles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const files = await fileService.handleFetchAllFiles()
    if (!files) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy file nào')
    }
    sendApiResponse(res, StatusCodes.OK, {
      statusCode: StatusCodes.OK,
      message: 'Lấy danh sách file thành công',
      data: files
    })
  } catch (error) {
    const err = error as ErrorWithStatus
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình lấy danh sách file'
    const statusCode = err.statusCode ?? StatusCodes.UNPROCESSABLE_ENTITY
    const customError = new ApiError(statusCode, errorMessage)
    next(customError)
  }
}

const deleteFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fileId } = req.params
    const { filename } = req.body

    if (!fileId || !filename) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Thiếu thông tin file để xóa')
    }

    const result = await fileService.handleDeleteFile(fileId, filename)
    if (!result) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy file để xóa')
    }

    sendApiResponse(res, StatusCodes.OK, {
      statusCode: StatusCodes.OK,
      message: 'Xóa file thành công',
      data: result
    })
  } catch (error) {
    const err = error as ErrorWithStatus
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình xóa file'
    const statusCode = err.statusCode ?? StatusCodes.UNPROCESSABLE_ENTITY
    const customError = new ApiError(statusCode, errorMessage)
    next(customError)
  }
}

export const fileController = {
  uploadFile,
  fetchAllFiles,
  deleteFile
}
