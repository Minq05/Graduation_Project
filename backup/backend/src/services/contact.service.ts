/* eslint-disable @typescript-eslint/no-explicit-any */
import ContactModel, { IContact } from '~/models/contact.model'
import aqp from 'api-query-params'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

const handleCreateContact = async (data: IContact) => {
  const result = await ContactModel.create({ ...data })
  return result
}

const handleFetchAllContact = async ({
  currentPage,
  limit,
  qs = ''
}: {
  currentPage: number
  limit: number
  qs?: string // hoặc giữ nguyên string và gán default
}) => {
  const { filter, sort, population } = aqp(qs || '') // ✅ đảm bảo qs là chuỗi
  delete filter.current
  delete filter.pageSize

  const offset = (currentPage - 1) * limit
  const defaultLimit = limit || 10
  const totalItems = await ContactModel.countDocuments(filter)
  const totalPages = Math.ceil(totalItems / defaultLimit)

  const results = await ContactModel.find(filter)
    .skip(offset)
    .limit(defaultLimit)
    .sort(sort as any)
    .populate(population)
    .lean()
    .exec()

  return {
    meta: {
      current: currentPage,
      pageSize: defaultLimit,
      pages: totalPages,
      total: totalItems
    },
    results
  }
}


const handleFetchInfoContact = async (contactId: string) => {
  const contact = await ContactModel.findById(contactId).lean().exec()
  if (!contact) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Liên hệ không tồn tại')
  }
  return contact
}

const handleUpdateContact = async (contactId: string, data: IContact) => {
  const contact = await ContactModel.updateOne({ _id: contactId }, { ...data })
  if (!contact) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Liên hệ không tồn tại')
  }
  return contact
}

const handleDeleteContact = async (contactId: string): Promise<any> => {
  const contact = await ContactModel.deleteById(contactId)
  if (!contact) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Liên hệ không tồn tại')
  }
  return contact
}

export const contactService = {
  handleCreateContact,
  handleFetchAllContact,
  handleFetchInfoContact,
  handleUpdateContact,
  handleDeleteContact
}
