import { Button, Form, Input, Switch, message } from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import axios from '@/config/axios.customize'

interface ICategory {
  name: string
  slug: string
  description: string
  image: string
  isPublic: boolean
}

const CategoryEdit = () => {
  const [form] = Form.useForm<ICategory>()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [loading, setLoading] = useState(false)

  // Lấy dữ liệu danh mục hiện tại
  useEffect(() => {
    const fetchCategory = async () => {
      setLoading(true)
      try {
        const res = await axios.get(`/api/v1/categories/${id}`)
        form.setFieldsValue(res.data)
      } catch (error) {
        message.error('Không tìm thấy danh mục!')
        navigate('/categories')
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchCategory()
  }, [id, form, navigate])

  // Cập nhật danh mục
  const onFinish = async (values: ICategory) => {
    try {
      await axios.patch(`/api/v1/categories/${id}`, values)
      message.success('Cập nhật danh mục thành công!')
      navigate('/categories')
    } catch (error) {
      message.error('Cập nhật danh mục thất bại!')
    }
  }

  return (
    <div>
      <h2>Cập nhật danh mục</h2>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ isPublic: true }}
      >
        <Form.Item
          label="Tên danh mục"
          name="name"
          rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}
        >
          <Input placeholder="Nhập tên danh mục" />
        </Form.Item>

        <Form.Item
          label="Slug"
          name="slug"
          rules={[{ required: true, message: 'Vui lòng nhập slug' }]}
        >
          <Input placeholder="slug-danh-muc" />
        </Form.Item>

        <Form.Item
          label="Mô tả"
          name="description"
          rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
        >
          <Input.TextArea placeholder="Mô tả danh mục" rows={4} />
        </Form.Item>

        <Form.Item
          label="Hiển thị"
          name="isPublic"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Button type="primary" htmlType="submit" loading={loading}>
          Lưu thay đổi
        </Button>
      </Form>
    </div>
  )
}

export default CategoryEdit
