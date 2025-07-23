import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@radix-ui/react-checkbox'
import googleIcon from '@/assets/images/Google.png'
import twitterIcon from '@/assets/images/twitter.png'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { signupAPI } from '@/services/auth-service/auth.apis'
import { motion } from 'framer-motion'
import { useState } from 'react'

const formSchema = z.object({
  email: z.string().email().min(2, {
    message: 'Email không được để trống.'
  }),
  password: z.string().min(6, {
    message: 'Mật khẩu phải có ít nhất 6 ký tự.'
  })
})

const SignupPage = () => {
  const navigate = useNavigate()
  const [isHovered, setIsHovered] = useState(false)

  const signupMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const res = await signupAPI(data)
      if (res.data) {
        return res.data
      } else {
        throw new Error((res.message.toString() || 'Đăng ký không thành công. Vui lòng thử lại.'))
      }
    },
    onSuccess: () => {
      navigate('/verify-code?email=' + form.getValues('email'), { replace: true })
      toast.success('Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản của bạn.')
    },
    onError: (error) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      toast.error(error.response.data.message)
    }
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    signupMutation.mutate(values)
  }

  return (
    <div className="flex flex-row justify-center items-center w-screen h-screen overflow-hidden p-0 m-0 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="w-full relative flex justify-center items-center">
        <div className="flex shadow-2xl rounded-xl overflow-hidden max-w-7xl w-full">
          {/* Left Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="w-1/2 h-screen relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-purple-900/30 to-pink-900/40 z-10"></div>
            <img
              className="w-full h-full object-cover"
              alt="Bộ sưu tập nước hoa"
              src="https://images.unsplash.com/photo-1590736704728-f4730bb30770?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8cGVyZnVtZXxlbnwwfHwwfHx8MA%3D%3D"
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-20 text-white"
            >
              <h2 className="text-4xl font-bold mb-4 drop-shadow-lg">Hành Trình Hương Thơm</h2>
              <p className="text-xl drop-shadow-md">Bắt đầu cuộc phiêu lưu hương sắc</p>
            </motion.div>
          </motion.div>

          {/* Right Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="w-1/2 px-16 py-10 relative bg-white"
          >
            <motion.h1
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.5 }}
              className="font-bold text-[#333333] text-3xl mb-4"
            >
              Đăng ký
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-6 font-medium text-[#666666cc] text-base"
            >
              Đăng ký miễn phí để truy cập vào bất kỳ sản phẩm nào của chúng tôi
            </motion.p>

            {/* Social Login Buttons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="space-y-4"
            >
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-3 px-5 py-4 rounded-lg border border-solid border-[#3c4242] font-medium text-[#8a33fd] text-xl hover:bg-purple-50"
              >
                <img className="w-5 h-5" alt="Google" src={googleIcon} />
                Tiếp tục với Google
              </Button>

              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-3 px-5 py-4 rounded-lg border border-solid border-[#3c4242] font-medium text-[#8a33fd] text-xl hover:bg-purple-50"
              >
                <img className="w-5 h-5" alt="Twitter" src={twitterIcon} />
                Tiếp tục với Facebook
              </Button>
            </motion.div>

            {/* Registration Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-8"
            >
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-purple-900">Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="example@gmail.com"
                            {...field}
                            className="border-purple-200 focus:border-purple-500 transition-all duration-300 rounded-md py-2"
                          />
                        </FormControl>
                        <FormMessage className="text-pink-600" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-purple-900">Mật khẩu</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="********"
                            {...field}
                            className="border-purple-200 focus:border-purple-500 transition-all duration-300 rounded-md py-2"
                          />
                        </FormControl>
                        <FormMessage className="text-pink-600" />
                      </FormItem>
                    )}
                  />

                  {/* Checkboxes */}
                  <div className="flex items-start gap-3">
                    <Checkbox id="terms" className="mt-1" />
                    <label
                      htmlFor="terms"
                      className="font-medium text-[#807d7e] text-sm"
                    >
                      Bằng cách đăng ký, bạn đồng ý với <Link to='/' className="text-purple-700 underline hover:text-purple-900 transition-colors duration-300">Điều khoản</Link>{' '}
                      và <Link to='/' className="text-purple-700 underline hover:text-purple-900 transition-colors duration-300">Chính sách bảo mật</Link> của chúng tôi.
                    </label>
                  </div>

                  <motion.div
                    onHoverStart={() => setIsHovered(true)}
                    onHoverEnd={() => setIsHovered(false)}
                  >
                    <Button
                      type="submit"
                      className={`w-40 flex items-center justify-center gap-3 px-5 py-4 rounded-lg font-medium text-white text-lg transition-all duration-500 ${isHovered ? 'bg-gradient-to-r from-purple-600 to-pink-500 shadow-lg shadow-purple-300' : 'bg-[#8a33fd]'}`}
                    >
                      Đăng ký
                    </Button>
                  </motion.div>
                </form>
              </Form>
            </motion.div>

            {/* Login Link */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-6 font-normal text-[#3c4242] text-base"
            >
              Bạn đã có tài khoản?{' '}
              <Link to="/signin" className="text-purple-700 underline hover:text-purple-900 transition-colors duration-300">
                Đăng nhập
              </Link>
            </motion.p>

            {/* Decorative Elements */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="absolute bottom-10 right-10 w-24 h-24 rounded-full bg-gradient-to-br from-purple-200/30 to-pink-200/30 blur-md z-0"
            />
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default SignupPage
