import React from 'react'
import { Button, Form, Input, Typography, message } from 'antd'
import { useNavigate } from 'react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from '@/config/axios.customize'
import { Contactvalues, IContact } from '@/types/contact'

const { Title } = Typography

const ContactAddPage = () => {
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const addContactMutation = useMutation({
    mutationFn: async (values: Contactvalues) => {
      const { data } = await axios.post('/api/v1/contacts', values)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      message.success('Gửi liên hệ thành công!')
      navigate('/contact')
    },
    onError: () => {
      message.error('Gửi liên hệ thất bại!')
    }
  })

  const onFinish = (values: Contactvalues) => {
    addContactMutation.mutate(values)
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: 24 }}>
      <Title level={3}>Thêm liên hệ</Title>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="name"
          label="Họ tên"
          rules={[
            { required: true, message: 'Vui lòng nhập họ tên' },
            { min: 5, message: 'Họ tên phải ít nhất 5 ký tự' },
          ]}
        >
          <Input placeholder="Nhập họ tên" />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Vui lòng nhập email' },
            { type: 'email', message: 'Email không hợp lệ' }
          ]}
        >
          <Input placeholder="Nhập email" />
        </Form.Item>

        <Form.Item
          name="phone"
          label="Số điện thoại"
          rules={[
            { required: true, message: 'Vui lòng nhập số điện thoại' },
            { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ' }
          ]}
        >
          <Input placeholder="Nhập số điện thoại" />
        </Form.Item>

        <Form.Item
          name="message"
          label="Nội dung liên hệ"
          rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
        >
          <Input.TextArea rows={4} placeholder="Nhập nội dung" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={addContactMutation.isPending}>
            Gửi liên hệ
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}

export default ContactAddPage
