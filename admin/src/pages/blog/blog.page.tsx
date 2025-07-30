import axios from '@/config/axios.customize'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Table, Button, Space, Switch, Modal, message, Form, Input } from 'antd'
import { Link } from 'react-router'
import { useState, useEffect } from 'react'
import { EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { debounce } from 'lodash'

const BlogPage = () => {
  const queryClient = useQueryClient()
  const [searchText, setSearchText] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 5, total: 0 })
  const [detailModal, setDetailModal] = useState<{ visible: boolean; data?: any }>({ visible: false })

  useEffect(() => {
    const fetchCategories = async () => {
      const res = await axios.get('/api/v1/cateblog')
      setCategories(res.data?.results || [])
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    const handler = debounce((value) => {
      setDebouncedSearch(value)
    }, 500)

    handler(searchText)
    return () => {
      handler.cancel()
    }
  }, [searchText])

  const fetchList = async ({ page = 1, pageSize = 5, search = '' }) => {
    let url = `/api/v1/blogs?current=${page}&pageSize=${pageSize}`
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
    return res.data.results
  }

  const { data, isLoading } = useQuery({
    queryKey: ['blogs', pagination.current, pagination.pageSize, debouncedSearch],
    queryFn: () => fetchList({ page: pagination.current, pageSize: pagination.pageSize, search: debouncedSearch })
  })

  const statusMutation = useMutation({
    mutationFn: (variables: { id: string, isPublic: boolean }) =>
      axios.patch(`/api/v1/blogs/status/${variables.id}`, { isPublic: variables.isPublic }),
    onSuccess: () => {
      message.success('Cập nhật trạng thái thành công')
      queryClient.invalidateQueries({ queryKey: ['blogs'] })
    },
    onError: () => {
      message.error('Cập nhật trạng thái thất bại')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`/api/v1/blogs/${id}`),
    onSuccess: () => {
      message.success('Xóa bài viết thành công')
      queryClient.invalidateQueries({ queryKey: ['blogs'] })
    },
    onError: () => {
      message.error('Xóa thất bại')
    }
  })

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa bài viết này không?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      onOk: () => deleteMutation.mutate(id)
    })
  }

  const fetchDetail = async (id: string) => {
    const res = await axios.get(`/api/v1/blogs/${id}`)
    setDetailModal({ visible: true, data: res.data })
  }

  const columns = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title'
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug'
    },
    {
      title: 'Danh mục',
      dataIndex: 'categoryBlogId',
      key: 'categoryBlogId',
      filters: categories.map((cat) => ({
        text: cat.name,
        value: cat._id
      })),
      onFilter: (value : any, record : any) => record.categoryBlogId === value,
      render: (categoryBlogId: string) => {
        const cat = categories.find((c) => c._id === categoryBlogId)
        return cat ? cat.name : 'Bài viết không có danh mục'
      }
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString()
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isPublic',
      key: 'isPublic',
      render: (_: any, record: any) => (
        <Switch
          checked={record.isPublic}
          onChange={(checked) =>
            statusMutation.mutate({ id: record._id, isPublic: checked })
          }
          checkedChildren='Hiện'
          unCheckedChildren='Ẩn'
        />
      )
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space size='middle'>
          <Button
            icon={<EyeOutlined />}
            onClick={() => fetchDetail(record._id)}
          />
          <Link to={`/blogs/edit/${record._id}`}>
            <Button icon={<EditOutlined />} />
          </Link>
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDelete(record._id)}
          />
        </Space>
      )
    }
  ]

  return (
    <div style={{ padding: 24 }} >
      <h1 style={{fontSize: '25px'}} >Quản lý bài viết</h1>
      <p style={{ marginBottom: 16 }}>Danh sách các bài viết hiện có trong hệ thống.</p>
      <Link to='/blogs/add'>
        <Button type='primary' style={{ marginBottom: 16, float: 'right' }}>
          Thêm mới
        </Button>
      </Link>
      <Space style={{ marginBottom: 16 }}>
        <Form layout="inline">
          <Form.Item>
            <Input
              placeholder="Tìm kiếm tiêu đề"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Form.Item>
        </Form>
      </Space>
      <Table
        rowKey='_id'
        columns={columns}
        dataSource={data}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: (page, pageSize) => setPagination(prev => ({ ...prev, current: page, pageSize })),
          showSizeChanger: true
        }}
        loading={isLoading}
      />
      <Modal
        open={detailModal.visible}
        title="Chi tiết bài viết"
        footer={null}
        onCancel={() => setDetailModal({ visible: false })}
      >
        {detailModal.data ? (
          <div>
            <p><b>Tiêu đề:</b> {detailModal.data.title}</p>
            <p><b>Slug:</b> {detailModal.data.slug}</p>
            <p><b>Image:</b> <img src={detailModal.data.image} alt="Hình ảnh" crossOrigin="anonymous" style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }} /> </p>
            <p><b>Danh mục:</b> {categories.find(c => c._id === detailModal.data.categoryBlogId)?.name || 'Không có'}</p>
            <p><b>Ngày tạo:</b> {new Date(detailModal.data.createdAt).toLocaleString()}</p>
            <p><b>Nội dung:</b></p>
            <div dangerouslySetInnerHTML={{ __html: detailModal.data.content }} />
          </div>
        ) : (
          <p>Đang tải...</p>
        )}
      </Modal>
    </div>
  )
}

export default BlogPage
