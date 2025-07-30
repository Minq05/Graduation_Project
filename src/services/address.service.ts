import { StatusCodes } from 'http-status-codes'
import AddressModel from '~/models/address.model'
import ApiError from '~/utils/ApiError'

interface IAddress {
  userId: string
  province?: string
  district?: string
  ward?: string
  address?: string
  isPrimary?: boolean
}

const handleCreateAddress = async (data: IAddress) => {
  if (data.isPrimary) {
    await AddressModel.updateMany({ userId: data.userId, isPrimary: true }, { $set: { isPrimary: false } })
  }

  const res = await AddressModel.create({ ...data })
  if (!res) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Có lỗi xảy ra trong quá trình tạo địa chỉ')
  }
  return res
}

const handleUpdateAddress = async (id: string, data: IAddress) => {
  if (data.isPrimary) {
    await AddressModel.updateMany(
      { userId: data.userId, _id: { $ne: id }, isPrimary: true },
      { $set: { isPrimary: false } }
    )
  }


  const res = await AddressModel.updateOne({ _id: id }, { $set: { ...data } }, { runValidators: true })
  if (!res) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Có lỗi xảy ra trong quá trình cập nhật địa chỉ')
  }
  return res
}

const handleFetchAllAddressesByUser = async (userId: string) => {
  const res = await AddressModel.find({ userId })
  if (!res) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy địa chỉ nào')
  }
  return res
}

const handleFetchAddressesByUser = async (userId: string, addressId: string) => {
  const res = await AddressModel.find({ userId, _id: addressId })
  if (!res) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy địa chỉ nào')
  }
  return res
}


const handleDeleteAddress = async (addressId: string, userId: string) => {
  const result = await AddressModel.findOneAndDelete({ _id: addressId, userId })

  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy địa chỉ để xóa')
  }

  return result
}

export const addressService = {
  handleCreateAddress,
  handleUpdateAddress,
  handleFetchAllAddressesByUser,
  handleFetchAddressesByUser,
  handleDeleteAddress
}
