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
  Form,
  Select
} from 'antd'
import axios from 'axios'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'

const { Search } = Input
const { Option } = Select

interface IVariant {
  _id: string
  sku: string
}

interface IAttribute {
  _id: string
  name: string
}

interface IVariantAttribute {
  _id?: string
  variantId: string | IVariant
  attributeId: string | IAttribute
  value: string
  createdAt?: string
  updatedAt?: string
}

const VariantAttributePage = () => {
  const [data, setData] = useState<IVariantAttribute[]>([])
  const [variants, setVariants] = useState<IVariant[]>([])
  const [attributes, setAttributes] = useState<IAttribute[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [form] = Form.useForm<IVariantAttribute>()
  const [editingItem, setEditingItem] = useState<IVariantAttribute | null>(null)

  // Thêm 2 state cho debounce tìm kiếm
  const [searchInput, setSearchInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await axios.get('http://localhost:8080/api/v1/variantsat')
      setData(res.data.data?.results || [])
    } catch {
      message.error('Lấy danh sách thất bại!')
    } finally {
      setLoading(false)
    }
  }

  const fetchOptions = async () => {
    try {
      const [vRes, aRes] = await Promise.all([
        axios.get('http://localhost:8080/api/v1/variants'),
        axios.get('http://localhost:8080/api/v1/attributes')
      ])
      setVariants(vRes.data.data?.results || [])
      setAttributes(aRes.data.data?.results || [])
    } catch {
      message.error('Lấy dữ liệu variant/attribute thất bại!')
    }
  }

  useEffect(() => {
    fetchData()
    fetchOptions()
  }, [])

  useEffect(() => {
    if (isModalOpen && isEdit && editingItem) {
      setTimeout(() => {
        form.setFieldsValue({
          variantId: (editingItem.variantId as any)?._id || '',
          attributeId: (editingItem.attributeId as any)?._id || '',
          value: editingItem.value
        })
      }, 0)
    }
  }, [isModalOpen, isEdit, editingItem, form])

  // Debounce tìm kiếm: khi searchInput thay đổi, sau 500ms mới cập nhật searchTerm
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(searchInput)
      setCurrentPage(1) // reset page về 1 khi tìm kiếm
    }, 500)

    return () => {
      clearTimeout(handler)
    }
  }, [searchInput])

  // Lọc data dựa trên searchTerm
  const filteredData = data.filter(item => {
    const variantSku = (item.variantId as any)?.sku || ''
    const attributeName = (item.attributeId as any)?.name || ''
    return (
      variantSku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attributeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.value.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

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

  const openEditModal = (item: IVariantAttribute) => {
    setIsEdit(true)
    setEditingItem(item)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`http://localhost:8080/api/v1/variantsat/${id}`)
      message.success('Xóa thành công!')
      fetchData()
    } catch {
      message.error('Xóa thất bại!')
    }
  }

  const handleSubmit = async (values: any) => {
    const payload = {
      ...values,
      variantId: values.variantId,
      attributeId: values.attributeId
    }

    try {
      if (isEdit && editingItem?._id) {
        await axios.patch(`http://localhost:8080/api/v1/variantsat/${editingItem._id}`, payload)
        message.success('Cập nhật thành công!')
      } else {
        await axios.post('http://localhost:8080/api/v1/variantsat', payload)
        message.success('Thêm mới thành công!')
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
      <h1>Trang quản lý Variant Attributes</h1>

      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Search
          placeholder="Tìm kiếm theo SKU, thuộc tính hoặc value..."
          allowClear
          enterButton="Tìm"
          size="middle"
          style={{ maxWidth: 400 }}
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          // Có thể thêm onSearch nếu muốn cho nút "Tìm" làm việc giống onChange:
          onSearch={value => {
            setSearchInput(value)
            setCurrentPage(1)
          }}
        />
        <Button type="primary" onClick={openAddModal}>
          Thêm mới
        </Button>
      </div>

      <Table
        rowKey="_id"
        columns={[
          {
            title: 'SKU',
            key: 'variantId',
            render: (_: any, record: IVariantAttribute) => (record.variantId as any)?.sku
          },
          {
            title: 'Thuộc tính',
            key: 'attributeId',
            render: (_: any, record: IVariantAttribute) => (record.attributeId as any)?.name
          },
          {
            title: 'Giá trị',
            dataIndex: 'value',
            key: 'value'
          },
          {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => date ? new Date(date).toLocaleString('vi-VN') : ''
          },
          {
            title: 'Hành động',
            key: 'actions',
            render: (_: any, record: IVariantAttribute) => (
              <Space size="middle">
                <Button icon={<EditOutlined />}
                  className='text-blue-600 border-blue-600 hover:text-blue-500 hover:border-blue-500' onClick={() => openEditModal(record)}/>
                <Popconfirm
                  title="Bạn có chắc muốn xóa không?"
                  onConfirm={() => handleDelete(record._id!)}
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
        title={isEdit ? 'Chỉnh sửa Variant Attribute' : 'Thêm Variant Attribute'}
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
            label="Variant"
            name="variantId"
            rules={[{ required: true, message: 'Vui lòng chọn Variant!' }]}
          >
            <Select placeholder="Chọn Variant">
              {variants.map(item => (
                <Option key={item._id} value={item._id}>
                  {item.sku}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Thuộc tính"
            name="attributeId"
            rules={[{ required: true, message: 'Vui lòng chọn thuộc tính!' }]}
          >
            <Select placeholder="Chọn thuộc tính">
              {attributes.map(item => (
                <Option key={item._id} value={item._id}>
                  {item.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Giá trị"
            name="value"
            rules={[{ required: true, message: 'Vui lòng nhập giá trị!' }]}
          >
            <Input placeholder="Nhập giá trị" />
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

export default VariantAttributePage
