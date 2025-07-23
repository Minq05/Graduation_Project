import { Button, Form, Input, Switch, message } from 'antd'
// import { UploadOutlined } from '@ant-design/icons'
import type { UploadFile } from 'antd/es/upload/interface'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import axios from '@/config/axios.customize'

interface ICategory {
  name: string;
  slug: string;
  description: string;
  image: string;
  isPublic: boolean;
}

const CategoryAdd = () => {
  const [form] = Form.useForm<ICategory>()
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const navigate = useNavigate() // ✅ Hook điều hướng

  const onFinish = async (values: any) => {
    const imageUrl = fileList[0]?.thumbUrl || fileList[0]?.url || 'https://picsum.photos/200' // fallback ảnh giả

    const categoryData: ICategory = {
      ...values,
      image: imageUrl,
      status: values.status ?? true
    }

    try {
      const res = await axios.post('/api/v1/categories', categoryData)
      console.log('Thêm thành công:', res)
      message.success('Thêm danh mục thành công!')
      form.resetFields()
      setFileList([])

      // ✅ Điều hướng về trang danh sách danh mục
      navigate('/categories')
    } catch (error) {
      message.error('Thêm danh mục thất bại!')
    }
  }

  return (
    <div>
      <h2>Thêm danh mục</h2>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ status: true, order: 1 }}
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

        {/*
        <Form.Item label="Ảnh đại diện" required>
          <Upload
            listType="picture"
            maxCount={1}
            fileList={fileList}
            beforeUpload={() => false}
            onChange={({ fileList }) => setFileList(fileList)}
          >
            <Button icon={<UploadOutlined />}>Tải ảnh lên</Button>
          </Upload>
        </Form.Item>
        */}
        <Form.Item
          label="Hiển thị"
          name="isPublic"
          valuePropName="checked" // liên kết trạng thái của Switch (on/off) với giá trị true/false
        >
          <Switch />
        </Form.Item>


        <Button type="primary" htmlType="submit">Thêm mới</Button>
      </Form>
    </div>
  )
}

export default CategoryAdd
