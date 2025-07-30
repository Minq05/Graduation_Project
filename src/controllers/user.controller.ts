import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { userService } from '~/services/user.service'
import ApiError from '~/utils/ApiError'
import sendApiResponse from '~/utils/response.message'

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await userService.handleCreateUser(req.body)
    if (!result) {
      sendApiResponse(res, StatusCodes.BAD_REQUEST, {
        statusCode: StatusCodes.BAD_REQUEST,
        message: 'Có lỗi xảy ra trong quá trình tạo người dùng',
        error: {
          code: StatusCodes.BAD_REQUEST,
          details: 'Có lỗi xảy ra trong quá trình tạo người dùng'
        }
      })
    } else {
      sendApiResponse(res, StatusCodes.CREATED, {
        statusCode: StatusCodes.CREATED,
        message: 'Tạo người dùng thành công',
        data: result
      })
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình thực hiện'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const fetchAllUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { current = '1', pageSize = '10', ...restQuery } = req.query

    const parsedCurrentPage = parseInt(current as string, 10)
    const parsedLimit = parseInt(pageSize as string, 10)

    // convert restQuery to qs string
    const queryString = new URLSearchParams(restQuery as Record<string, string>).toString()

    const result = await userService.handleFetchAllUser({
      currentPage: parsedCurrentPage,
      limit: parsedLimit,
      qs: queryString
    })
    if (!result) {
      sendApiResponse(res, StatusCodes.BAD_REQUEST, {
        statusCode: StatusCodes.BAD_REQUEST,
        message: 'Có lỗi xảy ra trong quá trình lấy danh sách người dùng',
        error: {
          code: StatusCodes.BAD_REQUEST,
          details: 'Có lỗi xảy ra trong quá trình lấy danh sách người dùng'
        }
      })
    } else {
      sendApiResponse(res, StatusCodes.OK, {
        statusCode: StatusCodes.OK,
        message: 'Lấy danh sách người dùng thành công',
        data: result
      })
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình thực hiện'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const fetchInfoUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params
    const result = await userService.handleFetchInfoUser(userId)
    if (!result) {
      sendApiResponse(res, StatusCodes.BAD_REQUEST, {
        statusCode: StatusCodes.BAD_REQUEST,
        message: 'Có lỗi xảy ra trong quá trình lấy thông tin người dùng',
        error: {
          code: StatusCodes.BAD_REQUEST,
          details: 'Có lỗi xảy ra trong quá trình lấy thông tin người dùng'
        }
      })
    } else {
      sendApiResponse(res, StatusCodes.OK, {
        statusCode: StatusCodes.OK,
        message: 'Lấy thông tin người dùng thành công',
        data: result
      })
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình thực hiện'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params
    const result = await userService.handleUpdateUser(userId, req.body)
    if (!result) {
      sendApiResponse(res, StatusCodes.BAD_REQUEST, {
        statusCode: StatusCodes.BAD_REQUEST,
        message: 'Có lỗi xảy ra trong quá trình cập nhật người dùng',
        error: {
          code: StatusCodes.BAD_REQUEST,
          details: 'Có lỗi xảy ra trong quá trình cập nhật người dùng'
        }
      })
    } else {
      sendApiResponse(res, StatusCodes.OK, {
        statusCode: StatusCodes.OK,
        message: 'Cập nhật người dùng thành công',
        data: result
      })
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình thực hiện'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params
    const result = await userService.handleDeleteUser(userId)
    if (!result) {
      sendApiResponse(res, StatusCodes.BAD_REQUEST, {
        statusCode: StatusCodes.BAD_REQUEST,
        message: 'Có lỗi xảy ra trong quá trình xóa người dùng',
        error: {
          code: StatusCodes.BAD_REQUEST,
          details: 'Có lỗi xảy ra trong quá trình xóa người dùng'
        }
      })
    } else {
      sendApiResponse(res, StatusCodes.OK, {
        statusCode: StatusCodes.OK,
        message: 'Xóa người dùng thành công',
        data: result
      })
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình thực hiện'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

export const userController = {
  createUser,
  fetchAllUser,
  fetchInfoUser,
  updateUser,
  deleteUser
}
