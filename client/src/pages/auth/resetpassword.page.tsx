/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import authImg from '@/assets/images/auth-img.jpg'
import { Link, useLocation, useNavigate } from 'react-router'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { resetPasswordAPI } from '@/services/auth-service/auth.apis'

const formSchema = z
  .object({
    password: z.string().min(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự.' }),
    confirmPassword: z.string().min(6, { message: 'Xác nhận mật khẩu phải có ít nhất 6 ký tự.' })
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp.',
    path: ['confirmPassword']
  })

const ResetPasswordPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const resetState = location.state as { email: string; code: string } | null
  const [email, setEmail] = useState<string>('')
  const [code, setCode] = useState<string>('')

  useEffect(() => {
    if (!resetState?.email || !resetState?.code) {
      toast.error('Thiếu thông tin đặt lại mật khẩu. Vui lòng thử lại.')
      navigate('/forgot-password')
      return
    }
    setEmail(resetState.email)
    setCode(resetState.code)
  }, [resetState, navigate])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      confirmPassword: ''
    }
  })

  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const res = await resetPasswordAPI({
        email,
        code,
        password: data.password
      })
      return res
    },
    onSuccess: () => {
      toast.success('Đặt lại mật khẩu thành công!')
      navigate('/signin')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Đặt lại mật khẩu thất bại.')
    }
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutation.mutate(values)
  }

  return (
    <div className="flex flex-row justify-center w-screen h-screen overflow-hidden p-0 m-0">
      <div className="w-full relative">
        <div className="flex">
          <div className="flex-1/2 h-screen relative">
            <img className="w-full h-full object-cover" alt="Auth banner" src={authImg} />
          </div>

          <div className="flex-1/2 mx-[77px] mt-[171px]">
            <h1 className="font-bold text-[#333333] text-[34px] tracking-[0.68px]">Đặt lại mật khẩu</h1>
            <p className="mt-4 text-[#666666] text-lg">Nhập mật khẩu mới cho tài khoản <strong>{email}</strong>.</p>

            <div className="mt-10">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mật khẩu mới</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="********" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Xác nhận mật khẩu</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="********" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="mt-10 w-[200px] flex items-center justify-center gap-3 px-5 py-4 bg-[#8a33fd] rounded-lg font-medium text-white text-lg"
                    disabled={mutation.isPending}
                  >
                    {mutation.isPending ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
                  </Button>
                </form>
              </Form>

              <p className="mt-[20px] text-[#3c4242] text-base">
                Quay lại{' '}
                <Link to="/signin" className="underline">
                  Đăng nhập
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResetPasswordPage
