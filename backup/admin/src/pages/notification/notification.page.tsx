import {
  Table,
  Button,
  Space,
  message,
  Switch,
  Input,
  Form,
  Modal,
  Tooltip
} from 'antd'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { useState } from 'react'
import axios from '@/config/axios.customize'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

interface Notification {
  _id: string
  userId: string
  title: string
  content: string
  isRead: boolean
  createdAt: string
  updatedAt: string
  deletedAt?: string
  deleted: boolean
}

const NotificationList = () => {
  const queryClient = useQueryClient()
  const [searchText, setSearchText] = useState('')
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0
  })

  const [isModalVisible, setIsModalVisible] = useState(false)
  const [form] = Form.useForm()
  const [content, setContent] = useState('')

  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ color: [] }, { background: [] }],
      [{ align: [] }],
      ['link', 'image', 'video'],
      ['clean']
    ]
  }

  const fetchList = async ({
    page = 1,
    pageSize = 5,
    search = ''
  }): Promise<{ results: Notification[] }> => {
    let url = `/api/v1/notifications?current=${page}&pageSize=${pageSize}`
    if (search) {
      url += `&keyword=${encodeURIComponent(search)}`
    }
    const res = await axios.get(url)
    setPagination(prev => ({
      ...prev,
      total: res.data?.meta?.total || 0,
      current: res.data?.meta?.current || 1,
      pageSize: res.data?.meta?.pageSize || 5
    }))
    return {
      results: res.data?.results || []
    }
  }

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', pagination.current, pagination.pageSize, searchText],
    queryFn: () =>
      fetchList({
        page: pagination.current,
        pageSize: pagination.pageSize,
        search: searchText
      }),
    keepPreviousData: true
  })

  const statusMutation = useMutation({
    mutationFn: (variables: { id: string; isRead: boolean }) =>
      axios.patch(`/api/v1/notifications/${variables.id}`, {
        isRead: variables.isRead
      }),
    onSuccess: () => {
      message.success('Cập nhật trạng thái thành công')
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
    onError: () => {
      message.error('Cập nhật trạng thái thất bại')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`/api/v1/notifications/${id}`),
    onSuccess: () => {
      message.success('Xóa thông báo thành công')
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
    onError: () => {
      message.error('Xóa thông báo thất bại')
    }
  })

  const addMutation = useMutation({
    mutationFn: (data: any) => axios.post('/api/v1/notifications', data),
    onSuccess: () => {
      message.success('Thêm thông báo thành công!')
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      setIsModalVisible(false)
      form.resetFields()
      setContent('')
    },
    onError: () => {
      message.error('Thêm thông báo thất bại!')
    }
  })

  const showDeleteConfirm = (record: Notification) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: `Bạn có chắc chắn muốn xóa thông báo "${record.title}"?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: () => deleteMutation.mutate(record._id)
    })
  }

  const handleAdd = () => {
    form.validateFields().then(values => {
      addMutation.mutate({ ...values, content })
    })
  }

  const columns = [
    { title: 'Tiêu đề', dataIndex: 'title', key: 'title' },
    {
      title: 'Nội dung',
      dataIndex: 'content',
      key: 'content',
      render: (value: string) => <div dangerouslySetInnerHTML={{ __html: value }} />
    },
    {
      title: 'Đã đọc',
      dataIndex: 'isRead',
      key: 'isRead',
      render: (_: boolean, record: Notification) => (
        <Switch
          checked={record.isRead}
          onChange={checked =>
            statusMutation.mutate({ id: record._id, isRead: checked })
          }
          checkedChildren="Đã đọc"
          unCheckedChildren="Chưa đọc"
        />
      )
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString()
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: any, record: Notification) => (
        <Space size="middle">
          <Tooltip title="Xóa thông báo">
            <Button
              icon={<DeleteOutlined />}
              onClick={() => showDeleteConfirm(record)}
              className="text-red-600 border-red-600 hover:text-red-500 hover:border-red-500"
            />
          </Tooltip>
        </Space>
      )
    }
  ]

  return (
    <div style={{ padding: 24 }}>
      <h2>Danh sách thông báo</h2>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        style={{ marginBottom: 16, float: 'right' }}
        onClick={() => setIsModalVisible(true)}
      >
        Thêm thông báo
      </Button>

      <Form layout="inline" style={{ marginBottom: 16 }}>
        <Form.Item>
          <Input
            placeholder="Tìm kiếm tiêu đề"
            value={searchText}
            onChange={e => {
              setPagination(prev => ({ ...prev, current: 1 }))
              setSearchText(e.target.value)
            }}
            allowClear
          />
        </Form.Item>
      </Form>

      <Table
        rowKey="_id"
        columns={columns}
        dataSource={data?.results || []}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: (page, pageSize) =>
            setPagination(prev => ({ ...prev, current: page, pageSize })),
          showSizeChanger: true
        }}
        loading={isLoading}
      />

      {/* Modal thêm mới */}
      <Modal
        title="Thêm mới thông báo"
        open={isModalVisible}
        onOk={handleAdd}
        onCancel={() => {
          setIsModalVisible(false)
          form.resetFields()
          setContent('')
        }}
        okText="Thêm mới"
        cancelText="Hủy"
        confirmLoading={addMutation.isLoading}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ isRead: false }}
        >
          <Form.Item
            label="User ID"
            name="userId"
            rules={[{ required: true, message: 'Vui lòng nhập User ID' }]}
          >
            <Input placeholder="Nhập User ID" />
          </Form.Item>
          <Form.Item
            label="Tiêu đề"
            name="title"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
          >
            <Input placeholder="Nhập tiêu đề thông báo" />
          </Form.Item>
          <Form.Item
            label="Nội dung"
            required
            rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
          >
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              modules={modules}
              style={{ minHeight: 200, marginBottom: 10 }}
            />
          </Form.Item>
          <Form.Item label="Hiển thị" name="isPublic" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default NotificationList
