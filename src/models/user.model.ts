import mongoose, { Schema } from 'mongoose'
import MongooseDelete, { SoftDeleteDocument, SoftDeleteModel } from 'mongoose-delete'

export interface IUser extends SoftDeleteDocument {
  fullName?: string
  email: string
  password: string
  phone?: string
  address?: string
  gender?: string
  birthday?: Date
  avatar?: string
  verifyCode?: string
  verifyCodeExpired?: Date
  isVerified?: boolean
  role?: string
  status?: string
  refreshToken?: string
  refreshTokenExpired?: Date
  passwordResetToken?: string
  passwordResetExpires?: Date
  createdBy?: {
    _id: string
    email: string
  }
  updatedBy?: {
    _id: string
    email: string
  }
}

const UserSchema: Schema<IUser> = new mongoose.Schema(
  {
    fullName: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    address: { type: String },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      default: 'male'
    },
    birthday: { type: Date },
    avatar: { type: String },
    verifyCode: { type: String },
    verifyCodeExpired: { type: Date },
    isVerified: { type: Boolean, default: false },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    refreshToken: { type: String },
    refreshTokenExpired: { type: Date },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
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
UserSchema.plugin(MongooseDelete, { overrideMethods: 'all', deletedBy: true, deletedByType: String })

const UserModel = mongoose.model<IUser, SoftDeleteModel<IUser>>('users', UserSchema)

export default UserModel
