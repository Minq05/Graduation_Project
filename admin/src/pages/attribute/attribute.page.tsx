/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import {
  Table,
  Button,
  Space,
  Popconfirm,
  message,
  Modal,
  Pagination,
  Input,
  Form
} from 'antd'
import axios from 'axios'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'


interface IAttribute {
  _id: string
  name: string
  slug: string
  createdAt?: string
  updatedAt?: string
}

const AttributePage = () => {
  const [data, setData] = useState<IAttribute[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [form] = Form.useForm<IAttribute>()
  const [editingItem, setEditingItem] = useState<IAttribute | null>(null)
  const [searchValue, setSearchValue] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await axios.get('http://localhost:8080/api/v1/attributes')
      setData(res.data.data?.results || [])
    } catch {
      message.error('Lấy danh sách thuộc tính thất bại!')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (isModalOpen && isEdit && editingItem) {
      setTimeout(() => {
        form.setFieldsValue({
          name: editingItem.name,
          slug: editingItem.slug
        })
      }, 0)
    }
  }, [isModalOpen, isEdit, editingItem, form])

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setSearchTerm(searchValue)
      setCurrentPage(1)
    }, 300)

    return () => clearTimeout(delayDebounce)
  }, [searchValue])

  const filteredData = data.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.slug.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const openAddModal = () => {
    form.resetFields()
    setIsEdit(false)
    setEditingItem(null)
    setIsModalOpen(true)
  }

  const openEditModal = (item: IAttribute) => {
    setIsEdit(true)
    setEditingItem(item)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`http://localhost:8080/api/v1/attributes/${id}`)
      message.success('Xóa thuộc tính thành công!')
      fetchData()
    } catch {
      message.error('Xóa thuộc tính thất bại!')
    }
  }

  const handleSubmit = async (values: any) => {
    try {
      if (isEdit && editingItem?._id) {
        await axios.patch(`http://localhost:8080/api/v1/attributes/${editingItem._id}`, values)
        message.success('Chỉnh sửa thuộc tính thành công!')
      } else {
        await axios.post('http://localhost:8080/api/v1/attributes', values)
        message.success('Thêm thuộc tính thành công!')
      }
      setIsModalOpen(false)
      form.resetFields()
      fetchData()
    } catch {
      message.error('Lưu thất bại, vui lòng thử lại!')
    }
  }

  const handleCancel = () => {
    setIsModalOpen(false)
    form.resetFields()
  }

  const handlePageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page)
    if (pageSize) setPageSize(pageSize)
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Trang quản lý thuộc tính</h1>

      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Input
          placeholder="Tìm kiếm theo tên hoặc slug..."
          allowClear
          size="middle"
          style={{ maxWidth: 350 }}
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
        />
        <Button type="primary" onClick={openAddModal}>
          Thêm mới
        </Button>
      </div>

      <Table
        rowKey="_id"
        columns={[
          {
            title: 'Tên thuộc tính',
            dataIndex: 'name',
            key: 'name',
            width: 200
          },
          {
            title: 'Slug',
            dataIndex: 'slug',
            key: 'slug',
            width: 200,
            render: (slug: string) => (
              <span style={{ color: '#666', fontFamily: 'monospace' }}>
                {slug}
              </span>
            )
          },
          {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 150,
            render: (date: string) =>
              date ? new Date(date).toLocaleString('vi-VN') : ''
          },
          {
            title: 'Ngày cập nhật',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            width: 150,
            render: (date: string) =>
              date ? new Date(date).toLocaleString('vi-VN') : ''
          },
          {
            title: 'Hành động',
            key: 'actions',
            width: 150,
            render: (_: any, record: IAttribute) => (
              <Space size="middle">
                <Button
                  icon={<EditOutlined />}
                  className='text-blue-600 border-blue-600 hover:text-blue-500 hover:border-blue-500'
                  onClick={() => openEditModal(record)}
                />
                <Popconfirm
                  title="Bạn có chắc muốn xóa thuộc tính này không?"
                  onConfirm={() => handleDelete(record._id)}
                  okText="Có"
                  cancelText="Không"
                >
                  <Button
                    icon={<DeleteOutlined />}
                    className='text-red-600 border-red-600 hover:text-red-500 hover:border-red-500'
                  />
                </Popconfirm>
              </Space>
            )
          }
        ]}
        dataSource={paginatedData}
        loading={loading}
        pagination={false}
        scroll={{ x: 800 }}
      />

      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={filteredData.length}
          onChange={handlePageChange}
        />
      </div>

      <Modal
        title={isEdit ? 'Chỉnh sửa thuộc tính' : 'Thêm thuộc tính'}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          preserve={false}
        >
          <Form.Item
            label="Tên thuộc tính"
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập tên thuộc tính!' }]}
          >
            <Input placeholder="Nhập tên thuộc tính" />
          </Form.Item>

          <Form.Item
            label="Slug"
            name="slug"
            rules={[{ required: true, message: 'Vui lòng nhập slug!' }]}
          >
            <Input placeholder="Nhập slug cho thuộc tính" />
          </Form.Item>

          <Form.Item>
            <Button onClick={handleCancel}>Hủy</Button>
            <Button type="primary" htmlType="submit" style={{ marginLeft: 10 }}>
              {isEdit ? 'Lưu thay đổi' : 'Thêm mới'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default AttributePage
