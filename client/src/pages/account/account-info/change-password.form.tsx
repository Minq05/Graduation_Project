/* eslint-disable @typescript-eslint/no-explicit-any */
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { changePasswordAPI } from '@/services/auth-service/auth.apis'

const schema = z
  .object({
    oldPassword: z.string().min(6, 'Mật khẩu cũ tối thiểu 6 ký tự'),
    newPassword: z.string().min(6, 'Mật khẩu mới tối thiểu 6 ký tự'),
    confirmPassword: z.string()
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword']
  })

type FormData = z.infer<typeof schema>

interface ChangePasswordFormProps {
  onSuccess: () => void
  onCancel: () => void
}

const ChangePasswordForm = ({ onSuccess, onCancel }: ChangePasswordFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(schema)
  })

  const { mutate, isPending } = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) => changePasswordAPI(data),
    onSuccess: () => {
      toast.success('Đổi mật khẩu thành công')
      onSuccess()
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Đổi mật khẩu thất bại')
    }
  })

  const onSubmit = (data: FormData) => {
    mutate({
      currentPassword: data.oldPassword,
      newPassword: data.newPassword
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h3 className="text-lg font-semibold text-center">Đổi mật khẩu</h3>

      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">Mật khẩu cũ</label>
        <Input type="password" {...register('oldPassword')} />
        {errors.oldPassword && <p className="text-red-500 text-sm">{errors.oldPassword.message}</p>}
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">Mật khẩu mới</label>
        <Input type="password" {...register('newPassword')} />
        {errors.newPassword && <p className="text-red-500 text-sm">{errors.newPassword.message}</p>}
      </div>

      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">Xác nhận mật khẩu</label>
        <Input type="password" {...register('confirmPassword')} />
        {errors.confirmPassword && (
          <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Đang lưu...' : 'Lưu'}
        </Button>
      </div>
    </form>
  )
}

export default ChangePasswordForm
