/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import authImg from '@/assets/images/auth-img.jpg'
import { Link, useNavigate } from 'react-router'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { verifyForgotPasswordCodeAPI } from '@/services/auth-service/auth.apis'

const formSchema = z.object({
  code: z
    .string()
    .min(6, { message: 'Mã xác minh phải có 6 ký tự.' })
    .max(6, { message: 'Mã xác minh phải có 6 ký tự.' })
})

const VerifyCodePage = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState<string>('')

  useEffect(() => {
    const storedEmail = localStorage.getItem('reset_email')
    if (!storedEmail) {
      setTimeout(() => {
        toast.error('Không tìm thấy email. Vui lòng nhập lại.')
        navigate('/forgot-password')
      }, 0)
    } else {
      setEmail(storedEmail)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: ''
    }
  })

  const verifyCodeMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const res = await verifyForgotPasswordCodeAPI({ email, code: data.code })
      return res
    },
    onSuccess: (_, variables) => {
      toast.success('Xác minh thành công! Vui lòng đặt lại mật khẩu.')
      navigate('/reset-password', {
        state: {
          email,
          code: variables.code
        }
      })
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Xác minh thất bại. Vui lòng thử lại.')
    }
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    verifyCodeMutation.mutate(values)
  }

  return (
    <div className="flex flex-row justify-center w-screen h-screen overflow-hidden p-0 m-0">
      <div className="w-full relative">
        <div className="flex">
          <div className="flex-1/2 h-screen relative">
            <img className="w-full h-full object-cover" alt="Auth banner" src={authImg} />
          </div>

          <div className="flex-1/2 mx-[77px] mt-[171px]">
            <h1 className="font-bold text-[#333333] text-[34px] tracking-[0.68px]">Xác minh mã</h1>
            <p className="mt-4 text-[#666666] text-lg">
              Nhập mã xác minh đã được gửi đến email <strong>{email}</strong>.
            </p>

            <div className="mt-10">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mã xác minh</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập mã gồm 6 chữ số" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="mt-10 w-[200px] flex items-center justify-center gap-3 px-5 py-4 bg-[#8a33fd] rounded-lg font-medium text-white text-lg"
                    disabled={verifyCodeMutation.isPending}
                  >
                    {verifyCodeMutation.isPending ? 'Đang xác minh...' : 'Xác minh'}
                  </Button>
                </form>
              </Form>

              <p className="mt-[20px] text-[#3c4242] text-base">
                Bạn chưa nhận được mã?{' '}
                <Link to="/forgot-password" className="underline">
                  Gửi lại
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerifyCodePage
