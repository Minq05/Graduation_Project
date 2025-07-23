import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from '@/config/axios.customize'
import {
  Table, Modal, Button, Tag, Space, message
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { IContact } from '@/types/contact'

export default function AdminContactPage() {
  const queryClient = useQueryClient()
  const [selectedContact, setSelectedContact] = useState<IContact | null>(null)

  const { data: contacts, isLoading } = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      const res = await axios.get('/api/v1/contacts')
      return res.data?.results || []
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (_id: string) => {
      await axios.patch(`/api/v1/contacts/soft-delete/${_id}`, {
        deleted: true,
        deletedAt: new Date().toISOString()
      })
    },
    onSuccess: () => {
      message.success('Xoá liên hệ thành công')
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
    },
    onError: () => {
      message.error('Xoá liên hệ thất bại')
    }
  })

  const handleSoftDelete = (_id: string) => {
    Modal.confirm({
      title: 'Xác nhận xoá',
      content: 'Bạn có chắc muốn xoá liên hệ này?',
      okText: 'Xoá',
      okType: 'danger',
      cancelText: 'Huỷ',
      onOk() {
        deleteMutation.mutate(_id)
      }
    })
  }

  const handleView = (contact: IContact) => {
    setSelectedContact(contact)
  }

  const columns: ColumnsType<IContact> = [
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'SĐT',
      dataIndex: 'phone',
      key: 'phone'
    },
    {
      title: 'Ngày gửi',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (value: string) => new Date(value).toLocaleString()
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => (
        !record.deleted
          ? <Tag color='green'>Đã đọc</Tag>
          : <Tag color='red'>Đã xoá</Tag>
      )
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type='link' onClick={() => handleView(record)} disabled={record.deleted}>Xem</Button>
          <Button
            danger
            type='link'
            onClick={() => handleSoftDelete(record._id)}
            disabled={record.deleted}
          >
            Xoá
          </Button>
        </Space>
      )
    }
  ]

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
      <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 16 }}>Quản lý liên hệ</h2>
      <Link to='/contact/add'>
        <Button type='primary' style={{ marginBottom: 20 }}>Thêm mới liên hệ</Button>
      </Link>
      <Table
        columns={columns}
        dataSource={contacts?.filter((c: any) => !c.deleted)}
        rowKey='_id'
        bordered
        loading={isLoading}
      />

      <Modal
        open={!!selectedContact}
        onCancel={() => setSelectedContact(null)}
        title='Chi tiết liên hệ'
        footer={<Button onClick={() => setSelectedContact(null)}>Đóng</Button>}
      >
        {selectedContact && (
          <>
            <p><strong>Tên:</strong> {selectedContact.name}</p>
            <p><strong>Email:</strong> {selectedContact.email}</p>
            <p><strong>SĐT:</strong> {selectedContact.phone}</p>
            <p><strong>Ngày gửi:</strong> {new Date(selectedContact.createdAt).toLocaleString()}</p>
            <p><strong>Nội dung:</strong></p>
            <p style={{ whiteSpace: 'pre-wrap' }}>{selectedContact.message}</p>
          </>
        )}
      </Modal>
    </div>
  )
}
