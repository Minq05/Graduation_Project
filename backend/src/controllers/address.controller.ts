import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { addressService } from '~/services/address.service'
import ApiError from '~/utils/ApiError'
import sendApiResponse from '~/utils/response.message'

const createAddressController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params
    const dataAddress = {
      ...req.body,
      userId: userId.trim()
    }
    const result = await addressService.handleCreateAddress(dataAddress)
    if (!result) {
      sendApiResponse(res, StatusCodes.BAD_REQUEST, {
        statusCode: StatusCodes.BAD_REQUEST,
        message: 'Có lỗi xảy ra trong quá trình tạo địa chỉ',
        error: {
          code: StatusCodes.BAD_REQUEST,
          details: 'Có lỗi xảy ra trong quá trình tạo địa chỉ'
        }
      })
    } else {
      sendApiResponse(res, StatusCodes.CREATED, {
        statusCode: StatusCodes.CREATED,
        message: 'Tạo địa chỉ thành công',
        data: result
      })
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình thực hiện'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const updateAddressController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, addressId } = req.params
    const dataAddress = {
      ...req.body,
      userId: userId.trim()
    }
    const result = await addressService.handleUpdateAddress(addressId, dataAddress)
    if (!result) {
      sendApiResponse(res, StatusCodes.BAD_REQUEST, {
        statusCode: StatusCodes.BAD_REQUEST,
        message: 'Có lỗi xảy ra trong quá trình cập nhật địa chỉ',
        error: {
          code: StatusCodes.BAD_REQUEST,
          details: 'Có lỗi xảy ra trong quá trình tạo địa chỉ'
        }
      })
    } else {
      sendApiResponse(res, StatusCodes.CREATED, {
        statusCode: StatusCodes.CREATED,
        message: 'Tạo địa chỉ thành công',
        data: result
      })
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình thực hiện'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const fetchAllAddressController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params
    const result = await addressService.handleFetchAllAddressesByUser(userId)
    if (!result) {
      sendApiResponse(res, StatusCodes.BAD_REQUEST, {
        statusCode: StatusCodes.BAD_REQUEST,
        message: 'Có lỗi xảy ra trong quá trình lấy địa chỉ',
        error: {
          code: StatusCodes.BAD_REQUEST,
          details: 'Có lỗi xảy ra trong quá trình lấy địa chỉ'
        }
      })
    } else {
      sendApiResponse(res, StatusCodes.CREATED, {
        statusCode: StatusCodes.CREATED,
        message: 'Lấy địa chỉ thành công',
        data: result
      })
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình thực hiện'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const fetchInfoAddressController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, addressId } = req.params
    const result = await addressService.handleFetchAddressesByUser(userId, addressId)
    if (!result) {
      sendApiResponse(res, StatusCodes.BAD_REQUEST, {
        statusCode: StatusCodes.BAD_REQUEST,
        message: 'Có lỗi xảy ra trong quá trình lấy địa chỉ',
        error: {
          code: StatusCodes.BAD_REQUEST,
          details: 'Có lỗi xảy ra trong quá trình lấy địa chỉ'
        }
      })
    } else {
      sendApiResponse(res, StatusCodes.CREATED, {
        statusCode: StatusCodes.CREATED,
        message: 'Lấy địa chỉ thành công',
        data: result
      })
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra trong quá trình thực hiện'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const deleteAddressController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, addressId } = req.params

    const result = await addressService.handleDeleteAddress(addressId, userId)

    sendApiResponse(res, StatusCodes.OK, {
      statusCode: StatusCodes.OK,
      message: 'Xóa địa chỉ thành công',
      data: result
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Có lỗi xảy ra khi xóa địa chỉ'
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

export const addressController = {
  createAddressController,
  updateAddressController,
  fetchAllAddressController,
  fetchInfoAddressController,
  deleteAddressController
}
