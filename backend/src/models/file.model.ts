import mongoose, { Schema } from 'mongoose'
import MongooseDelete, { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete'

export interface IFile extends SoftDeleteDocument {
  filename?: string
  originalname?: string
  filePath?: string
  fileType?: string
  fileSize?: number
  mimetype?: string
  createdBy?: {
    _id: string
    email: string
  }
  updatedBy?: {
    _id: string
    email: string
  }
}

const FileSchema: Schema<IFile> = new mongoose.Schema(
  {
    originalname: { type: String, required: false, trim: true },
    filename: { type: String, required: false, trim: true },
    filePath: { type: String, required: false, trim: true },
    fileType: { type: String, required: false, trim: true },
    fileSize: { type: Number, required: false },
    mimetype: { type: String, required: false },
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

// Override all methods
FileSchema.plugin(MongooseDelete, { overrideMethods: 'all', deletedBy: true, deletedByType: String })

const FileModel = mongoose.model<IFile, SoftDeleteModel<IFile>>('files', FileSchema)

export default FileModel
