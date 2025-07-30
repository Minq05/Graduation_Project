
import { useEffect, useMemo, useState } from 'react'
import {
  Table,
  Card,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Avatar,
  Form,
  Statistic,
  Row,
  Col,
  message,
  Popconfirm,
  Badge,
  Tooltip,
} from 'antd'
import {
  UserOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  TeamOutlined,
  UserDeleteOutlined,
  ExportOutlined,
  ReloadOutlined
} from '@ant-design/icons'
import debounce from 'debounce'
import type { ColumnsType } from 'antd/es/table'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { USER_QUERY_KEYS } from '@/services/user-service/user.keys'
import { deleteUser, getUserList, updateUser } from '@/services/user-service/user.apis'
import UpdateModal from './update.modal'
import DetailDrawer from './detail.drawer'

const { Search } = Input
const { Option } = Select

export default function AdminUserManagement() {
  const [searchText, setSearchText] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('')
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null)
  const [pagination, setPagination] = useState<IPagination>({ current: 1, pageSize: 10, total: 10 })
  const [form] = Form.useForm()

  const queryClient = useQueryClient()

  const { data: listUser, isLoading } = useQuery({
    queryKey: [USER_QUERY_KEYS.FETCH_ALL, pagination, searchText, selectedRole, selectedStatus],
    queryFn: async () => {
      const res = await getUserList({
        current: pagination.current,
        pageSize: pagination.pageSize,
        params: `keyword=${searchText}${selectedRole ? `&role=${selectedRole}` : ''}${selectedStatus ? `&status=${selectedStatus}` : ''}`
      })
      if (res.data) {
        setPagination({
          current: res.data.meta.current,
          pageSize: res.data.meta.pageSize,
          total: res.data.meta.total
        })
        return res.data.results
      }
    }
  })

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: IUserFormData }) => {
      const res = await updateUser(id, data)
      if (res.data) {
        message.success('Cập nhật người dùng thành công')
        return res.data
      } else {
        throw new Error('Cập nhật người dùng thất bại')
      }
    },
    onSuccess: () => {
      message.success('Cập nhật người dùng thành công')
      queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEYS.FETCH_ALL] })
      setIsModalVisible(false)
      form.resetFields()
      setSelectedUser(null)
    },
    onError: () => {
      message.error('Cập nhật người dùng thất bại')
    }
  })

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await deleteUser(userId)
      if (res.data) {
        message.success('Xóa người dùng thành công')
        return res.data
      } else {
        throw new Error('Xóa người dùng thất bại')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEYS.FETCH_ALL] })
      message.success('Xóa người dùng thành công')
    },
    onError: () => {
      message.error('Xóa người dùng thất bại')
    }
  })


  const getRoleColor = (role: string) => {
    switch (role) {
    case 'admin':
      return 'red'
    case 'moderator':
      return 'orange'
    case 'user':
      return 'blue'
    default:
      return 'default'
    }
  }

  const getRoleText = (role: string) => {
    switch (role) {
    case 'admin':
      return 'Quản trị viên'
    case 'moderator':
      return 'Điều hành viên'
    case 'user':
      return 'Người dùng'
    default:
      return role
    }
  }

  const handleEdit = (user: IUser) => {
    form.setFieldsValue(user)
    setIsModalVisible(true)
    setSelectedUser(user)
  }

  const handleDelete = (userId: string) => {
    deleteUserMutation.mutate(userId)
  }

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      updateUserMutation.mutate({ id: selectedUser?._id as string, data: values as IUserFormData })
    })
  }

  const handleReload = () => {
    queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEYS.FETCH_ALL] })
  }

  const handleViewDetails = (user: IUser) => {
    setSelectedUser(user)
    setIsDrawerOpen(true)
  }


  // Search functionality with debounce
  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setSearchText(value)
      }, 500),
    []
  )

  const handleChangeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    debouncedSearch(value)
  }

  useEffect(() => {
    return () => {
      debouncedSearch.clear()
    }
  }, [debouncedSearch])

  const columns: ColumnsType<IUser> = useMemo(() => [
    {
      title: 'Người dùng',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (text, record) => (
        <div className='flex items-center space-x-3'>
          <Avatar src={record.avatar} icon={<UserOutlined />} />
          <div className='ml-2'>
            <div className='font-medium text-gray-900 cursor-pointer' onClick={() => handleViewDetails(record)}>{text}</div>
            <div className='text-sm text-gray-500'>{record.email}</div>
          </div>
        </div>
      )
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone'
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role) => <Tag color={getRoleColor(role)}>{getRoleText(role)}</Tag>
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isVerified',
      key: 'isVerified',
      render: (isVerified) => (
        <Badge
          status={isVerified ? 'success' : 'error'}
          text={isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
        />
      )
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString('vi-VN')
    },
    {
      title: 'Đăng nhập cuối',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      render: (date) => (date === 'Chưa đăng nhập' ? date : new Date(date).toLocaleDateString('vi-VN'))
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Tooltip title='Xem chi tiết'>
            <Button type='text' icon={<EyeOutlined />} onClick={() => handleViewDetails(record)} />
          </Tooltip>
          <Tooltip title='Chỉnh sửa'>
            <Button type='text' icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          </Tooltip>
          <Popconfirm
            title='Xóa người dùng'
            description='Bạn có chắc chắn muốn xóa người dùng này?'
            onConfirm={() => handleDelete(record._id)}
            okText='Xóa'
            cancelText='Hủy'
          >
            <Tooltip title='Xóa'>
              <Button type='text' danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ], [])


  return (
    <div className=''>
      {/* Header */}
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-900 mb-2'>Quản lý người dùng</h1>
        <p className='text-gray-600'>Quản lý thông tin và quyền hạn của người dùng trong hệ thống</p>
      </div>

      {/* Statistics */}
      <Row gutter={16} className='mb-6'>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title='Tổng số người dùng'
              value={listUser?.length || 0}
              prefix={<TeamOutlined className='text-blue-500' />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title='Đang hoạt động'
              value={listUser?.filter((user: IUser) => user.isVerified).length || 0}
              prefix={<UserOutlined className='text-green-500' />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title='Không hoạt động'
              value={listUser?.filter((user: IUser) => !user.isVerified).length || 0}
              prefix={<UserDeleteOutlined className='text-orange-500' />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title='Bị cấm'
              value={listUser?.filter((user: IUser) => user.status === 'banned').length || 0}
              prefix={<UserDeleteOutlined className='text-red-500' />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters and Actions */}
      <Card className='mb-6'>
        <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
          <div className='flex flex-col sm:flex-row gap-4 flex-1'>
            <Search
              placeholder='Tìm kiếm theo tên hoặc email...'
              allowClear
              // value={searchText}
              onChange={handleChangeSearch}
              className='sm:w-80'
              prefix={<SearchOutlined />}
            />
            <Select value={selectedRole} onChange={setSelectedRole} className='w-full sm:w-40' placeholder='Vai trò'>
              <Option value=''>Tất cả vai trò</Option>
              <Option value='admin'>Quản trị viên</Option>
              <Option value='moderator'>Điều hành viên</Option>
              <Option value='user'>Người dùng</Option>
            </Select>
            <Select
              value={selectedStatus}
              onChange={setSelectedStatus}
              className='w-full sm:w-40'
              placeholder='Trạng thái'
            >
              <Option value=''>Tất cả trạng thái</Option>
              <Option value='active'>Hoạt động</Option>
              <Option value='inactive'>Không hoạt động</Option>
              <Option value='banned'>Bị cấm</Option>
            </Select>
          </div>
          <div className='flex gap-2'>
            <Button icon={<ReloadOutlined />} onClick={() => handleReload()}>
              Làm mới
            </Button>
            <Button icon={<ExportOutlined />}>Xuất Excel</Button>
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={listUser || []}
          rowKey='_id'
          loading={isLoading}
          pagination={{
            total: pagination.total,
            pageSize: pagination.pageSize,
            current: pagination.current,
            onChange: (page, pageSize) => setPagination({ current: page, pageSize, total: pagination.total }),
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} người dùng`
          }}
          scroll={{ x: 1200 }}
          className='overflow-hidden'
        />
      </Card>

      {/* Edit User Modal */}
      <UpdateModal
        isModalVisible={isModalVisible}
        handleModalOk={handleModalOk}
        setIsModalVisible={setIsModalVisible}
        form={form}
      />

      <DetailDrawer
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        selectedUser={selectedUser}
      />
    </div>
  )
}
