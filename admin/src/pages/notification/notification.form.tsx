import { useEffect } from 'react'
import { Modal, Form, Input, Switch, message, Select } from 'antd'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

import { createNotification, updateNotification } from '@/services/notification-service/notification.apis'
import { NOTIFICATION_QUERY_KEYS } from '@/services/notification-service/notification.keys'
import { INotification } from '@/types/notification'

interface NotificationFormProps {
  open: boolean
  onCancel: () => void
  notification?: INotification | null
}

const NotificationForm = ({ open, onCancel, notification }: NotificationFormProps) => {
  const [form] = Form.useForm()
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: createNotification,
    onSuccess: () => {
      message.success('Tạo thông báo thành công')
      queryClient.invalidateQueries({ queryKey: [NOTIFICATION_QUERY_KEYS.FETCH_ALL] })
      handleCancel()
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra khi tạo thông báo')
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<INotification> }) =>
      updateNotification(id, data),
    onSuccess: () => {
      message.success('Cập nhật thông báo thành công')
      queryClient.invalidateQueries({ queryKey: [NOTIFICATION_QUERY_KEYS.FETCH_ALL] })
      handleCancel()
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông báo')
    }
  })

  useEffect(() => {
    if (open) {
      if (notification) {
        form.setFieldsValue({
          title: notification.title,
          content: notification.content,
          userId: notification.userId,
          isRead: notification.isRead
        })
      } else {
        form.resetFields()
      }
    }
  }, [open, notification, form])

  const handleCancel = () => {
    form.resetFields()
    onCancel()
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      
      if (notification) {
        updateMutation.mutate({
          id: notification._id,
          data: values
        })
      } else {
        createMutation.mutate({ ...values, userId: 'all' })
      }
    } catch (error) {
      console.error('Validation failed:', error)
      console.error('Error fields:', error.errorFields)
      error.errorFields?.forEach((field: any) => {
        console.error('Field error:', field.name, field.errors)
      })
    }
  }

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link'],
      ['clean']
    ],
  }



  return (
    <Modal
      title={notification ? 'Cập nhật thông báo' : 'Tạo thông báo mới'}
      open={open}
      onCancel={handleCancel}
      onOk={handleSubmit}
      confirmLoading={createMutation.isPending || updateMutation.isPending}
      width={800}
      okText={notification ? 'Cập nhật' : 'Tạo'}
      cancelText="Hủy"
    >
      <Form
        form={form}
        layout="vertical"
        name="notification_form"
      >
        <Form.Item
          name="title"
          label="Tiêu đề"
          rules={[
            { required: true, message: 'Vui lòng nhập tiêu đề' },
            { max: 200, message: 'Tiêu đề không được vượt quá 200 ký tự' }
          ]}
        >
          <Input placeholder="Nhập tiêu đề thông báo" />
        </Form.Item>



        <Form.Item
          name="content"
          label="Nội dung"
          rules={[
            { required: true, message: 'Vui lòng nhập nội dung' }
          ]}
        >
          <ReactQuill
            theme="snow"
            modules={modules}
            placeholder="Nhập nội dung thông báo..."
            style={{ height: '200px', marginBottom: '50px' }}
          />
        </Form.Item>


      </Form>
    </Modal>
  )
}

export default NotificationForm