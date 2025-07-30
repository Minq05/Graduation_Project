import { useState } from 'react'
import {
  Table,
  Button,
  Space,
  message,
  Switch,
  Input,
  Form,
  Modal,
  Spin,
  Pagination,
} from 'antd'
import { EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import axios from '@/config/axios.customize'
import type { ColumnsType } from 'antd/es/table'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface Category {
  _id: string
  name: string
  slug: string
  description: string
  isPublic: boolean
}

interface Product {
  _id: string
  name: string
  image: string
  price: number
  stock: number
  brandId?: { name: string }
  categoryId?: { name: string }
  createdAt: string
}

const CategoryList = () => {
  const queryClient = useQueryClient()

  // States for category list
  const [searchText, setSearchText] = useState('')
  const [pagination, setPagination] = useState({ current: 1, pageSize: 5, total: 0 })
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loadingDrawer, setLoadingDrawer] = useState(false)

  // States for products modal
  const [productsModalOpen, setProductsModalOpen] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [selectedCategoryName, setSelectedCategoryName] = useState('')
  const [productsData, setProductsData] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(false)
  const [productsPagination, setProductsPagination] = useState({ current: 1, pageSize: 5, total: 0 })
  const [productsSearchTerm, setProductsSearchTerm] = useState('')

  // Form instance for category add/edit
  const [form] = Form.useForm()

  // Fetch categories (pagination + search)
  const fetchList = async ({
    page = 1,
    pageSize = 5,
    search = ''
  }): Promise<{ results: Category[] }> => {
    let url = `/api/v1/categories?current=${page}&pageSize=${pageSize}`
    if (search) {
      url += `&qs=${encodeURIComponent(search)}`
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

  // React-query to fetch categories
  const { data, isLoading } = useQuery({
    queryKey: ['categories', pagination.current, pagination.pageSize, searchText],
    queryFn: () =>
      fetchList({ page: pagination.current, pageSize: pagination.pageSize, search: searchText }),
    keepPreviousData: true
  })

  // Mutation to update category public status
  const statusMutation = useMutation({
    mutationFn: (variables: { id: string; isPublic: boolean }) =>
      axios.patch(`/api/v1/categories/${variables.id}`, { isPublic: variables.isPublic }),
    onSuccess: () => {
      message.success('Cập nhật trạng thái thành công')
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
    onError: () => {
      message.error('Cập nhật trạng thái thất bại')
    }
  })

  // Mutation to delete category
  const deleteMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`/api/v1/categories/${id}`),
    onSuccess: () => {
      message.success('Xóa danh mục thành công')
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
    onError: () => {
      message.error('Xóa danh mục thất bại')
    }
  })

  // Fetch products for a specific category
  const fetchProducts = async (categoryId: string, page: number, pageSize: number, search: string) => {
    setProductsLoading(true)
    try {
      let url = `/api/v1/products?current=${page}&pageSize=${pageSize}&categoryId=${encodeURIComponent(categoryId)}`
      if (search) {
        url += `&qs=${encodeURIComponent(search)}`
      }
      const res = await axios.get(url)
      setProductsData(res.data?.results || [])
      setProductsPagination(prev => ({
        ...prev,
        total: res.data?.meta?.total || 0,
        current: res.data?.meta?.current || page,
        pageSize: res.data?.meta?.pageSize || pageSize
      }))
    } catch (err) {
      message.error('Lấy danh sách sản phẩm thất bại!')
      setProductsData([])
      setProductsPagination(prev => ({ ...prev, total: 0 }))
    } finally {
      setProductsLoading(false)
    }
  }

  // Open Modal to view related products
  const handleViewProducts = async (record: Category) => {
    setSelectedCategoryId(record._id)
    setSelectedCategoryName(record.name)
    setProductsSearchTerm('')
    setProductsPagination({ current: 1, pageSize: 5, total: 0 })
    await fetchProducts(record._id, 1, 5, '')
    setProductsModalOpen(true)
  }

  // Close products Modal
  const handleCloseProductsModal = () => {
    setProductsModalOpen(false)
    setSelectedCategoryId(null)
    setSelectedCategoryName('')
    setProductsData([])
    setProductsSearchTerm('')
    setProductsPagination({ current: 1, pageSize: 5, total: 0 })
  }

  // Confirm deletion
  const showDeleteConfirm = (record: Category) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: `Bạn có chắc chắn muốn xóa danh mục "${record.name}"?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: () => deleteMutation.mutate(record._id)
    })
  }

  // Open Drawer for adding new category
  const handleOpenAdd = () => {
    setEditingId(null)
    form.resetFields()
    form.setFieldsValue({ isPublic: true })
    setDrawerOpen(true)
  }

  // Open Drawer for editing category
  const handleOpenEdit = async (id: string) => {
    setEditingId(id)
    setLoadingDrawer(true)
    setDrawerOpen(true)
    try {
      const res = await axios.get(`/api/v1/categories/${id}`)
      form.setFieldsValue(res.data)
    } catch (error) {
      message.error('Không thể tải danh mục')
      setDrawerOpen(false)
    } finally {
      setLoadingDrawer(false)
    }
  }

  // Close Drawer
  const handleCloseDrawer = () => {
    setDrawerOpen(false)
    form.resetFields()
    setEditingId(null)
  }

  // Submit form (Add or Update category)
  const onFinish = async (values: any) => {
    try {
      if (editingId) {
        await axios.patch(`/api/v1/categories/${editingId}`, values)
        message.success('Cập nhật thành công!')
      } else {
        await axios.post('/api/v1/categories', values)
        message.success('Thêm mới thành công!')
        setPagination(prev => ({ ...prev, current: 1 }))
      }
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      handleCloseDrawer()
    } catch (error) {
      message.error('Lỗi khi lưu danh mục!')
    }
  }

  // Table columns for categories
  const categoryColumns: ColumnsType<Category> = [
    { title: 'Tên danh mục', dataIndex: 'name', key: 'name' },
    { title: 'Slug', dataIndex: 'slug', key: 'slug' },
    { title: 'Mô tả', dataIndex: 'description', key: 'description' },
    {
      title: 'Trạng thái',
      dataIndex: 'isPublic',
      key: 'isPublic',
      render: (_: boolean, record: Category) => (
        <Switch
          checked={record.isPublic}
          onChange={checked => statusMutation.mutate({ id: record._id, isPublic: checked })}
          checkedChildren="Hiển thị"
          unCheckedChildren="Ẩn"
        />
      )
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleViewProducts(record)}
            className="text-green-600 border-green-600 hover:text-green-500 hover:border-green-500"
            title="Xem sản phẩm liên quan"
          />
          <Button
            icon={<EditOutlined />}
            onClick={() => handleOpenEdit(record._id)}
            className="text-blue-600 border-blue-600 hover:text-blue-500 hover:border-blue-500"
            title="Chỉnh sửa"
          />
          <Button
            icon={<DeleteOutlined />}
            onClick={() => showDeleteConfirm(record)}
            className="text-red-600 border-red-600 hover:text-red-500 hover:border-red-500"
            title="Xóa danh mục"
          />
        </Space>
      )
    }
  ]

  // Table columns for products in Modal
  const productColumns: ColumnsType<Product> = [
    {
      title: 'Ảnh',
      dataIndex: 'image',
      key: 'image',
      render: (url: string) => (
        <img
          src={url}
          alt="Ảnh sản phẩm"
          style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }}
        />
      )
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `${price.toLocaleString()} ₫`
    },
    {
      title: 'Tồn kho',
      dataIndex: 'stock',
      key: 'stock'
    },
    {
      title: 'Thương hiệu',
      dataIndex: 'brandId',
      key: 'brandId',
      render: (brand: any) => brand?.name || 'Không có thương hiệu'
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString()
    }
  ]

  return (
    <div style={{ padding: 24 }}>
      <h2>Danh sách danh mục</h2>
      <Button
        type="primary"
        style={{ marginBottom: 16, float: 'right' }}
        onClick={handleOpenAdd}
      >
        Thêm danh mục
      </Button>

      <Input.Search
        placeholder="Tìm kiếm tên danh mục"
        allowClear
        style={{ marginBottom: 16, maxWidth: 300 }}
        value={searchText}
        onChange={e => {
          setPagination(prev => ({ ...prev, current: 1 }))
          setSearchText(e.target.value)
        }}
      />

      <Table
        rowKey="_id"
        columns={categoryColumns}
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

      {/* Modal for add/edit category */}
      <Modal
        title={editingId ? 'Cập nhật danh mục' : 'Thêm danh mục'}
        open={drawerOpen}
        onCancel={handleCloseDrawer}
        footer={null}
        destroyOnClose
        width={480}
      >
        <Spin spinning={loadingDrawer}>
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{ isPublic: true }}
          >
            <Form.Item
              label="Tên danh mục"
              name="name"
              rules={[{ required: true, message: 'Nhập tên danh mục' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Slug"
              name="slug"
              rules={[{ required: true, message: 'Nhập slug' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Mô tả"
              name="description"
              rules={[{ required: true, message: 'Nhập mô tả' }]}
            >
              <Input.TextArea rows={3} />
            </Form.Item>

            <Form.Item label="Công khai" name="isPublic" valuePropName="checked">
              <Switch />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                {editingId ? 'Lưu thay đổi' : 'Thêm mới'}
              </Button>
            </Form.Item>
          </Form>
        </Spin>
      </Modal>

      {/* Modal for viewing related products */}
      <Modal
        title={`Sản phẩm thuộc danh mục: ${selectedCategoryName}`}
        open={productsModalOpen}
        onCancel={handleCloseProductsModal}
        footer={null}
        destroyOnClose
        width={800}
      >
        <Spin spinning={productsLoading}>
          <Input.Search
            placeholder="Tìm kiếm sản phẩm..."
            allowClear
            enterButton="Tìm"
            size="middle"
            style={{ marginBottom: 16, maxWidth: 300 }}
            onSearch={value => {
              setProductsSearchTerm(value)
              setProductsPagination(prev => ({ ...prev, current: 1 }))
              if (selectedCategoryId) {
                fetchProducts(selectedCategoryId, 1, productsPagination.pageSize, value)
              }
            }}
          />
          <Table
            rowKey="_id"
            columns={productColumns}
            dataSource={productsData}
            pagination={false}
            loading={productsLoading}
          />
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
            <Pagination
              current={productsPagination.current}
              pageSize={productsPagination.pageSize}
              total={productsPagination.total}
              onChange={(page, pageSize) => {
                setProductsPagination(prev => ({ ...prev, current: page, pageSize }))
                if (selectedCategoryId) {
                  fetchProducts(selectedCategoryId, page, pageSize, productsSearchTerm)
                }
              }}
              showSizeChanger
            />
          </div>
        </Spin>
      </Modal>
    </div>
  )
}

export default CategoryList
