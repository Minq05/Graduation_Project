import aqp from 'api-query-params'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import CronJobModel from '~/models/cron_job.model'
import FlashSaleModel from '~/models/flash_sale.model'
import { Types } from 'mongoose'
import { createLogger } from '~/config/logger'
import { flashSaleCronService } from './flash_sale_cron.service'
import cron from 'node-cron'

// Tạo logger cho module này
const logger = createLogger(__filename)

// Map để lưu trữ các cron jobs đang chạy
const runningCronJobs = new Map()

export interface ICronJobData {
  flashSaleId: string
  jobType: 'start' | 'end'
  scheduledTime?: string
}

const handleCreateCronJob = async (cronJobData: ICronJobData) => {
  try {
    // Kiểm tra flash sale có tồn tại không
    if (!Types.ObjectId.isValid(cronJobData.flashSaleId)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'ID flash sale không hợp lệ')
    }

    const flashSale = await FlashSaleModel.findById(cronJobData.flashSaleId).lean()
    if (!flashSale) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Flash sale không tồn tại!')
    }

    // Xác định thời gian dự kiến
    let scheduledTime
    if (cronJobData.scheduledTime) {
      scheduledTime = new Date(cronJobData.scheduledTime)
    } else {
      scheduledTime = cronJobData.jobType === 'start' ? flashSale.startDate : flashSale.endDate
    }

    // Tạo tên công việc
    const jobName = `${cronJobData.jobType === 'start' ? 'Bắt đầu' : 'Kết thúc'}: ${flashSale.name}`

    // Tạo cron job
    const created = await CronJobModel.create({
      name: jobName,
      flashSaleId: cronJobData.flashSaleId,
      jobType: cronJobData.jobType,
      scheduledTime,
      status: 'scheduled'
    })

    // Lên lịch cron job
    scheduleCronJob(created._id.toString())

    return created.toObject()
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Có lỗi xảy ra trong quá trình tạo cron job!')
  }
}

const handleFetchAllCronJobs = async ({
  currentPage,
  limit,
  qs
}: {
  currentPage: number
  limit: number
  qs: string
}) => {
  const { filter, sort } = aqp(qs)
  delete filter.current
  delete filter.pageSize

  const offset = (+currentPage - 1) * +limit
  const defaultLimit = +limit || 10

  const totalItems = await CronJobModel.countDocuments(filter)
  const totalPages = Math.ceil(totalItems / defaultLimit)

  const results = await CronJobModel.find(filter)
    .skip(offset)
    .limit(defaultLimit)
    .sort(sort as any)
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

const handleFetchCronJobById = async (cronJobId: string) => {
  if (!Types.ObjectId.isValid(cronJobId)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'ID cron job không hợp lệ')
  }
  const cronJob = await CronJobModel.findById(cronJobId).lean().exec()
  if (!cronJob) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Cron job không tồn tại!')
  }
  return cronJob
}

const handleUpdateCronJob = async (cronJobId: string, cronJobData: Partial<ICronJobData>) => {
  if (!Types.ObjectId.isValid(cronJobId)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'ID cron job không hợp lệ')
  }

  // Lấy thông tin cron job hiện tại
  const existingJob = await CronJobModel.findById(cronJobId).lean()
  if (!existingJob) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Cron job không tồn tại!')
  }

  // Nếu đã hoàn thành thì không cho cập nhật
  if (existingJob.status === 'completed') {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Không thể cập nhật cron job đã hoàn thành!')
  }

  // Chuẩn bị dữ liệu cập nhật
  const updateData: any = {}

  // Nếu có thay đổi flash sale hoặc loại công việc
  if (cronJobData.flashSaleId || cronJobData.jobType) {
    const flashSaleId = cronJobData.flashSaleId || existingJob.flashSaleId.toString()
    const jobType = cronJobData.jobType || existingJob.jobType

    // Kiểm tra flash sale có tồn tại không
    if (!Types.ObjectId.isValid(flashSaleId)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'ID flash sale không hợp lệ')
    }

    const flashSale = await FlashSaleModel.findById(flashSaleId).lean()
    if (!flashSale) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Flash sale không tồn tại!')
    }

    // Cập nhật thông tin
    updateData.flashSaleId = flashSaleId
    updateData.jobType = jobType

    // Cập nhật tên công việc
    updateData.name = `${jobType === 'start' ? 'Bắt đầu' : 'Kết thúc'}: ${flashSale.name}`

    // Cập nhật thời gian dự kiến nếu không được chỉ định
    if (!cronJobData.scheduledTime) {
      updateData.scheduledTime = jobType === 'start' ? flashSale.startDate : flashSale.endDate
    }
  }

  // Cập nhật thời gian dự kiến nếu được chỉ định
  if (cronJobData.scheduledTime) {
    updateData.scheduledTime = new Date(cronJobData.scheduledTime)
  }

  // Cập nhật cron job
  const updated = await CronJobModel.findByIdAndUpdate(cronJobId, { $set: updateData }, { new: true }).lean()
  if (!updated) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Cron job không tồn tại!')
  }

  // Hủy cron job cũ và lên lịch lại
  cancelCronJob(cronJobId)
  scheduleCronJob(cronJobId)

  return updated
}

const handleDeleteCronJob = async (cronJobId: string) => {
  if (!Types.ObjectId.isValid(cronJobId)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'ID cron job không hợp lệ')
  }

  // Lấy thông tin cron job hiện tại
  const existingJob = await CronJobModel.findById(cronJobId).lean()
  if (!existingJob) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Cron job không tồn tại!')
  }

  // Nếu đã hoàn thành thì không cho xóa
  if (existingJob.status === 'completed') {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Không thể xóa cron job đã hoàn thành!')
  }

  // Hủy cron job đang chạy
  cancelCronJob(cronJobId)

  // Xóa cron job
  const deleted = await CronJobModel.delete({ _id: cronJobId })
  if (!deleted) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Cron job không tồn tại!')
  }

  return { message: 'Xóa cron job thành công (soft-delete)' }
}

// Hàm lên lịch cron job
const scheduleCronJob = async (cronJobId: string) => {
  try {
    // Lấy thông tin cron job
    const cronJob = await CronJobModel.findById(cronJobId).lean()
    if (!cronJob) {
      logger.error(`Không tìm thấy cron job với ID: ${cronJobId}`)
      return
    }

    // Nếu đã hoàn thành hoặc thất bại thì không lên lịch lại
    if (cronJob.status !== 'scheduled') {
      return
    }

    // Lấy thời gian dự kiến
    const scheduledTime = new Date(cronJob.scheduledTime)
    
    // Nếu thời gian dự kiến đã qua thì đánh dấu là thất bại
    if (scheduledTime < new Date()) {
      await CronJobModel.findByIdAndUpdate(cronJobId, { $set: { status: 'failed' } })
      logger.warn(`Cron job ${cronJob.name} đã quá hạn và được đánh dấu là thất bại`)
      return
    }

    // Tính toán thời gian cron
    const minute = scheduledTime.getMinutes()
    const hour = scheduledTime.getHours()
    const dayOfMonth = scheduledTime.getDate()
    const month = scheduledTime.getMonth() + 1 // Tháng trong JavaScript bắt đầu từ 0
    const dayOfWeek = scheduledTime.getDay()

    // Tạo biểu thức cron
    const cronExpression = `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`
    
    // Lên lịch cron job
    const job = cron.schedule(cronExpression, async () => {
      try {
        logger.info(`Đang thực hiện cron job: ${cronJob.name}`)
        
        // Thực hiện công việc dựa trên loại
        if (cronJob.jobType === 'start') {
          await flashSaleCronService.handleFlashSaleStart(cronJob.flashSaleId.toString())
        } else {
          await flashSaleCronService.handleFlashSaleEnd(cronJob.flashSaleId.toString())
        }
        
        // Cập nhật trạng thái thành công
        await CronJobModel.findByIdAndUpdate(cronJobId, { $set: { status: 'completed' } })
        
        logger.info(`Cron job ${cronJob.name} đã hoàn thành thành công`)
        
        // Hủy cron job sau khi hoàn thành
        cancelCronJob(cronJobId)
      } catch (error) {
        logger.error(`Lỗi khi thực hiện cron job ${cronJob.name}:`, error)
        
        // Cập nhật trạng thái thất bại
        await CronJobModel.findByIdAndUpdate(cronJobId, { $set: { status: 'failed' } })
        
        // Hủy cron job sau khi thất bại
        cancelCronJob(cronJobId)
      }
    })
    
    // Lưu job vào map
    runningCronJobs.set(cronJobId, job)
    
    logger.info(`Đã lên lịch cron job: ${cronJob.name} vào lúc ${scheduledTime.toISOString()}`)
  } catch (error) {
    logger.error(`Lỗi khi lên lịch cron job ${cronJobId}:`, error)
  }
}

// Hàm hủy cron job
const cancelCronJob = (cronJobId: string) => {
  const job = runningCronJobs.get(cronJobId)
  if (job) {
    job.stop()
    runningCronJobs.delete(cronJobId)
    logger.info(`Đã hủy cron job với ID: ${cronJobId}`)
  }
}

// Hàm khởi tạo tất cả cron jobs từ database
const initAllCronJobs = async () => {
  try {
    // Lấy tất cả cron jobs đang lên lịch
    const cronJobs = await CronJobModel.find({ status: 'scheduled' }).lean()
    
    logger.info(`Đang khởi tạo ${cronJobs.length} cron jobs từ database`)
    
    // Lên lịch lại tất cả cron jobs
    for (const job of cronJobs) {
      await scheduleCronJob(job._id.toString())
    }
    
    logger.info('Đã khởi tạo tất cả cron jobs thành công')
  } catch (error) {
    logger.error('Lỗi khi khởi tạo cron jobs:', error)
  }
}

export const cronJobService = {
  handleCreateCronJob,
  handleFetchAllCronJobs,
  handleFetchCronJobById,
  handleUpdateCronJob,
  handleDeleteCronJob,
  scheduleCronJob,
  cancelCronJob,
  initAllCronJobs
}