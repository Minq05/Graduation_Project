import { useState, useCallback, useEffect } from 'react'
import { Button, Card, Col, Input, Popconfirm, Row, Space, Table, Tag, message, Tooltip } from 'antd'
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined, PlayCircleOutlined, PauseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import type { ColumnsType } from 'antd/es/table'

import { getAllFlashSales, deleteFlashSale, activateFlashSale, deactivateFlashSale } from '@/services/flash-sale-service/flash-sale.apis'
import { FLASH_SALE_QUERY_KEYS } from '@/services/flash-sale-service/flash-sale.keys'
import { IFlashSale } from '@/types/flash-sale'
import FlashSaleForm from './flash-sale.form'
import FlashSaleItemsModal from './flash-sale-items.modal'
import { debounce } from 'lodash'

const FlashSalePage = () => {
  const [searchText, setSearchText] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingFlashSale, setEditingFlashSale] = useState<IFlashSale | null>(null)
  const [selectedFlashSaleId, setSelectedFlashSaleId] = useState<string | null>(null)
  const [isItemsModalOpen, setIsItemsModalOpen] = useState(false)
  const [_, setForceUpdate] = useState(0)
  
  const queryClient = useQueryClient()
  
  useEffect(() => {
    const timer = setInterval(() => {
      setForceUpdate(prev => prev + 1)
    }, 2000)
    
    return () => clearInterval(timer)
  }, [])

  const { data: flashSalesData, isLoading } = useQuery({
    queryKey: [FLASH_SALE_QUERY_KEYS.FETCH_ALL, { current: 1, pageSize: 1000 }],
    queryFn: () => getAllFlashSales({
      current: 1,
      pageSize: 1000,
      qs: ''
    }),
    select: (response) => response.data
  })

  const deleteMutation = useMutation({
    mutationFn: deleteFlashSale,
    onSuccess: () => {
      message.success('Xóa flash sale thành công')
      queryClient.invalidateQueries({ queryKey: [FLASH_SALE_QUERY_KEYS.FETCH_ALL] })
    },
    onError: () => {
      message.error('Có lỗi xảy ra khi xóa flash sale')
    }
  })

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id)
  }

  const handleEdit = (record: IFlashSale) => {
    setEditingFlashSale(record)
    setIsModalOpen(true)
  }

  const handleAdd = () => {
    setEditingFlashSale(null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingFlashSale(null)
  }

  const handleViewItems = (flashSaleId: string) => {
    setSelectedFlashSaleId(flashSaleId)
    setIsItemsModalOpen(true)
  }

  const handleCloseItemsModal = () => {
    setIsItemsModalOpen(false)
    setSelectedFlashSaleId(null)
  }

  const setSearchTextDebounced = useCallback(
    debounce((value: string) => {
      setSearchText(value)
    }, 400),
    []
  )

  const filteredData = flashSalesData?.results?.filter((item: IFlashSale) =>
    item.name.toLowerCase().includes(searchText.toLowerCase())
  )
  const activateFlashSaleMutation = useMutation({
    mutationFn: activateFlashSale,
    onSuccess: () => {
      message.success('Kích hoạt flash sale thành công')
      queryClient.invalidateQueries({ queryKey: [FLASH_SALE_QUERY_KEYS.FETCH_ALL] })
    },
    onError: () => {
      message.error('Có lỗi xảy ra khi kích hoạt flash sale')
    }
  })

  const deactivateFlashSaleMutation = useMutation({
    mutationFn: deactivateFlashSale,
    onSuccess: () => {
      message.success('Hủy kích hoạt flash sale thành công')
      queryClient.invalidateQueries({ queryKey: [FLASH_SALE_QUERY_KEYS.FETCH_ALL] })
    },
    onError: () => {
      message.error('Có lỗi xảy ra khi hủy kích hoạt flash sale')
    }
  })

  const handleToggleActivation = (record: IFlashSale, activate: boolean) => {
    if (activate) {
      activateFlashSaleMutation.mutate(record._id)
    } else {
      deactivateFlashSaleMutation.mutate(record._id)
    }
  }

  const getRemainingTime = (date: string | Date) => {
    const now = dayjs()
    const target = dayjs(date)
    const diff = target.diff(now, 'second')
    
    if (diff <= 0) return ''
    
    const days = Math.floor(diff / (24 * 60 * 60))
    const hours = Math.floor((diff % (24 * 60 * 60)) / (60 * 60))
    const minutes = Math.floor((diff % (60 * 60)) / 60)
    
    if (days > 0) {
      return `${days} ngày ${hours} giờ`
    } else if (hours > 0) {
      return `${hours} giờ ${minutes} phút`
    } else {
      return `${minutes} phút`
    }
  }
  
  const getFlashSaleStatus = (record: IFlashSale) => {
    const now = dayjs()
    const start = dayjs(record.startDate)
    const end = dayjs(record.endDate)
    
    if (now.isBefore(start)) {
      return {
        status: 'upcoming',
        color: 'blue',
        text: 'Sắp diễn ra',
        tooltip: `Bắt đầu sau: ${getRemainingTime(record.startDate)}`
      }
    } else if (now.isAfter(end)) {
      return {
        status: 'ended',
        color: 'red',
        text: 'Đã kết thúc',
        tooltip: ''
      }
    } else {
      return {
        status: 'active',
        color: 'green',
        text: 'Đang diễn ra',
        tooltip: `Kết thúc sau: ${getRemainingTime(record.endDate)}`
      }
    }
  }

  const columns: ColumnsType<IFlashSale> = [
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <a onClick={() => handleViewItems(record._id)}>{text}</a>
      )
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm')
    },
    {
      title: 'Ngày kết thúc',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm')
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => {
        const status = getFlashSaleStatus(record)
        
        if (status.tooltip) {
          return (
            <Tooltip title={status.tooltip}>
              <Tag color={status.color} icon={<ClockCircleOutlined />}>
                {status.text}
              </Tag>
            </Tooltip>
          )
        } else {
          return <Tag color={status.color}>{status.text}</Tag>
        }
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => {
        const status = getFlashSaleStatus(record)
        const isActive = status.status === 'active'
        const canActivate = status.status !== 'ended' // Có thể kích hoạt nếu chưa kết thúc
        
        return (
          <Space size="middle">
            <Button 
              type="primary" 
              icon={<EditOutlined />} 
              onClick={() => handleEdit(record)}
            />
            
            {canActivate && (
              isActive ? (
                <Tooltip title="Tạm dừng Flash Sale">
                  <Button 
                    icon={<PauseCircleOutlined />} 
                    onClick={() => handleToggleActivation(record, false)}
                  />
                </Tooltip>
              ) : (
                <Tooltip title="Kích hoạt Flash Sale">
                  <Button 
                    type="primary" 
                    ghost
                    icon={<PlayCircleOutlined />} 
                    onClick={() => handleToggleActivation(record, true)}
                  />
                </Tooltip>
              )
            )}
            
            <Popconfirm
              title="Xóa flash sale"
              description="Bạn có chắc chắn muốn xóa flash sale này?"
              onConfirm={() => handleDelete(record._id)}
              okText="Xóa"
              cancelText="Hủy"
            >
              <Button danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        )
      }
    }
  ]

  return (
    <div>
      <Card title="Quản lý Flash Sale">
        <Row gutter={[16, 16]} className="mb-4">
          <Col span={8}>
            <Input
              placeholder="Tìm kiếm theo tên"
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
              Thêm Flash Sale
            </Button>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="_id"
          loading={isLoading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: filteredData?.length || 0,
            onChange: (page, pageSize) => {
              setCurrentPage(page)
              setPageSize(pageSize)
            }
          }}
        />
      </Card>

      <FlashSaleForm
        open={isModalOpen}
        onCancel={handleCloseModal}
        flashSale={editingFlashSale}
      />

      {selectedFlashSaleId && (
        <FlashSaleItemsModal
          open={isItemsModalOpen}
          onCancel={handleCloseItemsModal}
          flashSaleId={selectedFlashSaleId}
        />
      )}
    </div>
  )
}

export default FlashSalePage
