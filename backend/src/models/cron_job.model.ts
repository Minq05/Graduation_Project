import mongoose, { Schema } from 'mongoose'
import MongooseDelete, { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete'

export interface ICronJob extends SoftDeleteDocument {
  name: string
  flashSaleId: Schema.Types.ObjectId
  jobType: 'start' | 'end'
  status: 'scheduled' | 'completed' | 'failed'
  scheduledTime: Date
  createdBy?: {
    _id: string
    email: string
  }
  updatedBy?: {
    _id: string
    email: string
  }
}

const CronJobSchema: Schema<ICronJob> = new mongoose.Schema(
  {
    name: { type: String, required: true },
    flashSaleId: { type: Schema.Types.ObjectId, ref: 'flash_sales', required: true },
    jobType: { type: String, enum: ['start', 'end'], required: true },
    status: { type: String, enum: ['scheduled', 'completed', 'failed'], default: 'scheduled' },
    scheduledTime: { type: Date, required: true },
    createdBy: {
      _id: { type: String },
      email: { type: String }
    },
    updatedBy: {
      _id: { type: String },
      email: { type: String }
    },
    deletedBy: {
      _id: { type: String },
      email: { type: String }
    }
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true
  }
)

CronJobSchema.plugin(MongooseDelete, {
  overrideMethods: 'all',
  deletedAt: true,
  deletedBy: false
})

const CronJobModel = mongoose.model<ICronJob, SoftDeleteModel<ICronJob>>('cron_jobs', CronJobSchema)

export default CronJobModel