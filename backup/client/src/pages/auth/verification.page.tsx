import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import authImg from '@/assets/images/auth-img.jpg'
import { useLocation, useNavigate } from 'react-router'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { reSendCodeAPI, verifyAPI } from '@/services/auth-service/auth.apis'
import { useState } from 'react'


const formSchema = z.object({
  code: z.string().min(2, {
    message: 'Mã xác thực không được để trống.'
  })
})


const VerificationPage = () => {
  const [isResend, setIsResend] = useState<boolean>(false)
  const navigate = useNavigate()
  const location = useLocation()

  const queryParams = new URLSearchParams(location.search)
  const email = queryParams.get('email') as string

  const verificationMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const reqData = {
        email: email,
        code: data.code
      }
      const res = await verifyAPI(reqData)
      if (res.data) {
        return res.data
      } else {
        throw new Error(res.message as string)
      }
    },
    onSuccess: () => {
      toast.success('Xác thực thành công!')
      navigate('/signin')
    },
    onError: (error) => {
      setIsResend(true)
      toast.error(error.message || 'Xác thực không thành công. Vui lòng thử lại.')
    }
  })

  const reSendCodeMutation = useMutation({
    mutationFn: async () => {
      const res = await reSendCodeAPI({ email })
      if (res.data) {
        return res.data
      } else {
        throw new Error(res.message as string)
      }
    },
    onSuccess: () => {
      toast.success('Gửi lại mã xác thực thành công!')
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: ''
    }
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    verificationMutation.mutate(values)
  }

  const handleResendCode = () => {
    reSendCodeMutation.mutate()
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
          {/* Right Sign In Form */}
          <div className="flex-1/2 mx-[77px] mt-[171px]">
            <h1 className="[font-family:'Core_Sans_C-65Bold',Helvetica] font-bold text-[#333333] text-[34px] tracking-[0.68px]">
              Kích hoạt tài khoản
            </h1>
            <div className="mt-10">

              <div className="mt-10">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField
                      control={form.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mã xác thực</FormLabel>
                          <FormControl>
                            <Input placeholder="012345" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex mt-10 justify-between items-center">
                      <Button type="submit" className="w-[167px] flex items-center justify-center gap-3 px-5 py-4 bg-[#8a33fd] rounded-lg [font-family:'Causten-Medium',Helvetica] font-medium text-white text-lg">
                        Kích hoạt
                      </Button>

                      {
                        isResend &&
                        <Button type='button' variant="ghost" className='cursor-pointer' onClick={handleResendCode}>
                          Gửi lại mã xác thực
                        </Button>
                      }
                    </div>
                  </form>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerificationPage
