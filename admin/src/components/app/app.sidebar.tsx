import {
  ApartmentOutlined,
  CarOutlined,
  CodeOutlined,
  CommentOutlined,
  ContactsOutlined,
  ControlOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  FileImageOutlined,
  IdcardOutlined,
  InsertRowRightOutlined,
  LogoutOutlined,
  OrderedListOutlined,
  PercentageOutlined,
  ProductOutlined,
  StarOutlined,
  ThunderboltOutlined,
  UserOutlined
} from '@ant-design/icons'
import { Button, Menu, MenuProps } from 'antd'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { setStateSignout } from '@/redux/slices/auth.slice'
import { signoutAPI } from '@/services/auth-service/auth.apis'
import { useMutation } from '@tanstack/react-query'
import { message, Popconfirm, PopconfirmProps } from 'antd'
import Sider from 'antd/es/layout/Sider'
import { Link, useLocation, useNavigate } from 'react-router'

const items: MenuProps['items'] = [
  {
    key: 'overview',
    type: 'group',
    label: 'Tổng quan',
    children: [
      {
        key: '/',
        icon: <DashboardOutlined />,
        label: <Link to={'/'}>Thống kê</Link>
      },
      {
        key: '/media',
        icon: <FileImageOutlined />,
        label: <Link to={'/media'}>Media</Link>
      },
    ]
  },
  {
    key: 'management',
    type: 'group',
    label: 'Sản phẩm',
    children: [
      {
        key: '/products',
        icon: <ProductOutlined />,
        label: <Link to={'/products'}>Sản phẩm</Link>,
      },
      {
        key: '/attributes',
        icon: <ApartmentOutlined />,
        label: <Link to={'/attributes'}>Thuộc tính</Link>
      },
      {
        key: '/categories',
        icon: <DatabaseOutlined />,
        label: <Link to={'/categories'}>Danh mục</Link>
      },
      {
        key: '/brand',
        icon: <IdcardOutlined />,
        label: <Link to={'/brand'}>Thương hiệu</Link>
      },
    ]
  },
  {
    key: 'order',
    type: 'group',
    label: 'Bán hàng',
    children: [
      {
        key: '/orderitems',
        icon: <OrderedListOutlined />,
        label: <Link to={'/orderitems'}>Đơn hàng</Link>
      },
      {
        key: '/reviews',
        icon: <StarOutlined />,
        label: <Link to={'/reviews'}>Đánh giá</Link>
      },
      {
        key: '/discounts',
        icon: <PercentageOutlined />,
        label: <Link to={'/discounts'}>Mã giảm giá</Link>
      },
      {
        key: '/flash-sales',
        icon: <ThunderboltOutlined />,
        label: <Link to={'/flash-sales'}>Flash Sale</Link>
      },
      {
        key: '/shipping',
        icon: <CarOutlined />,
        label: <Link to={'/shipping'}>Vận chuyển</Link>
      },
    ]
  },
  {
    key: 'auth',
    type: 'group',
    label: 'Tài khoản',
    children: [
      {
        key: '/users',
        icon: <UserOutlined />,
        label: <Link to={'/users'} style={{ color: 'inherit' }}>Khách hàng</Link>
      },
      {
        key: '/roles',
        icon: <ControlOutlined />,
        label: <Link to={'/roles'}>Vai trò</Link>
      },
    ]
  },
  {
    key: '/settings',
    type: 'group',
    label:  'khác',
    children: [
      {
        key: '/blogs',
        icon: <CodeOutlined />,
        label: <Link to={'/blogs'}>Bài viết</Link>
      },
      {
        key: '/cateblog',
        icon: <ProductOutlined />,
        label: <Link to={'/cateblog'} style={{ color: 'inherit' }}>Danh mục bài viết</Link>
      },
      {
        key: '/notification',
        icon: <CommentOutlined />,
        label: <Link to={'/notification'}>Thông báo</Link>
      },
      {
        key: '/contact',
        icon: <ContactsOutlined />,
        label: <Link to={'/contact'}>Liên hệ</Link>
      },
    ]
  }
]


const AppSidebar = () => {
  const isOpenDrawer = useAppSelector((state) => state.app.isOpenDrawer)
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const signoutMutation = useMutation({
    mutationFn: async () => {
      const res = await signoutAPI()
      if (res.data) {
        dispatch(setStateSignout())
        navigate('/signin')
      }
    },
    onSuccess: () => {
      message.success('Đăng xuất thành công')
    },
    onError: (error) => {
      message.error(`Đăng xuất thất bại: ${error.message}`)
    }
  })

  const confirm: PopconfirmProps['onConfirm'] = () => {
    signoutMutation.mutate()
  };

  const cancel: PopconfirmProps['onCancel'] = () => {
    message.error('Click on No');
  };

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={!isOpenDrawer}
      width={240}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'sticky',
        insetInlineStart: 0,
        top: 0,
        bottom: 0,
        scrollbarWidth: 'thin',
        scrollbarGutter: 'stable',
      }}
    >
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        padding: '0 0 20px 0',
      }}>
        <section>

          <Menu
            theme='dark'
            mode='inline'
            selectedKeys={[location.pathname]}
            defaultSelectedKeys={['/']}
            items={items}
          />
        </section>

        <section style={{ margin: '0 10px' }}>
          <Popconfirm
            title="Đăng xuất"
            description="Bạn có chắc chắn muốn đăng xuất không?"
            onConfirm={confirm}
            onCancel={cancel}
            okText="Có"
            cancelText="Không"
          >
          <Button type="primary" icon={<LogoutOutlined />} style={{ width: '100%' }}>Đăng xuất</Button>
          </Popconfirm>
        </section>
      </div>
    </Sider>
  )
}

export default AppSidebar
