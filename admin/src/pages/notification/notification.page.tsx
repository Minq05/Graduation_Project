import { useState, useCallback } from 'react'
import { Button, Card, Col, Input, Popconfirm, Row, Space, Table, Tag, message, Modal } from 'antd'
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined, EyeOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import type { ColumnsType } from 'antd/es/table'
import { debounce } from 'lodash'

import { getAllNotifications, deleteNotification } from '@/services/notification-service/notification.apis'
import { NOTIFICATION_QUERY_KEYS } from '@/services/notification-service/notification.keys'
import { INotification } from '@/types/notification'
import NotificationForm from './notification.form'

const NotificationPage = () => {
  const [searchText, setSearchText] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingNotification, setEditingNotification] = useState<INotification | null>(null)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [viewingNotification, setViewingNotification] = useState<INotification | null>(null)
  
  const queryClient = useQueryClient()

  const { data: notificationsData, isLoading } = useQuery({
    queryKey: [NOTIFICATION_QUERY_KEYS.FETCH_ALL, { current: currentPage, pageSize, keyword: searchText }],
    queryFn: () => getAllNotifications({
      current: currentPage,
      pageSize,
      qs: searchText ? `keyword=${searchText}` : ''
    }),
    select: (response) => response.data
  })

  const deleteMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      message.success('Xóa thông báo thành công')
      queryClient.invalidateQueries({ queryKey: [NOTIFICATION_QUERY_KEYS.FETCH_ALL] })
    },
    onError: () => {
      message.error('Có lỗi xảy ra khi xóa thông báo')
    }
  })

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id)
  }

  const handleEdit = (record: INotification) => {
    setEditingNotification(record)
    setIsModalOpen(true)
  }

  const handleAdd = () => {
    setEditingNotification(null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingNotification(null)
  }

  const handleView = (record: INotification) => {
    setViewingNotification(record)
    setViewModalOpen(true)
  }

  const setSearchTextDebounced = useCallback(
    debounce((value: string) => {
      setSearchText(value)
      setCurrentPage(1)
    }, 400),
    []
  )

  const columns: ColumnsType<INotification> = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      width: 200
    },
    {
      title: 'Nội dung',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      width: 300,
      render: (text) => (
        <div dangerouslySetInnerHTML={{ __html: text?.substring(0, 100) + '...' }} />
      )
    },


    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm')
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="default" 
            icon={<EyeOutlined />} 
            onClick={() => handleView(record)}
            size="small"
          />
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
            size="small"
          />
          <Popconfirm
            title="Xóa thông báo"
            description="Bạn có chắc chắn muốn xóa thông báo này?"
            onConfirm={() => handleDelete(record._id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div>
      <Card title="Quản lý thông báo">
        <Row gutter={[16, 16]} className="mb-4">
          <Col span={8}>
            <Input
              placeholder="Tìm kiếm theo tiêu đề hoặc nội dung"
              prefix={<SearchOutlined />}
              allowClear
              onChange={(e) => setSearchTextDebounced(e.target.value)}
            />
          </Col>
          <Col span={16} style={{ textAlign: 'right' }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
            >
              Tạo thông báo
            </Button>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={notificationsData?.results}
          rowKey="_id"
          loading={isLoading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: notificationsData?.meta.total || 0,
            onChange: (page, pageSize) => {
              setCurrentPage(page)
              setPageSize(pageSize)
            }
          }}
        />
      </Card>

      <NotificationForm
        open={isModalOpen}
        onCancel={handleCloseModal}
        notification={editingNotification}
      />

      <Modal
        title="Chi tiết thông báo"
        open={viewModalOpen}
        onCancel={() => setViewModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalOpen(false)}>
            Đóng
          </Button>
        ]}
        width={600}
      >
        {viewingNotification && (
          <div>
            <div className="mb-4">
              <strong>Tiêu đề:</strong>
              <p>{viewingNotification.title}</p>
            </div>
            <div className="mb-4">
              <strong>Nội dung:</strong>
              <div dangerouslySetInnerHTML={{ __html: viewingNotification.content }} />
            </div>


            <div>
              <strong>Ngày tạo:</strong>
              <p>{dayjs(viewingNotification.createdAt).format('DD/MM/YYYY HH:mm:ss')}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default NotificationPage