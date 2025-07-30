import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { contactSchema } from '@/validations/contacts'
import instance from '@/config/axios.customize'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import type { ContactFormProps } from '@/types/contact'
import { toast } from 'react-toastify'
import {
  Mail,
  Phone,
  User,
  MessageSquare,
  Send,
  CheckCircle,
  MapPin,
  Clock,
  Star,
  Sparkles,
  ArrowRight
} from 'lucide-react'
import { useState, useEffect } from 'react'
import 'react-toastify/dist/ReactToastify.css'

export const ContactForm = () => {
  const [isSuccess, setIsSuccess] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<ContactFormProps>({
    resolver: zodResolver(contactSchema)
  })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const onSubmit = async (data: ContactFormProps) => {
    try {
      await instance.post('/api/v1/contacts', data)
      toast.success('🎉 Gửi liên hệ thành công!', {
        style: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }
      })
      setIsSuccess(true)
      reset()

      setTimeout(() => setIsSuccess(false), 4000)
    } catch (error) {
      toast.error('❌ Có lỗi xảy ra. Vui lòng thử lại!', {
        style: {
          background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
          color: 'white'
        }
      })
      console.log(error)
    }
  }

  return (
    <div className='min-h-screen relative overflow-hidden'>
      {/* Animated Background */}
      <div className='absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-cyan-50'>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=60 height=60 viewBox=0 0 60 60 xmlns=http://www.w3.org/2000/svg%3E%3Cg fill=none fillRule=evenodd%3E%3Cg fill=%239C92AC fillOpacity=0.03%3E%3Ccircle cx=30 cy=30 r=4/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>

        {/* Floating Elements */}
        <div className='absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob'></div>
        <div className='absolute top-40 right-20 w-72 h-72 bg-gradient-to-r from-yellow-400 to-red-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000'></div>
        <div className='absolute -bottom-8 left-40 w-72 h-72 bg-gradient-to-r from-blue-400 to-green-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000'></div>

        {/* Mouse Follower */}
        <div
          className='absolute w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full filter blur-3xl pointer-events-none transition-all duration-300 ease-out'
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192
          }}
        ></div>
      </div>

      <div className='relative z-10 py-20 px-4'>
        <div className='max-w-7xl mx-auto'>
          {/* Hero Section */}
          <div className='text-center mb-20'>
            <div className='inline-flex items-center justify-center mb-8'>
              <div className='relative'>
                <div className='w-20 h-20 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-6 transition-transform duration-300'>
                  <Sparkles className='w-10 h-10 text-white animate-pulse' />
                </div>
                <div className='absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-bounce'></div>
              </div>
            </div>

            <h1 className='text-6xl md:text-7xl font-black mb-6'>
              <span className='bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient-x'>
                Liên Hệ
              </span>
              <br />
              <span className='bg-gradient-to-r from-pink-600 via-red-500 to-orange-500 bg-clip-text text-transparent animate-gradient-x'>
                Với Chúng Tôi
              </span>
            </h1>

            <p className='text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8'>
              Chúng tôi không chỉ lắng nghe - chúng tôi hiểu và hành động. Hãy chia sẻ ý tưởng của bạn và cùng tạo nên
              điều kỳ diệu! ✨
            </p>

            {/* Stats */}
            <div className='flex justify-center items-center gap-8 mb-12'>
              <div className='text-center'>
                <div className='text-3xl font-bold text-indigo-600'>24/7</div>
                <div className='text-sm text-gray-500'>Hỗ trợ</div>
              </div>
              <div className='w-px h-12 bg-gray-300'></div>
              <div className='text-center'>
                <div className='text-3xl font-bold text-purple-600'>{'<2h'}</div>
                <div className='text-sm text-gray-500'>Phản hồi</div>
              </div>
              <div className='w-px h-12 bg-gray-300'></div>
              <div className='text-center flex items-center gap-1'>
                <div className='text-3xl font-bold text-pink-600'>5.0</div>
                <Star className='w-6 h-6 text-yellow-400 fill-current' />
                <div className='text-sm text-gray-500 ml-1'>Đánh giá</div>
              </div>
            </div>
          </div>

          <div className='grid lg:grid-cols-5 gap-12 items-start'>
            {/* Contact Info */}
            <div className='lg:col-span-2 space-y-8'>
              <div className='space-y-6'>
                {[
                  {
                    icon: Phone,
                    title: 'Gọi ngay',
                    subtitle: 'Tư vấn miễn phí',
                    value: '+84 775 703 144',
                    color: 'from-blue-500 to-cyan-500',
                    bgColor: 'bg-blue-50'
                  },
                  {
                    icon: Mail,
                    title: 'Email chúng tôi',
                    subtitle: 'Phản hồi trong 2 giờ',
                    value: 'ygvv468@company.com',
                    color: 'from-green-500 to-emerald-500',
                    bgColor: 'bg-green-50'
                  },
                  {
                    icon: MapPin,
                    title: 'Địa chỉ văn phòng',
                    subtitle: 'Ghé thăm chúng tôi',
                    value: '123 Đường ABC, Thạch Bích, Thanh oai',
                    color: 'from-purple-500 to-pink-500',
                    bgColor: 'bg-purple-50'
                  },
                  {
                    icon: Clock,
                    title: 'Giờ làm việc',
                    subtitle: 'Sẵn sàng hỗ trợ',
                    value: 'T2-T6: 8:00 - 18:00',
                    color: 'from-orange-500 to-red-500',
                    bgColor: 'bg-orange-50'
                  }
                ].map((item, index) => (
                  <Card
                    key={index}
                    className='group border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-white/80 backdrop-blur-sm'
                  >
                    <CardContent className='p-6'>
                      <div className='flex items-start space-x-4'>
                        <div
                          className={`w-14 h-14 ${item.bgColor} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                        >
                          <div
                            className={`w-8 h-8 bg-gradient-to-r ${item.color} rounded-lg flex items-center justify-center`}
                          >
                            <item.icon className='w-4 h-4 text-white' />
                          </div>
                        </div>
                        <div className='flex-1'>
                          <h3 className='font-bold text-gray-900 mb-1'>{item.title}</h3>
                          <p className='text-sm text-gray-500 mb-2'>{item.subtitle}</p>
                          <p className='font-semibold text-gray-700'>{item.value}</p>
                        </div>
                        <ArrowRight className='w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-300' />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Social Proof */}
              <Card className='border-0 shadow-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white'>
                <CardContent className='p-8 text-center'>
                  <div className='flex justify-center mb-4'>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className='w-6 h-6 text-yellow-300 fill-current animate-pulse'
                        style={{ animationDelay: `${i * 0.1}s` }}
                      />
                    ))}
                  </div>
                  <h3 className='text-xl font-bold mb-2'>Hơn 1000+ khách hàng tin tưởng</h3>
                  <p className='text-indigo-100'>'Dịch vụ tuyệt vời, hỗ trợ nhanh chóng và chuyên nghiệp!'</p>
                  <div className='mt-4 text-sm text-indigo-200'>CEO - PHẠM VĂN TAM</div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div className='lg:col-span-3'>
              <Card className='border-0 shadow-2xl bg-white/90 backdrop-blur-lg overflow-hidden'>
                <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500'></div>

                <CardContent className='p-10'>
                  <div className='mb-8'>
                    <h2 className='text-3xl font-bold text-gray-900 mb-2'>Gửi tin nhắn cho chúng tôi</h2>
                    <p className='text-gray-600'>
                      Điền thông tin bên dưới và chúng tôi sẽ liên hệ với bạn sớm nhất có thể
                    </p>
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
                    <div className='grid md:grid-cols-2 gap-6'>
                      {/* Name Field */}
                      <div className='space-y-3 group'>
                        <Label
                          htmlFor='name'
                          className='text-sm font-semibold text-gray-700 flex items-center gap-2 group-focus-within:text-indigo-600 transition-colors'
                        >
                          <User className='w-4 h-4' />
                          Họ và tên *
                        </Label>
                        <div className='relative'>
                          <Input
                            {...register('name')}
                            id='name'
                            className='h-14 pl-4 pr-4 border-2 border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 rounded-xl transition-all duration-300 bg-gray-50/50 hover:bg-white group-focus-within:bg-white text-lg'
                            placeholder='Nhập họ và tên của bạn'
                          />
                          <div className='absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/0 via-purple-500/0 to-pink-500/0 group-focus-within:from-indigo-500/5 group-focus-within:via-purple-500/5 group-focus-within:to-pink-500/5 transition-all duration-300 pointer-events-none'></div>
                        </div>
                        {errors.name && (
                          <p className='text-sm text-red-500 flex items-center gap-1 animate-shake'>
                            <span className='w-1 h-1 bg-red-500 rounded-full'></span>
                            {errors.name.message}
                          </p>
                        )}
                      </div>

                      {/* Email Field */}
                      <div className='space-y-3 group'>
                        <Label
                          htmlFor='email'
                          className='text-sm font-semibold text-gray-700 flex items-center gap-2 group-focus-within:text-indigo-600 transition-colors'
                        >
                          <Mail className='w-4 h-4' />
                          Địa chỉ email *
                        </Label>
                        <div className='relative'>
                          <Input
                            {...register('email')}
                            id='email'
                            type='email'
                            className='h-14 pl-4 pr-4 border-2 border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 rounded-xl transition-all duration-300 bg-gray-50/50 hover:bg-white group-focus-within:bg-white text-lg'
                            placeholder='your@email.com'
                          />
                          <div className='absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/0 via-purple-500/0 to-pink-500/0 group-focus-within:from-indigo-500/5 group-focus-within:via-purple-500/5 group-focus-within:to-pink-500/5 transition-all duration-300 pointer-events-none'></div>
                        </div>
                        {errors.email && (
                          <p className='text-sm text-red-500 flex items-center gap-1 animate-shake'>
                            <span className='w-1 h-1 bg-red-500 rounded-full'></span>
                            {errors.email.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Phone Field */}
                    <div className='space-y-3 group'>
                      <Label
                        htmlFor='phone'
                        className='text-sm font-semibold text-gray-700 flex items-center gap-2 group-focus-within:text-indigo-600 transition-colors'
                      >
                        <Phone className='w-4 h-4' />
                        Số điện thoại *
                      </Label>
                      <div className='relative'>
                        <Input
                          {...register('phone')}
                          id='phone'
                          className='h-14 pl-4 pr-4 border-2 border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 rounded-xl transition-all duration-300 bg-gray-50/50 hover:bg-white group-focus-within:bg-white text-lg'
                          placeholder='+84 123 456 789'
                        />
                        <div className='absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/0 via-purple-500/0 to-pink-500/0 group-focus-within:from-indigo-500/5 group-focus-within:via-purple-500/5 group-focus-within:to-pink-500/5 transition-all duration-300 pointer-events-none'></div>
                      </div>
                      {errors.phone && (
                        <p className='text-sm text-red-500 flex items-center gap-1 animate-shake'>
                          <span className='w-1 h-1 bg-red-500 rounded-full'></span>
                          {errors.phone.message}
                        </p>
                      )}
                    </div>

                    {/* Message Field */}
                    <div className='space-y-3 group'>
                      <Label
                        htmlFor='message'
                        className='text-sm font-semibold text-gray-700 flex items-center gap-2 group-focus-within:text-indigo-600 transition-colors'
                      >
                        <MessageSquare className='w-4 h-4' />
                        Tin nhắn của bạn *
                      </Label>
                      <div className='relative'>
                        <Textarea
                          {...register('message')}
                          id='message'
                          rows={6}
                          className='pl-4 pr-4 py-4 border-2 border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 rounded-xl transition-all duration-300 bg-gray-50/50 hover:bg-white group-focus-within:bg-white resize-none text-lg'
                          placeholder='Hãy chia sẻ với chúng tôi về dự án, ý tưởng hoặc bất kỳ điều gì bạn muốn thảo luận...'
                        />
                        <div className='absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/0 via-purple-500/0 to-pink-500/0 group-focus-within:from-indigo-500/5 group-focus-within:via-purple-500/5 group-focus-within:to-pink-500/5 transition-all duration-300 pointer-events-none'></div>
                      </div>
                      {errors.message && (
                        <p className='text-sm text-red-500 flex items-center gap-1 animate-shake'>
                          <span className='w-1 h-1 bg-red-500 rounded-full'></span>
                          {errors.message.message}
                        </p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <button
                      type='submit'
                      disabled={isSubmitting}
                      className={`group relative w-full h-16 rounded-2xl font-bold text-lg text-white transition-all duration-500 transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-indigo-500/30 overflow-hidden ${
                        isSubmitting
                          ? 'bg-gray-400 cursor-not-allowed'
                          : isSuccess
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-2xl shadow-green-500/25'
                            : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 shadow-2xl shadow-indigo-500/25 hover:shadow-purple-500/25'
                      }`}
                    >
                      <div className='absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000'></div>

                      <div className='relative flex items-center justify-center gap-3'>
                        {isSubmitting ? (
                          <>
                            <div className='w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                            Đang gửi tin nhắn...
                          </>
                        ) : isSuccess ? (
                          <>
                            <CheckCircle className='w-6 h-6 animate-bounce' />
                            Gửi thành công! 🎉
                          </>
                        ) : (
                          <>
                            <Send className='w-6 h-6 group-hover:translate-x-1 transition-transform duration-300' />
                            Gửi tin nhắn ngay
                            <ArrowRight className='w-5 h-5 group-hover:translate-x-1 transition-transform duration-300' />
                          </>
                        )}
                      </div>
                    </button>

                    {/* Privacy Note */}
                    <div className='pt-6 border-t border-gray-100'>
                      <p className='text-sm text-gray-500 text-center leading-relaxed'>
                        🔒 Thông tin của bạn được bảo mật tuyệt đối. Chúng tôi cam kết không chia sẻ dữ liệu với bên thứ
                        ba.
                        <br />
                        Bằng cách gửi form, bạn đồng ý với{' '}
                        <a href='#' className='text-indigo-600 hover:text-indigo-700 underline font-medium'>
                          điều khoản sử dụng
                        </a>{' '}
                        và{' '}
                        <a href='#' className='text-indigo-600 hover:text-indigo-700 underline font-medium'>
                          chính sách bảo mật
                        </a>
                      </p>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}