import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { cateblogService } from '~/services/blogcategory.service'
import ApiError from '~/utils/ApiError'
import sendApiResponse from '~/utils/response.message'

const createCateblog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await cateblogService.handleCreateCateblog(req.body)
    if (!result) {
      sendApiResponse(res, StatusCodes.BAD_REQUEST, {
        statusCode: StatusCodes.BAD_REQUEST,
        message: 'Có lỗi xảy ra trong quá trình tạo danh mục của bài viết!',
        error: {
          code: StatusCodes.BAD_REQUEST,
          details: 'Có lỗi xảy ra trong quá trình tạo danh mục của bài viết!'
        }
      })
    } else {
      sendApiResponse(res, StatusCodes.CREATED, {
        statusCode: StatusCodes.CREATED,
        message: 'Tạo danh mục của bài viết thành công!',
        data: result
      })
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình thực hiện!'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const fetchAllCateblog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { current, pageSize, qs } = req.query
    const parsedCurrentPage = typeof current === 'string' ? parseInt(current, 10) : 1
    const parsedLimit = typeof pageSize === 'string' ? parseInt(pageSize, 10) : 10
    const parsedQs =
      typeof qs === 'string'
        ? qs
        : Array.isArray(qs)
          ? qs.join(',')
          : typeof qs === 'object' && qs !== null
            ? JSON.stringify(qs)
            : ''
    const result = await cateblogService.handleFetchAllCateblog({
      currentPage: parsedCurrentPage,
      limit: parsedLimit,
      qs: parsedQs
    })
    if (!result) {
      sendApiResponse(res, StatusCodes.BAD_REQUEST, {
        statusCode: StatusCodes.BAD_REQUEST,
        message: 'Có lỗi xảy ra trong quá trình lấy danh sách danh mục của bài viết!',
        error: {
          code: StatusCodes.BAD_REQUEST,
          details: 'Có lỗi xảy ra trong quá trình lấy danh sách danh mục của bài viết!'
        }
      })
    } else {
      sendApiResponse(res, StatusCodes.OK, {
        statusCode: StatusCodes.OK,
        message: 'Lấy danh sách danh mục của bài viết thành công!',
        data: result
      })
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình thực hiện!'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const fetchInfoCateblog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cateblogId } = req.params
    const result = await cateblogService.handleFetchInfoCateblog(cateblogId)
    if (!result) {
      sendApiResponse(res, StatusCodes.BAD_REQUEST, {
        statusCode: StatusCodes.BAD_REQUEST,
        message: 'Có lỗi xảy ra trong quá trình lấy thông tin danh mục của bài viết!',
        error: {
          code: StatusCodes.BAD_REQUEST,
          details: 'Có lỗi xảy ra trong quá trình lấy thông tin danh mục của bài viết!'
        }
      })
    } else {
      sendApiResponse(res, StatusCodes.OK, {
        statusCode: StatusCodes.OK,
        message: 'Lấy thông tin danh mục của bài viết thành công!',
        data: result
      })
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình thực hiện!'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const updateCateblog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cateblogId } = req.params
    const result = await cateblogService.handleUpdateCateblog(cateblogId, req.body)
    if (!result) {
      sendApiResponse(res, StatusCodes.BAD_REQUEST, {
        statusCode: StatusCodes.BAD_REQUEST,
        message: 'Có lỗi xảy ra trong quá trình cập nhật danh mục của bài viết!',
        error: {
          code: StatusCodes.BAD_REQUEST,
          details: 'Có lỗi xảy ra trong quá trình cập nhật danh mục của bài viết!'
        }
      })
    } else {
      sendApiResponse(res, StatusCodes.OK, {
        statusCode: StatusCodes.OK,
        message: 'Cập nhật danh mục của bài viết thành công!',
        data: result
      })
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình thực hiện!'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const deleteCateblog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cateblogId } = req.params
    const result = await cateblogService.handleDeleteCateblog(cateblogId)
    if (!result) {
      sendApiResponse(res, StatusCodes.BAD_REQUEST, {
        statusCode: StatusCodes.BAD_REQUEST,
        message: 'Có lỗi xảy ra trong quá trình xóa danh mục của bài viết!',
        error: {
          code: StatusCodes.BAD_REQUEST,
          details: 'Có lỗi xảy ra trong quá trình xóa danh mục của bài viết!'
        }
      })
    } else {
      sendApiResponse(res, StatusCodes.OK, {
        statusCode: StatusCodes.OK,
        message: 'Xóa danh mục của bài viết thành công!',
        data: result
      })
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình thực hiện!'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

export const cateblogController = {
  createCateblog,
  fetchAllCateblog,
  fetchInfoCateblog,
  updateCateblog,
  deleteCateblog
}
