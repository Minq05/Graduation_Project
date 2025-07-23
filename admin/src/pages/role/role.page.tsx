import { useState } from 'react'
import { Table, Button, Modal, Form, Input, Checkbox, Tabs, Tag, message, Space, Tooltip, Select, Switch } from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  LockOutlined,
  UserOutlined,
  SaveOutlined
} from '@ant-design/icons'
import type { TabsProps } from 'antd'

// Mock data for roles
const initialRoles: IRole[] = [
  {
    _id: '1',
    name: 'Administrator',
    description: 'Full system access',
    isPublic: true,
    permissions: [
      'users:read',
      'users:write',
      'users:delete',
      'roles:read',
      'roles:write',
      'roles:delete',
      'settings:read',
      'settings:write'
    ]
  },
  {
    _id: '2',
    name: 'Manager',
    isPublic: true,
    description: 'Can manage users and content',
    permissions: ['users:read', 'users:write', 'roles:read', 'settings:read']
  },
  {
    _id: '3',
    name: 'Editor',
    isPublic: true,
    description: 'Can edit content only',
    permissions: ['users:read', 'settings:read']
  },
  {
    _id: '4',
    name: 'Viewer',
    isPublic: true,
    description: 'Read-only access',
    permissions: ['users:read']
  }
]

// Mock data for permissions
const permissionGroups = [
  {
    group: 'User Management',
    permissions: [
      { id: 'users:read', name: 'View Users', description: 'Can view user profiles and information' },
      { id: 'users:write', name: 'Edit Users', description: 'Can create and edit user accounts' },
      { id: 'users:delete', name: 'Delete Users', description: 'Can delete user accounts' }
    ]
  },
  {
    group: 'Role Management',
    permissions: [
      { id: 'roles:read', name: 'View Roles', description: 'Can view roles and permissions' },
      { id: 'roles:write', name: 'Edit Roles', description: 'Can create and edit roles' },
      { id: 'roles:delete', name: 'Delete Roles', description: 'Can delete roles' }
    ]
  },
  {
    group: 'System Settings',
    permissions: [
      { id: 'settings:read', name: 'View Settings', description: 'Can view system settings' },
      { id: 'settings:write', name: 'Edit Settings', description: 'Can modify system settings' }
    ]
  }
]

const RolePage = () => {
  const [roles, setRoles] = useState(initialRoles)
  const [isRoleModalVisible, setIsRoleModalVisible] = useState(false)
  const [isPermissionModalVisible, setIsPermissionModalVisible] = useState(false)
  const [currentRole, setCurrentRole] = useState<IRole | null>(null)
  const [form] = Form.useForm()
  const [permissionForm] = Form.useForm()
  const [messageApi, contextHolder] = message.useMessage()
  const { confirm } = Modal

  // Role table columns
  const columns = [
    {
      title: 'Tên vai trò',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <span className='font-medium'>{text}</span>
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isPublic',
      key: 'isPublic',
      render: (isPublic: boolean, record: IRole) => (
        <Switch
          checkedChildren="Công khai"
          unCheckedChildren="Riêng tư"
          checked={isPublic}
          onChange={(checked) => handleUpdateStatus(record._id, checked)}
        />
      )
    },
    {
      title: 'Quyền hạn',
      key: 'permissions',
      dataIndex: 'permissions',
      render: (permissions: string[]) => (
        <div>
          {permissions.length > 0 ? (
            <Tag color='green' className='rounded-full px-2'>
              {permissions.length} {permissions.length === 1 ? 'permission' : 'permissions'}
            </Tag>
          ) : (
            <Tag color='red' className='rounded-full px-2'>
              Không có quyền hạn
            </Tag>
          )}
        </div>
      )
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: IRole, record: IRole) => (
        <Space size='middle'>
          <Tooltip title='Cập nhật vai trò'>
            <Button
              icon={<EditOutlined />}
              onClick={() => showEditRoleModal(record)}
              className='text-blue-600 border-blue-600 hover:text-blue-500 hover:border-blue-500'
            />
          </Tooltip>
          <Tooltip title='Quản lý quyền'>
            <Button
              icon={<LockOutlined />}
              onClick={() => showPermissionModal(record)}
              className='text-green-600 border-green-600 hover:text-green-500 hover:border-green-500'
            />
          </Tooltip>
          <Tooltip title='Xóa vai trò'>
            <Button
              icon={<DeleteOutlined />}
              onClick={() => showDeleteConfirm(record)}
              className='text-red-600 border-red-600 hover:text-red-500 hover:border-red-500'
            />
          </Tooltip>
        </Space>
      )
    }
  ]

  const handleUpdateStatus = (id: string, isPublic: boolean) => {
    // eslint-disable-next-line no-console
    console.log('🚀 ~ handleUpdateStatus ~ id:', id)
    // eslint-disable-next-line no-console
    console.log('🚀 ~ handleUpdateStatus ~ isPublic:', isPublic)
  }

  // Show modal to add a new role
  const showAddRoleModal = () => {
    setCurrentRole(null)
    form.resetFields()
    setIsRoleModalVisible(true)
  }

  // Show modal to edit an existing role
  const showEditRoleModal = (role: IRole) => {
    setCurrentRole(role)
    form.setFieldsValue({
      name: role.name,
      isPublic: role.isPublic,
      description: role.description
    })
    setIsRoleModalVisible(true)
  }

  // Show modal to manage permissions for a role
  const showPermissionModal = (role: IRole) => {
    setCurrentRole(role)
    permissionForm.setFieldsValue({
      permissions: role.permissions
    })
    setIsPermissionModalVisible(true)
  }

  // Handle role form submission
  const handleRoleFormSubmit = () => {
    form.validateFields().then((values) => {
      if (currentRole) {
        // Update existing role
        // eslint-disable-next-line no-console
        console.log('🚀 ~ form.validateFields ~ values:', values)
        messageApi.success('Role updated successfully')
      } else {
        // Create role
        // eslint-disable-next-line no-console
        console.log('🚀 ~ form.validateFields ~ values:', values)
        messageApi.success('Role created successfully')
      }
      setIsRoleModalVisible(false)
    })
  }

  // Handle permission form submission
  const handlePermissionFormSubmit = () => {
    permissionForm.validateFields().then((values) => {
      const updatedRoles = roles.map((role) =>
        role._id === currentRole?._id ? { ...role, permissions: values.permissions || [] } : role
      )
      setRoles(updatedRoles)
      setIsPermissionModalVisible(false)
      messageApi.success('Permissions updated successfully')
    })
  }

  // Show delete confirmation
  const showDeleteConfirm = (role: IRole) => {
    confirm({
      title: `Xác nhận xóa vai trò '${role.name}'?`,
      icon: <ExclamationCircleOutlined />,
      content: 'Bạn có chắc chắn muốn xóa vai trò này không?',
      okText: 'Xác nhận',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk() {
        const updatedRoles = roles.filter((r) => r._id !== role._id)
        setRoles(updatedRoles)
        messageApi.success('Role deleted successfully')
      }
    })
  }

  // Tab items for the permission modal
  const permissionTabItems: TabsProps['items'] = permissionGroups.map((group) => {
    return {
      key: group.group,
      label: group.group,
      children: (
        <Form.Item name='permissions' className='m-0'>
          <Checkbox.Group className='w-full'>
            <div className='grid grid-cols-1 gap-4'>
              {group.permissions.map((permission) => (
                <div key={permission.id} className='border rounded-lg p-4 hover:bg-gray-50'>
                  <Checkbox value={permission.id} className='w-full'>
                    <div>
                      <div className='font-medium'>{permission.name}</div>
                      <div className='text-gray-500 text-sm'>{permission.description}</div>
                    </div>
                  </Checkbox>
                </div>
              ))}
            </div>
          </Checkbox.Group>
        </Form.Item>
      )
    }
  })

  return (
    <div>
      {contextHolder}

      <div className='flex justify-between items-center mb-6'>
        <div>
          <h1 className='text-2xl font-bold'>Quản lý vai trò</h1>
          <p className='text-gray-500'>Quản lý vai trò và quyền cho người dùng trong hệ thống</p>
        </div>
        <Button
          type='primary'
          icon={<PlusOutlined />}
          onClick={showAddRoleModal}
          className='bg-blue-600 hover:bg-blue-500'
        >
          Tạo vai trò
        </Button>
      </div>

      <div className='bg-white rounded-lg shadow'>
        <Table
          columns={columns}
          dataSource={roles}
          rowKey='_id'
          pagination={false}
          className='rounded-lg overflow-hidden'
        />
      </div>

      {/* Role Modal */}
      <Modal
        title={currentRole ? 'Cập nhật vai trò' : 'Thêm vai trò'}
        open={isRoleModalVisible}
        onCancel={() => setIsRoleModalVisible(false)}
        footer={[
          <Button key='cancel' onClick={() => setIsRoleModalVisible(false)}>
            Hủy
          </Button>,
          <Button key='submit' type='primary' onClick={handleRoleFormSubmit} className='bg-blue-600 hover:bg-blue-500'>
            {currentRole ? 'Cập nhật' : 'Tạo mới'}
          </Button>
        ]}
      >
        <Form form={form} layout='vertical' className='mt-4' initialValues={{ isPublic: true }}>
          <Form.Item name='name' label='Tên vai trò' rules={[{ required: true, message: 'Tên vai trò không được để trống!' }]}>
            <Input prefix={<UserOutlined />} placeholder='Nhập tên vai trò' />
          </Form.Item>
          <Form.Item name='isPublic' label='Trạng thái' rules={[{ required: true, message: 'Trạng thái không được để trống!' }]}>
            <Select
              prefix={<LockOutlined />}
              style={{ width: '100%' }}
              options={[
                { value: true, label: 'Công khai' },
                { value: false, label: 'Riêng tư' }
              ]}
            />
          </Form.Item>
          <Form.Item
            name='description'
            label='Mô tả'
          >
            <Input.TextArea rows={3} placeholder='Nhập mô tả vai trò' />
          </Form.Item>
        </Form>
      </Modal>

      {/* Permissions Modal */}
      <Modal
        title={`Quản lý quyền hạn: ${currentRole?.name}`}
        open={isPermissionModalVisible}
        onCancel={() => setIsPermissionModalVisible(false)}
        width={700}
        footer={[
          <Button key='cancel' onClick={() => setIsPermissionModalVisible(false)}>
            Hủy
          </Button>,
          <Button
            key='submit'
            type='primary'
            onClick={handlePermissionFormSubmit}
            icon={<SaveOutlined />}
            className='bg-green-600 hover:bg-green-500'
          >
            Lưu
          </Button>
        ]}
      >
        <Form form={permissionForm} layout='vertical' className='mt-4'>
          <Tabs defaultActiveKey={permissionGroups[0].group} items={permissionTabItems} />
        </Form>
      </Modal>
    </div>
  )
}

export default RolePage
