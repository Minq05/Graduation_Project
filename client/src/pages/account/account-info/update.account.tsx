/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import z from 'zod'
import React from 'react'
import { updateUserAPI } from '@/services/user-service/user.apis'

const schema = z.object({
  fullName: z.string().min(1, 'Họ và tên không được để trống'),
  phone: z.string().min(8, 'Số điện thoại không hợp lệ')
})

type FormValues = z.infer<typeof schema>

type Props = {
  defaultValues: FormValues & { _id: string }
  onClose: () => void
  onUpdated: () => void
}

const UpdateAccount: React.FC<Props> = ({ defaultValues, onClose, onUpdated }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    defaultValues,
    resolver: zodResolver(schema)
  })

  const onSubmit = async (data: FormValues) => {
    try {
      await updateUserAPI(defaultValues._id, data)
      toast.success('Cập nhật thành công')
      onUpdated()
    } catch (err) {
      toast.error('Cập nhật thất bại')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cập nhật thông tin</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
              Họ và tên <span className="text-red-500">*</span>
            </Label>
            <Input
              id="fullName"
              placeholder="Nhập họ và tên"
              {...register('fullName')}
              className="h-12 bg-gray-50 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
            />
            {errors.fullName && (
              <p className="text-sm text-red-500">{errors.fullName.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
              Số điện thoại <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone"
              placeholder="Nhập số điện thoại"
              {...register('phone')}
              className="h-12 bg-gray-50 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
            />
            {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 pt-6">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 h-12 font-medium transition-colors"
        >
          Lưu
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 h-12 font-medium transition-colors"
        >
          Đóng
        </Button>
      </div>
    </form>
  )
}

export default UpdateAccount
