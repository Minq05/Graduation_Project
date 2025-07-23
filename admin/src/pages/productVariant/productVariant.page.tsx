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
  InputNumber,
  Select
} from 'antd'
import axios from 'axios'

const { Search } = Input
const { Option } = Select

interface IProduct {
  _id: string
  name: string
  description?: string
}

interface IProductVariant {
  _id?: string
  productId: {
    _id: string
    name: string
  } | string
  sku: string
  price: number
  stock: number
  image: string
  createdAt?: string
  updatedAt?: string
}

const ProductVariantPage = () => {
  const [data, setData] = useState<IProductVariant[]>([])
  const [products, setProducts] = useState<IProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [productsLoading, setProductsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [form] = Form.useForm<IProductVariant>()
  const [editingItem, setEditingItem] = useState<IProductVariant | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchInput, setSearchInput] = useState('')

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await axios.get('http://localhost:8080/api/v1/variants')
      setData(res.data.data?.results || [])
    } catch {
      message.error('Lấy danh sách biến thể sản phẩm thất bại!')
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    setProductsLoading(true)
    try {
      const res = await axios.get('http://localhost:8080/api/v1/products')
      setProducts(res.data.data?.results || [])
    } catch {
      message.error('Lấy danh sách sản phẩm thất bại!')
    } finally {
      setProductsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    fetchProducts()
  }, [])

  useEffect(() => {
    if (isModalOpen && isEdit && editingItem) {
      setTimeout(() => {
        form.setFieldsValue({
          productId:
            typeof editingItem.productId === 'string'
              ? editingItem.productId
              : editingItem.productId._id,
          sku: editingItem.sku,
          price: editingItem.price,
          stock: editingItem.stock,
          image: editingItem.image
        })
      }, 0)
    }
  }, [isModalOpen, isEdit, editingItem, form])

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(searchInput)
      setCurrentPage(1)
    }, 300)

    return () => {
      clearTimeout(handler)
    }
  }, [searchInput])

  const filteredData = data.filter(item =>
    item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (typeof item.productId !== 'string' && item.productId.name.toLowerCase().includes(searchTerm.toLowerCase()))
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

  const openEditModal = (item: IProductVariant) => {
    if (productsLoading) {
      message.warning('Vui lòng chờ danh sách sản phẩm tải xong')
      return
    }
    setIsEdit(true)
    setEditingItem(item)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`http://localhost:8080/api/v1/variants/${id}`)
      message.success('Xóa biến thể sản phẩm thành công!')
      fetchData()
    } catch {
      message.error('Xóa biến thể sản phẩm thất bại!')
    }
  }

  const handleSubmit = async (values: any) => {
    try {
      if (isEdit && editingItem?._id) {
        await axios.patch(`http://localhost:8080/api/v1/variants/${editingItem._id}`, values)
        message.success('Chỉnh sửa biến thể sản phẩm thành công!')
      } else {
        await axios.post('http://localhost:8080/api/v1/variants', values)
        message.success('Thêm biến thể sản phẩm thành công!')
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Trang quản lý biến thể sản phẩm</h1>

      <Button
        type="primary"
        style={{ marginBottom: 16, float: 'right' }}
        onClick={openAddModal}
      >
        Thêm mới
      </Button>

      <Search
        placeholder="Tìm kiếm theo SKU hoặc tên sản phẩm..."
        allowClear
        enterButton="Tìm"
        size="middle"
        style={{ marginBottom: 16, maxWidth: 350 }}
        value={searchInput}
        onChange={e => setSearchInput(e.target.value)}
        onSearch={value => {
          setSearchTerm(value)
          setSearchInput(value)
          setCurrentPage(1)
        }}
      />

      <Table
        rowKey="_id"
        columns={[
          {
            title: 'Sản phẩm',
            dataIndex: 'productId',
            key: 'productId',
            width: 200,
            render: (productId: any) =>
              typeof productId === 'object' ? productId?.name : 'Không rõ sản phẩm'
          },
          {
            title: 'SKU',
            dataIndex: 'sku',
            key: 'sku',
            width: 150
          },
          {
            title: 'Giá',
            dataIndex: 'price',
            key: 'price',
            width: 120,
            render: (price: number) => formatCurrency(price)
          },
          {
            title: 'Tồn kho',
            dataIndex: 'stock',
            key: 'stock',
            width: 100,
            render: (stock: number) => (
              <span style={{ color: stock > 0 ? '#52c41a' : '#ff4d4f' }}>
                {stock}
              </span>
            )
          },
          {
            title: 'Hình ảnh',
            dataIndex: 'image',
            key: 'image',
            width: 100,
            render: (image: string) =>
              image ? (
                <img
                  src={image}
                  alt="Product variant"
                  style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }}
                />
              ) : (
                <span style={{ color: '#ccc' }}>Không có</span>
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
            title: 'Hành động',
            key: 'actions',
            width: 150,
            render: (_: any, record: IProductVariant) => (
              <Space size="middle">
                <Button type="primary" size="small" onClick={() => openEditModal(record)}>
                  Sửa
                </Button>
                <Popconfirm
                  title="Bạn có chắc muốn xóa biến thể sản phẩm này không?"
                  onConfirm={() => handleDelete(record._id!)}
                  okText="Có"
                  cancelText="Không"
                >
                  <Button type="primary" danger size="small">
                    Xóa
                  </Button>
                </Popconfirm>
              </Space>
            )
          }
        ]}
        dataSource={paginatedData}
        loading={loading}
        pagination={false}
        scroll={{ x: 1200 }}
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
        title={isEdit ? 'Chỉnh sửa biến thể sản phẩm' : 'Thêm biến thể sản phẩm'}
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
            label="Sản phẩm"
            name="productId"
            rules={[{ required: true, message: 'Vui lòng chọn sản phẩm!' }]}
          >
            <Select
              placeholder="Chọn sản phẩm"
              loading={productsLoading}
              showSearch
              filterOption={(input, option) =>
                (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())
              }
            >
              {products.map(product => (
                <Option key={product._id} value={product._id}>
                  {product.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="SKU"
            name="sku"
            rules={[{ required: true, message: 'Vui lòng nhập SKU!' }]}
          >
            <Input placeholder="Nhập SKU" />
          </Form.Item>

          <Form.Item
            label="Giá"
            name="price"
            rules={[
              { required: true, message: 'Vui lòng nhập giá!' },
              { type: 'number', min: 0, message: 'Giá phải lớn hơn hoặc bằng 0!' }
            ]}
          >
            <InputNumber
              placeholder="Nhập giá"
              style={{ width: '100%' }}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value!.replace(/\$\s?|(,*)/g, '')}
              addonAfter="VND"
            />
          </Form.Item>

          <Form.Item
            label="Tồn kho"
            name="stock"
            rules={[
              { required: true, message: 'Vui lòng nhập số lượng tồn kho!' },
              { type: 'number', min: 0, message: 'Tồn kho phải lớn hơn hoặc bằng 0!' }
            ]}
          >
            <InputNumber
              placeholder="Nhập số lượng tồn kho"
              style={{ width: '100%' }}
              min={0}
            />
          </Form.Item>

          <Form.Item
            label="Hình ảnh (URL)"
            name="image"
            rules={[{ required: true, message: 'Vui lòng nhập URL hình ảnh!' }]}
          >
            <Input placeholder="Nhập URL hình ảnh" />
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

export default ProductVariantPage
