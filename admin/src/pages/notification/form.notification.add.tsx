import { Form, Input, Button, message, Switch } from 'antd'
import { useNavigate } from 'react-router'
import axios from '@/config/axios.customize'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { useState } from 'react'

const NotificationAdd = () => {
  const [form] = Form.useForm()
  const navigate = useNavigate()
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

  const onFinish = async (values: any) => {
    try {
      await axios.post('/api/v1/notifications', values)
      message.success('Thêm thông báo thành công!')
      navigate('/notification')
    } catch (error) {
      message.error('Thêm thông báo thất bại!')
    }
  }

  return (
    <div style={{ maxWidth: 500, margin: '0 auto' }}>
      <h2>Thêm mới thông báo</h2>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
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
          label='Nội dung'
          name='content'
          required
          rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
        >
          <ReactQuill
            theme='snow'
            value={content}
            onChange={setContent}
            modules={modules}
            style={{ minHeight: 200, borderRadius: 6, height: 180, marginBottom: 30 }}
          />
        </Form.Item>
        <Form.Item
          label="Hiển thị"
          name="isPublic"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
        <Button type="primary" htmlType="submit">
          Thêm mới
        </Button>
      </Form>
    </div>
  )
}

export default NotificationAdd
