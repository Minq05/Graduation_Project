
import {
  Card,
  Avatar,
  Descriptions,
  Button,
  Tag,
  Space,
  Statistic,
  Row,
  Col,
  Timeline,
  Table,
  Dropdown,
  Modal,
  message,
  Drawer
} from 'antd'
import {
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  LockOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { convertTimeVietnam } from '@/utils/utils'
import { ColumnsType } from 'antd/es/table'
import { fetchOrderByUser } from '@/services/user-service/user.apis'
import { useEffect, useState } from 'react'

// Mock user data
const userData = {
  id: 'USR-001',
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1 (555) 123-4567',
  avatar: '/placeholder.svg?height=120&width=120',
  status: 'active',
  role: 'Premium User',
  joinDate: '2023-01-15',
  lastLogin: '2024-01-20 14:30:00',
  location: 'New York, USA',
  verified: true,
  totalOrders: 45,
  totalSpent: 2850.5,
  loyaltyPoints: 1250,
}

// Mock activity data
const activityData = [
  {
    key: '1',
    action: 'Login',
    timestamp: '2024-01-20 14:30:00',
    ip: '192.168.1.1',
    device: 'Chrome on Windows',
  },
  {
    key: '2',
    action: 'Purchase',
    timestamp: '2024-01-19 10:15:00',
    ip: '192.168.1.1',
    device: 'Mobile Safari',
  },
  {
    key: '3',
    action: 'Profile Update',
    timestamp: '2024-01-18 16:45:00',
    ip: '192.168.1.1',
    device: 'Chrome on Windows',
  },
]

const activityColumns: ColumnsType<any> = [
  {
    title: 'Action',
    dataIndex: 'action',
    key: 'action'
  },
  {
    title: 'Timestamp',
    dataIndex: 'timestamp',
    key: 'timestamp'
  },
  {
    title: 'IP Address',
    dataIndex: 'ip',
    key: 'ip'
  },
  {
    title: 'Device',
    dataIndex: 'device',
    key: 'device'
  }
]

interface IProps {
  isDrawerOpen: boolean
  selectedUser: IUser | null
  setIsDrawerOpen: (open: boolean) => void
}
const DetailDrawer = (props: IProps) => {
  const { isDrawerOpen, setIsDrawerOpen, selectedUser } = props
  const [messageApi, contextHolder] = message.useMessage()
  const [listOrderByUser, setListOrderByUser] = useState<any>(null)

  useEffect(() => {
    (async () => {
      if (selectedUser?._id) {
        try {
          const res = await fetchOrderByUser(selectedUser._id)
          setListOrderByUser(res.data)
        } catch (error) {
          messageApi.error('Không thể lấy danh sách đơn hàng của người dùng')
        }
      }
    })()
  }, [selectedUser?._id])

  const handleEdit = () => {
    messageApi.info('Edit user functionality would be implemented here')
  }

  const handleSuspend = () => {
    Modal.confirm({
      title: 'Suspend User',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to suspend this user?',
      okText: 'Yes, Suspend',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk() {
        messageApi.success('User suspended successfully')
      }
    })
  }

  const handleDelete = () => {
    Modal.confirm({
      title: 'Delete User',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to permanently delete this user? This action cannot be undone.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk() {
        messageApi.success('User deleted successfully')
      }
    })
  }

  const moreMenuItems: MenuProps['items'] = [
    {
      key: 'reset-password',
      label: 'Reset Password',
      icon: <LockOutlined />
    },
    {
      key: 'send-email',
      label: 'Send Email',
      icon: <MailOutlined />
    },
    {
      key: 'view-orders',
      label: 'View Orders'
    },
    {
      type: 'divider'
    },
    {
      key: 'suspend',
      label: 'Suspend User',
      icon: <LockOutlined />,
      danger: true,
      onClick: handleSuspend
    }
  ]

  return (
    <Drawer
      title="Thông tin người dùng"
      width={'90%'}
      closable={{ 'aria-label': 'Close Button' }}
      onClose={() => setIsDrawerOpen(false)}
      open={isDrawerOpen}
    >
      <div className=''>
        {contextHolder}
        <div className=''>
          {/* Header */}
          <div className='mb-6'>
            <div className='flex items-center justify-between'>
              <div>
                <h1 className='text-2xl font-bold text-gray-900 mb-2'>Thông tin người dùng</h1>
                <p className='text-gray-600'>Quản lý thông tin và cài đặt tài khoản người dùng</p>
              </div>
              <Space>
                <Button type='primary' icon={<EditOutlined />} onClick={handleEdit}>
                  Chỉnh sửa người dùng
                </Button>
                <Dropdown menu={{ items: moreMenuItems }} placement='bottomRight'>
                  <Button icon={<MoreOutlined />} />
                </Dropdown>
              </Space>
            </div>
          </div>

          <Row gutter={[24, 24]}>
            {/* User Profile Card */}
            <Col xs={24} lg={8}>
              <Card className='h-fit'>
                <div className='text-center mb-6'>
                  <Avatar size={120} src={selectedUser?.avatar} icon={<UserOutlined />} className='mb-4' />
                  <h2 className='text-xl font-semibold mb-2'>{selectedUser?.fullName}</h2>
                  <div className='flex items-center justify-center gap-2 mb-2'>
                    <Tag color={selectedUser?.status === 'active' ? 'green' : 'red'}>{selectedUser?.status?.toUpperCase()}</Tag>
                    {selectedUser?.isVerified && <Tag color='blue'>VERIFIED</Tag>}
                  </div>
                  <p className='text-gray-600'>{selectedUser?.role}</p>
                </div>

                <div className='space-y-3'>
                  <div className='flex items-center gap-2'>
                    <MailOutlined className='text-gray-400' />
                    <span className='text-sm'>{selectedUser?.email}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <PhoneOutlined className='text-gray-400' />
                    <span className='text-sm'>{selectedUser?.phone ? `+84 ${selectedUser?.phone}` : '+84'}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <CalendarOutlined className='text-gray-400' />
                    <span className='text-sm'>{convertTimeVietnam(selectedUser?.createdAt as unknown as string)}</span>
                  </div>
                </div>

                <div className='mt-6 pt-6 border-t border-gray-200'>
                  <Button danger block icon={<DeleteOutlined />} onClick={handleDelete}>
                    Xóa tài khoản
                  </Button>
                </div>
              </Card>
            </Col>

            {/* Main Content */}
            <Col xs={24} lg={16}>
              <div className='space-y-6'>
                {/* Statistics */}
                <Card title='Thống kê người dùng' className='w-full'>
                  <Row gutter={16}>
                    <Col xs={12} sm={8}>
                      <Statistic title='Tổng đơn hàng' value={listOrderByUser && listOrderByUser?.meta.total} className='text-center' />
                    </Col>
                    <Col xs={12} sm={8}>
                      <Statistic
                        title='Tổng chi tiêu'
                        value={userData.totalSpent}
                        prefix='$'
                        precision={2}
                        className='text-center'
                      />
                    </Col>
                  </Row>
                </Card>

                {/* User Details */}
                <Card title='Thông tin người dùng' className='w-full'>
                  <Descriptions column={{ xs: 1, sm: 2 }} bordered>
                    <Descriptions.Item label='ID'>{selectedUser?._id}</Descriptions.Item>
                    <Descriptions.Item label='Họ tên'>{selectedUser?.fullName}</Descriptions.Item>
                    <Descriptions.Item label='Email'>{selectedUser?.email}</Descriptions.Item>
                    <Descriptions.Item label='Điện thoại'>{selectedUser?.phone}</Descriptions.Item>
                    <Descriptions.Item label='Địa điểm'>{selectedUser?.address}</Descriptions.Item>
                    <Descriptions.Item label='Trạng thái tài khoản'>
                      <Tag color={selectedUser?.status === 'active' ? 'green' : 'red'}>{selectedUser?.status && selectedUser?.status.toUpperCase()}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label='Email Verified'>
                      <Tag color={selectedUser?.isVerified ? 'green' : 'orange'}>
                        {selectedUser?.isVerified ? 'VERIFIED' : 'PENDING'}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label='Vai trò'>{selectedUser?.role}</Descriptions.Item>
                    <Descriptions.Item label='Ngày tạo'>{selectedUser?.createdAt}</Descriptions.Item>
                    <Descriptions.Item label='Đăng nhập cuối'>{selectedUser?.updatedAt}</Descriptions.Item>
                  </Descriptions>
                </Card>

                {/* Recent Activity */}
                <Card title='Hoạt động gần đây' className='w-full'>
                  <Table columns={activityColumns} dataSource={activityData} pagination={false} size='small' />
                </Card>

                {/* Account Timeline */}
                <Card title='Timeline tài khoản' className='w-full'>
                  <Timeline
                    items={[
                      {
                        children: 'User logged in from new device',
                        color: 'blue'
                      },
                      {
                        children: 'Made a purchase - Order #12345',
                        color: 'green'
                      },
                      {
                        children: 'Updated profile information',
                        color: 'orange'
                      },
                      {
                        children: 'Account created and verified',
                        color: 'green'
                      }
                    ]}
                  />
                </Card>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </Drawer>
  )
}

export default DetailDrawer
