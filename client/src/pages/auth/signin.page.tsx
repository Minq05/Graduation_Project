import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import googleIcon from '@/assets/images/Google.png'
import twitterIcon from '@/assets/images/twitter.png'
import { Link, useNavigate } from 'react-router'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { signinAPI } from '@/services/auth-service/auth.apis'
import { useAppDispatch } from '@/redux/hooks'
import { setAccessToken, setStateSignin } from '@/redux/slices/auth.slice'
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

const SigninPage = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [isHovered, setIsHovered] = useState(false)

  const signinMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const res = await signinAPI(data)
      if (res.data) {
        return res.data
      } else {
        throw new Error('Đăng nhập không thành công. Vui lòng thử lại.')
      }
    },
    onSuccess: (data: IAuth) => {
      dispatch(setStateSignin({ user: data.user, access_token: data.access_token }))
      dispatch(setAccessToken({ access_token: data.access_token }))
      toast.success('Đăng nhập thành công!')
      navigate('/')
    },
    onError: (error) => {
      // eslint-disable-next-line no-console
      console.log('🚀 ~ SigninPage ~ error:', error)
      toast.error('Đăng nhập không thành công. Vui lòng thử lại.')
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
    signinMutation.mutate(values)
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
            <img className="w-full h-full object-cover" alt="Bộ sưu tập nước hoa" src="https://images.unsplash.com/photo-1590736704728-f4730bb30770?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8cGVyZnVtZXxlbnwwfHwwfHx8MA%3D%3D" />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-20 text-white"
            >
              <h2 className="text-4xl font-bold mb-4 drop-shadow-lg">Hương Thơm Đẳng Cấp</h2>
              <p className="text-xl drop-shadow-md">Khám phá mùi hương riêng của bạn</p>
            </motion.div>
          </motion.div>

          {/* Right Sign In Form */}
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
              className="font-bold text-[#333333] text-3xl mb-8"
            >
              Đăng nhập
            </motion.h1>

            {/* Social Login Buttons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
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
                Tiếp tục với Twitter
              </Button>
            </motion.div>

            {/* OR Divider */}
            <div className="flex items-center justify-center my-6">
              <div className="w-[40%] h-[1px] bg-[#66666640]"></div>
              <span className="mx-4 font-normal text-[#666666] text-lg">
                Hoặc
              </span>
              <div className="w-[40%] h-[1px] bg-[#66666640]"></div>
            </div>

            {/* Login Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-6"
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

                  <div className="flex justify-end">
                    <Link
                      to="/forgot-password"
                      className="font-normal text-purple-700 text-base underline hover:text-purple-900 transition-colors duration-300"
                    >
                      Quên mật khẩu?
                    </Link>
                  </div>

                  <motion.div
                    whileHover={() => setIsHovered(true)}
                    onHoverEnd={() => setIsHovered(false)}
                  >
                    <Button
                      type="submit"
                      className={`w-40 flex items-center justify-center gap-3 px-5 py-4 rounded-lg font-medium text-white text-lg transition-all duration-500 ${isHovered ? 'bg-gradient-to-r from-purple-600 to-pink-500 shadow-lg shadow-purple-300' : 'bg-[#8a33fd]'}`}
                    >
                      Đăng nhập
                    </Button>
                  </motion.div>
                </form>
              </Form>

              <p className="mt-6 font-normal text-[#3c4242] text-base">
                Chưa có tài khoản?{' '}
                <Link to="/signup" className="text-purple-700 underline hover:text-purple-900 transition-colors duration-300">
                  Đăng ký
                </Link>
              </p>
            </motion.div>

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

export default SigninPage
