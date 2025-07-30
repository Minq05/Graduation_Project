import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import {
  ChevronRightIcon,
  HeartIcon,
  LogOutIcon,
  PackageIcon,
  UserIcon,
  MenuIcon
} from 'lucide-react'
import { Outlet, useParams, useNavigate, useLocation } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { fetchUserAPI } from '@/services/user-service/user.apis'
import { signoutAPI } from '@/services/auth-service/auth.apis'
import { useAppDispatch } from '@/redux/hooks'
import { setSignout } from '@/redux/slices/auth.slice'
import { toast } from 'react-toastify'
import { useState } from 'react'

const LayoutAccountPage = () => {
  const { id } = useParams<{ id: string }>()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()

  // Xác định tiêu đề theo pathname
  const getCurrentTitle = () => {
    if (location.pathname.includes('/order')) return 'Đơn hàng của tôi'
    if (location.pathname.includes('/favorite')) return 'Sản phẩm yêu thích'
    if (location.pathname === `/account/${id}`) return 'Thông tin tài khoản'
    return ''
  }

  const isActiveTab = (tabKey: string) => location.pathname.includes(tabKey)

  const menuItems = [
    {
      key: 'order',
      to: `/account/${id}/order`,
      icon: <PackageIcon className="w-5 h-5 text-purple-700" />,
      label: 'Đơn hàng của tôi'
    },
    {
      key: 'favorite',
      to: `/account/${id}/wishlist`,
      icon: <HeartIcon className="w-5 h-5 text-purple-700" />,
      label: 'Sản phẩm yêu thích'
    },
    {
      key: 'info',
      to: `/account/${id}`,
      icon: <UserIcon className="w-5 h-5 text-purple-700" />,
      label: 'Thông tin tài khoản'
    },
    {
      key: 'signout',
      icon: <LogOutIcon className="w-5 h-5 text-purple-700" />,
      label: 'Đăng xuất'
    }
  ]

  const handleSignout = async () => {
    try {
      await signoutAPI()
      dispatch(setSignout())
      toast.success('Đăng xuất thành công!')
      navigate('/auth/signin')
    } catch (error) {
      dispatch(setSignout())
      toast.success('Đăng xuất thành công!')
      navigate('/auth/signin')
    }
  }

  const { data: userInfo } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const res = await fetchUserAPI(id as string)
      if (res.data) return res.data
      toast.error('Đã có lỗi xảy ra!')
    }
  })

  return (
    <div className="bg-white flex flex-row justify-center w-full min-h-screen">
      <div className="bg-white w-full max-w-[1440px] relative">
        {/* Breadcrumb */}
        <Breadcrumb className="mt-4 md:mt-10 mx-4 md:ml-[101px] hidden sm:block">
          <BreadcrumbList className="flex items-center gap-[15px]">
            <BreadcrumbItem>
              <BreadcrumbLink className="font-medium text-[#807d7e] text-sm md:text-lg">
                Trang chủ
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRightIcon className="w-[5px] h-[10.14px] text-[#807d7e]" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink className="font-medium text-[#807d7e] text-sm md:text-lg">
                Tài khoản
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRightIcon className="w-[5px] h-[10.14px] text-[#807d7e]" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink className="font-medium text-[#3c4242] text-sm md:text-lg">
                {getCurrentTitle()}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Mobile Header */}
        <div className="sm:hidden flex justify-between items-center p-4 border-b">
          <h1 className="font-bold text-[#3c4242] text-xl tracking-[0.56px] leading-[33.5px]">
            {getCurrentTitle()}
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden"
          >
            <MenuIcon className="w-6 h-6" />
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row mt-4 md:mt-[50px] gap-6 lg:gap-0">
          {/* Sidebar */}
          <div
            className={`w-full lg:w-[304px] mx-4 lg:ml-[101px] lg:mx-0 ${
              isMobileMenuOpen ? 'block' : 'hidden'
            } lg:block`}
          >
            {/* Greeting */}
            <div className="relative mb-5 p-4 lg:p-0">
              <div className="absolute w-1.5 h-7 bg-[#8a33fd] rounded-[10px] hidden lg:block" />
              <h2 className="lg:ml-[21px] font-bold text-[#3c4242] text-xl md:text-[28px] tracking-[0.56px] leading-[33.5px]">
                Xin chào {userInfo?.fullName || 'Admin'}
              </h2>
              <p className="lg:ml-[21px] font-normal text-[#807d7e] text-sm tracking-[0.28px] leading-[33.5px]">
                Chào mừng bạn đến với tài khoản của mình
              </p>
            </div>

            {/* Menu */}
            <nav className="mt-6 lg:mt-10">
              <ul className="space-y-3 lg:space-y-5">
                {menuItems.map((item, index) => (
                  <li key={index}>
                    <div
                      className={`flex items-center gap-[15px] p-3 lg:p-2 rounded-lg lg:rounded-none cursor-pointer hover:bg-gray-50 transition-colors ${
                        isActiveTab(item.key)
                          ? 'bg-gray-100 lg:bg-[url(/rectangle-748.svg)] lg:bg-[100%_100%] border-l-2 border-purple-600'
                          : ''
                      }`}
                      onClick={() => {
                        setIsMobileMenuOpen(false)
                        if (item.key === 'signout') {
                          handleSignout()
                        } else if (item.to) {
                          navigate(item.to)
                        }
                      }}
                    >
                      {item.icon}
                      <span className="font-semibold text-[#807d7e] text-base lg:text-lg">
                        {item.label}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Main content */}
          <div className="flex-1 mx-4 lg:ml-10 lg:mr-[101px]">
            <h1 className="font-bold text-[#3c4242] text-xl md:text-[28px] tracking-[0.56px] leading-[33.5px] text-center lg:text-left mb-4">
              {getCurrentTitle()}
            </h1>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}

export default LayoutAccountPage
