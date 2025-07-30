import instance from '@/config/axios.customize'
import { IBrand } from '@/types/brand'
import { DeleteFilled, EditFilled, FolderAddFilled } from '@ant-design/icons'
import { useMutation } from '@tanstack/react-query'
import { Button, Popconfirm, Switch, Table, Modal, Form, Input, Select, message, Tooltip } from 'antd'
import axios from 'axios'
import { debounce } from 'lodash'
import { useEffect, useMemo, useState } from 'react'


const Brand = () => {
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const [editingID, setEditingID] = useState<string | null>(null)
  const [form] = Form.useForm()
  const [data, setData] = useState<IBrand[]>([])
  const [image, setImage] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [searchText, setSearchText] = useState('')
  const [pagination, setPagination] = useState<IPagination>({ current: 1, pageSize: 10, total: 10 })

  const ListBrand = async (qs?: string) => {
    try {
      const url = `/api/v1/brand?current=${pagination.current}&pageSize=${pagination.pageSize}${qs ? `&qs=${encodeURIComponent(qs)}` : ''}`
      const res = await instance.get(url)
      console.log('Request URL:', url)

      const results = res?.data?.results || []
      setData(results)
      setPagination((prev) => ({
        ...prev,
        total: res?.data?.meta?.total || results.length
      }))
    } catch (error) {
      message.error('Không thể tải danh sách thương hiệu')
      setData([])
    }
  }
  const debounceSearch = useMemo(() =>
    debounce((text: string) => {
      ListBrand(text)
    }, 500), [pagination.current, pagination.pageSize]
  )

  useEffect(() => {
    const fetchData = async () => {
      await ListBrand(searchText)
    }
    fetchData()
  }, [debounceSearch,pagination.current, pagination.pageSize, searchText])

  const handleAdd = () => {
    setModalMode('add')
    form.resetFields()
    setModalOpen(true)
  }

  const handleEdit = (brand: IBrand) => {
    setModalMode('edit')
    setEditingID(brand._id)
    form.setFieldsValue({
      name: brand.name,
      slug: brand.slug,
      avatar: brand.avatar,
      isPublic: brand.isPublic
    })
    setModalOpen(true)
  }

  const handleFinish = async (values: IBrand) => {
    try {
      if (modalMode === 'add') {
        await instance.post('/api/v1/brand/', values)
        message.success('Thêm thương hiệu thành công')
      } else if (modalMode === 'edit' && editingID) {
        await instance.patch(`/api/v1/brand/${editingID}`, values)
        message.success('Cập nhật thương hiệu thành công')
      }
      setModalOpen(false)
      ListBrand()
    } catch (error) {
      console.log(error)
    }
  }

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        await instance.delete(`/api/v1/brand/${id}`)
      } catch (error: any) {
        console.log(error)
      }
    },
    onSuccess: () => {
      message.success('Xóa thành công')
      ListBrand()
    }
  })
  const handleDelete = (id: string) => {
    mutation.mutate(id)
  }
  const uploadImage = async (file: FileList | null) => {
    if (!file) return
    setLoading(true)
    const formData = new FormData()
    formData.append('file', file[0])
    formData.append('upload_preset', 'reacttest')

    try {
      const { data } = await axios.post(
        'https://api.cloudinary.com/v1_1/dkpfaleot/image/upload',
        formData
      )
      setImage(data.url)
      form.setFieldsValue({ avatar: data.url })
      setLoading(false)
    } catch (error) {
      console.error('Upload thất bại:', error)
      setLoading(false)
    }
  }

  const columns = [
    {
      title: 'Tên thương hiệu',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Tên url',
      dataIndex: 'slug',
      key: 'slug'
    },
    {
      title: 'Hình ảnh',
      dataIndex: 'avatar',
      key: 'avatar',
      render: (avatar: string) =>
        avatar ? (
          <img
            src={avatar}
            alt="avatar"
            style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }}
          />
        ) : (
          <span>Không có ảnh</span>
        )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isPublic',
      key: 'isPublic',
      render: (isPublic: boolean, record: IBrand) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Switch
            checked={!!isPublic}
            checkedChildren="Hiển thị"
            unCheckedChildren="Ẩn"
            onChange={async(checked) => {
              try {
                await instance.patch(`api/v1/brand/${record._id}`, {
                  isPublic: checked
                })
                message.success('Thay đổi trạng thái thành công')
                ListBrand()
              } catch (error) {
                console.log(error)
              }
            }}
          />
        </div>
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (record: IBrand) =>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Tooltip title="Chỉnh sửa">
            <Button type='primary' onClick={() => handleEdit(record)}><EditFilled /></Button>
          </Tooltip>
          <Popconfirm
            title="Xóa thương hiệu"
            description="Bạn có chắc chắn muốn xóa thương hiệu này?"
            okText="Đồng ý"
            cancelText="Không đồng ý"
            onConfirm={() => handleDelete(record._id)}
          >
            <Tooltip title="Xóa">
              <Button danger><DeleteFilled /></Button>
            </Tooltip>
          </Popconfirm>
        </div>
    }
  ]

  return (
    <div>
      <div className='flex justify-between items-center mb-6'>
        <div>
          <h1 className='text-2xl font-bold'>Quản lý thương hiệu</h1>
          <p className='text-gray-500'>Quản lý thương hiệu trong hệ thống</p>
          <Input.Search
            placeholder="Tìm kiếm thương hiệu"
            allowClear
            enterButton
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={(value) => {
              setSearchText(value)
              ListBrand(value)
            }}
            style={{ width: 300 }}
          />

        </div>
        <div style={{}} >
          <Button type='primary' onClick={handleAdd}>
            <FolderAddFilled /> Thêm thương hiệu
          </Button>
        </div>
      </div>
      <Table
        dataSource={data}
        columns={columns}
        rowKey={(data) => data._id}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: (page, pageSize) => {
            setPagination((prev) => ({
              ...prev,
              current: page,
              pageSize
            }))
          }
        }}
/>

      <Modal
        open={modalOpen}
        title={modalMode === 'add' ? 'Thêm thương hiệu' : 'Cập nhật thương hiệu'}
        onCancel={() => { setModalOpen(false); form.resetFields() }}
        footer={null}
        destroyOnClose
        forceRender
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
        >
          <Form.Item
            name="name"
            label="Tên"
            rules={[
              { required: true, message: 'Vui lòng không bỏ trống' },
              { min: 5, message: 'Tối thiểu 5 ký tự' }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="slug"
            label="Tên url"
            rules={[
              { required: true, message: 'Vui lòng không bỏ trống' },
              { min: 5, message: 'Tối thiểu 5 ký tự' }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Ảnh đại diện"
          >
            <input
              type="file"
              onChange={(e) => uploadImage(e.target.files)}
              className="w-full p-3 border rounded-lg"
            />
            {loading && <p className="text-blue-500 mt-2">Đang tải ảnh...</p>}
            {image && (
              <img
                src={image}
                alt="Uploaded"
                className="mt-2 w-32 h-32 object-cover rounded"
                style={{ display: 'block', margin: '0 auto', width: '350px', height: '350px' }}
              />
            )}
          </Form.Item>
          <Form.Item name="avatar" style={{ display: 'none' }}>
            <Input type="hidden" />
          </Form.Item>
          <Form.Item name="avatar" style={{ display: 'none' }}>
            <Input type="hidden" />
          </Form.Item>
          <Form.Item
            name="isPublic"
            label="Trạng thái"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
          >
            <Select placeholder="Chọn trạng thái">
              <Select.Option value={true}>Hiển thị</Select.Option>
              <Select.Option value={false}>Ẩn</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
              {modalMode === 'add' ? 'Thêm' : 'Cập nhật'}
            </Button>
            <Button onClick={() => { setModalOpen(false); form.resetFields() }}>Hủy</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Brand