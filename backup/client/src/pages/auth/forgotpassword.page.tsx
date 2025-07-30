/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import authImg from '@/assets/images/auth-img.jpg'
import googleIcon from '@/assets/images/Google.png'
import twitterIcon from '@/assets/images/twitter.png'
import { Link, useNavigate } from 'react-router'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { forgotPasswordAPI } from '@/services/auth-service/auth.apis'


const formSchema = z.object({
  email: z.string().email({ message: 'Email không hợp lệ.' }).min(1, { message: 'Email không được để trống.' })
})

const ForgotPasswordPage = () => {
  const navigate = useNavigate()

  const sendEmailMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const res = await forgotPasswordAPI(data)
      const response = res as IBackendResponse<null>
      if (response.statusCode === 200) {
        return response
      } else {
        throw new Error(response.message.toString() || 'Gửi yêu cầu thất bại.')
      }
    },
    onSuccess: (res, variables) => {
      localStorage.setItem('reset_email', variables.email)
      toast.success((res as IBackendResponse<null>).message.toString())
      navigate(`/verifycode?email=${variables.email}`)
    },
    onError: (error: any) => {
      toast.error(error.message || 'Gửi yêu cầu không thành công. Vui lòng thử lại.')
    }
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: ''
    }
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    sendEmailMutation.mutate(values)
  }

  return (
    <div className="flex flex-row justify-center w-screen h-screen overflow-hidden p-0 m-0">
      <div className="w-full relative">
        {/* Main Content */}
        <div className="flex">
          {/* Left Image */}
          <div className="flex-1/2 h-screen relative">
            <img className="w-full h-full object-cover" alt="Fashion models" src={authImg} />
          </div>
          {/* Right Forgot Password Form */}
          <div className="flex-1/2 mx-[77px] mt-[171px]">
            <h1 className="[font-family:'Core_Sans_C-65Bold',Helvetica] font-bold text-[#333333] text-[34px] tracking-[0.68px]">
              Quên mật khẩu
            </h1>
            <p className="mt-4 [font-family:'Causten-Regular',Helvetica] font-normal text-[#666666] text-lg">
              Vui lòng nhập email của bạn để nhận mã xác minh.
            </p>

            <div className="mt-[83px]">
              {/* Optional: Social login if desired for "forgot password" flow, often not needed */}
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-3 px-5 py-4 rounded-lg border border-solid border-[#3c4242] [font-family:'Causten-Medium',Helvetica] font-medium text-[#8a33fd] text-[22px]"
              >
                <img className="w-5 h-5" alt="Google" src={googleIcon} />
                Tiếp tục với Google
              </Button>
              <Button
                variant="outline"
                className="w-full mt-[30px] flex items-center justify-center gap-3 px-5 py-4 rounded-lg border border-solid border-[#3c4242] [font-family:'Causten-Medium',Helvetica] font-medium text-[#8a33fd] text-[22px]"
              >
                <img className="w-5 h-5" alt="Twitter" src={twitterIcon} />
                Tiếp tục với Twitter
              </Button>
              <div className="flex items-center justify-center mt-[30px]">
                <Separator className="w-[248px] bg-[#66666640]" />
                <span className="mx-5 [font-family:'Core_Sans_C-45Regular',Helvetica] font-normal text-[#666666] text-lg">
                  Hoặc
                </span>
                <Separator className="w-[248px] bg-[#66666640]" />
              </div>

              <div className="mt-10">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="example@gmail.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="mt-10 w-[200px] flex items-center justify-center gap-3 px-5 py-4 bg-[#8a33fd] rounded-lg [font-family:'Causten-Medium',Helvetica] font-medium text-white text-lg"
                      disabled={sendEmailMutation.isPending}
                    >
                      {sendEmailMutation.isPending ? 'Đang gửi...' : 'Gửi mã xác minh'}
                    </Button>
                  </form>
                </Form>

                <p className="mt-[20px] [font-family:'Causten-Regular',Helvetica] font-normal text-[#3c4242] text-base">
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
    </div>
  )
}

export default ForgotPasswordPage