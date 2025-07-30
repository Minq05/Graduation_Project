import { useState } from 'react'
import { Table, Button, Modal, Form, InputNumber, DatePicker, message, Space, Tooltip, Select, Tag } from 'antd'
import { EditOutlined, DeleteOutlined, ExclamationCircleOutlined, PlusOutlined, CarOutlined, EyeOutlined } from '@ant-design/icons'
import moment from 'moment'
import { IOrderItem } from '@/types/orders'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router'
import { fetchAllOrdersAPI, updateOrderStatusAPI, cancelOrderAPI } from '@/services/order-service/order.apis'
import { createShippingOrderAPI } from '@/services/shipping-service/shipping.apis'
import { ORDER_KEYS } from '@/services/order-service/order.keys'
import axios from 'axios'

const OrderPage = () => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [currentItem, setCurrentItem] = useState<IOrderItem | null>(null)
  const [form] = Form.useForm()
  const { confirm } = Modal
  const [messageApi, contextHolder] = message.useMessage()
  const queryClient = useQueryClient()

  interface IProduct {
  _id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  capacity: number;
  image: string;
  brandId: string;
  categoryId: string;
  discountId?: string;
  description: string;
}

  const { data  = [], isLoading, refetch } = useQuery({
    queryKey: [ORDER_KEYS.FETCH_ALL_ORDERS],
    queryFn: async () => {
      try {
        console.log('Fetching orders from API...')
        const res = await fetchAllOrdersAPI()
        console.log('Orders API response:', res)
        
        if (res?.data?.results && Array.isArray(res.data.results)) {
          console.log('Found orders:', res.data.results.length)
          return res.data.results;
        } else {
          console.warn('No orders found or invalid response format')
          return [];
        }
      } catch (error) {
        console.error('Error fetching orders:', error)
        messageApi.error('Không thể lấy danh sách đơn hàng')
        return []
      }
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 0,
    refetchInterval: 5000
  })

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string, status: string }) => {
      return updateOrderStatusAPI(orderId, status)
    },
    onSuccess: () => {
      messageApi.success('Cập nhật trạng thái đơn hàng thành công')
      queryClient.invalidateQueries({ queryKey: [ORDER_KEYS.FETCH_ALL_ORDERS]})
    },
    onError: (error) => {
      messageApi.error('Có lỗi xảy ra khi cập nhật trạng thái đơn hàng')
      console.error('Error updating order status:', error)
    }
  })
  
  const cancelOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      return cancelOrderAPI(orderId)
    },
    onSuccess: () => {
      messageApi.success('Hủy đơn hàng thành công')
      queryClient.invalidateQueries({ queryKey: [ORDER_KEYS.FETCH_ALL_ORDERS]})
    },
    onError: (error) => {
      messageApi.error('Có lỗi xảy ra khi hủy đơn hàng')
      console.error('Error cancelling order:', error)
    }
  })
  
  // Mutation để tạo vận đơn GHN
  const createShippingMutation = useMutation({
    mutationFn: async (orderId: string) => {
      return createShippingOrderAPI(orderId)
    },
    onSuccess: () => {
      messageApi.success('Tạo vận đơn GHN thành công')
      queryClient.invalidateQueries({ queryKey: [ORDER_KEYS.FETCH_ALL_ORDERS]})
      setIsModalVisible(false)
    },
    onError: (error) => {
      messageApi.error('Có lỗi xảy ra khi tạo vận đơn GHN')
      console.error('Error creating shipping order:', error)
    }
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'orange';
      case 'confirmed': return 'blue';
      case 'processing': return 'cyan';
      case 'shipped': return 'geekblue';
      case 'delivered': return 'purple';
      case 'completed': return 'green';
      case 'cancelled': return 'red';
      case 'refunded': return 'volcano';
      default: return 'default';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'green';
      case 'pending': return 'orange';
      case 'failed': return 'red';
      case 'refunded': return 'volcano';
      case 'unpaid': return 'gray';
      case 'cancelled': return 'red';
      default: return 'default';
    }
  };

  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: '_id',
      key: '_id',
      render: (id: string) => <span className="font-medium">{id.slice(-8).toUpperCase()}</span>
    },
    {
      title: 'Khách hàng',
      dataIndex: 'userId',
      key: 'userId',
      render: (user: any) => {
        if (!user) return 'N/A';
        console.log('User data:', user);
        const fullName = user.fullName || user.name || 'Không có tên';
        const email = user.email ? `(${user.email})` : '';
        return `${fullName} ${email}`;
      }
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (price: number) => price ? `${price.toLocaleString()} đ` : '-'
    },
    {
      title: 'Trạng thái đơn hàng',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const displayText = {
          'pending': 'Chờ xác nhận',
          'confirmed': 'Đã xác nhận',
          'processing': 'Đang xử lý',
          'shipped': 'Đang giao hàng',
          'delivered': 'Đã giao hàng',
          'completed': 'Hoàn thành',
          'cancelled': 'Đã hủy',
          'refunded': 'Đã hoàn tiền'
        }[status] || status;
        
        return <Tag color={getStatusColor(status)}>{displayText}</Tag>;
      }
    },
    {
      title: 'Phương thức vận chuyển',
      dataIndex: 'shippingMethod',
      key: 'shippingMethod',
      render: (method: string, record: any) => {
        // Kiểm tra xem có phải đơn hàng GHN không dựa vào ghi chú
        if (record.note && record.note.startsWith('[GHN]')) {
          return <Tag color="blue">Giao hàng nhanh (GHN)</Tag>;
        }
        
        switch (method) {
          case 'standard': return 'Giao hàng tiêu chuẩn';
          case 'express': return 'Giao hàng hỏa tốc';
          default: return method || 'N/A';
        }
      }
    },
    {
      title: 'Phương thức thanh toán',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (method: string) => {
        switch (method) {
          case 'vnpay': return 'VNPay';
          case 'momo': return 'MoMo';
          case 'cash': return 'Tiền mặt';
          case 'credit_card': return 'Thẻ tín dụng';
          default: return method || 'N/A';
        }
      }
    },
    {
      title: 'Trạng thái thanh toán',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      render: (status: string) => {
        const displayText = {
          'paid': 'Đã thanh toán',
          'pending': 'Đang xử lý',
          'failed': 'Thất bại',
          'refunded': 'Đã hoàn tiền',
          'unpaid': 'Chưa thanh toán',
          'cancelled': 'Đã hủy'
        }[status] || status;
        
        return <Tag color={getPaymentStatusColor(status)}>{displayText}</Tag>;
      }
    },
    {
      title: 'Trạng thái vận chuyển',
      dataIndex: ['shipping', 'statusCode'],
      key: 'shippingStatus',
      render: (statusCode: string, record: any) => {
        if (!record.shipping?.orderCode) {
          return <span>Chưa có vận đơn</span>;
        }
        
        // Mapping trạng thái vận chuyển sang màu sắc
        const statusColors: Record<string, string> = {
          'ready_to_pick': 'blue',
          'picking': 'cyan',
          'picked': 'geekblue',
          'delivering': 'purple',
          'delivered': 'green',
          'delivery_fail': 'orange',
          'waiting_to_return': 'gold',
          'return': 'volcano',
          'returned': 'red',
          'cancel': 'magenta',
          'exception': 'error',
        };
        
        // Mapping trạng thái vận chuyển sang tên tiếng Việt
        const statusNames: Record<string, string> = {
          'ready_to_pick': 'Chờ lấy hàng',
          'picking': 'Đang lấy hàng',
          'picked': 'Đã lấy hàng',
          'delivering': 'Đang giao hàng',
          'delivered': 'Đã giao hàng',
          'delivery_fail': 'Giao hàng thất bại',
          'waiting_to_return': 'Chờ trả hàng',
          'return': 'Đang trả hàng',
          'returned': 'Đã trả hàng',
          'cancel': 'Đã hủy',
          'exception': 'Ngoại lệ',
        };
        
        const color = statusColors[statusCode] || 'default';
        const statusText = record.shipping?.statusName || statusNames[statusCode] || 'Không xác định';
        
        return <Tag color={color}>{statusText}</Tag>;
      }
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      defaultSortOrder: 'descend',
      render: (value: string) => new Date(value).toLocaleString()
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Tooltip title="Chi tiết">
            <Button icon={<EditOutlined />} onClick={() => showOrderDetails(record)} />
          </Tooltip>
          {record.status === 'pending' && (
            <Tooltip title="Hủy đơn hàng">
              <Button
                icon={<DeleteOutlined />}
                danger
                onClick={() => showCancelConfirm(record._id)}
              >
                Hủy
              </Button>
            </Tooltip>
          )}
        </Space>
      )
    }
  ]

  const showOrderDetails = (order: any) => {
    // Hiển thị modal chi tiết đơn hàng
    setCurrentItem(order)
    setIsModalVisible(true)
  }

  const showCancelConfirm = (orderId: string) => {
    confirm({
      title: 'Bạn có chắc chắn muốn hủy đơn hàng này?',
      icon: <ExclamationCircleOutlined />,
      okText: 'Hủy đơn hàng',
      okType: 'danger',
      cancelText: 'Không',
      onOk() {
        cancelOrderMutation.mutate(orderId)
      }
    })
  }

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      updateStatusMutation.mutate({ orderId, status: newStatus })
      setIsModalVisible(false)
    } catch (error) {
      messageApi.error('Có lỗi xảy ra khi cập nhật trạng thái')
    }
  }

  return (
    <div>
      {contextHolder}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý đơn hàng</h1>
        <div className="flex gap-2">
          <Button 
            onClick={() => refetch()} 
            icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>}
          >
            Làm mới
          </Button>
          <Link to={`/orderitems/add`}>
            <Button type="primary" icon={<PlusOutlined />}>
              Thêm đơn hàng
            </Button>
          </Link>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="_id"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
        defaultSortOrder="descend"
        sortDirections={['descend', 'ascend']}
        expandable={{
          expandedRowRender: (record) => (
            <div>
              <h4 className="font-medium mb-2">Sản phẩm trong đơn hàng:</h4>
              <ul className="pl-5">
                {record.items?.map((item: any, index: number) => (
                  <li key={index} className="mb-1">
                    {item.productId?.name || 'Sản phẩm'} - {item.variantId?.sku || 'Phiên bản'} x {item.quantity} = {(item.price * item.quantity).toLocaleString()} đ
                  </li>
                )) || <li>Không có sản phẩm</li>}
              </ul>

              {record.addressFree && (
                <div className="mt-3">
                  <h4 className="font-medium mb-1">Địa chỉ giao hàng:</h4>
                  {record.addressFree.receiverName && <p><strong>Người nhận:</strong> {record.addressFree.receiverName}</p>}
                  {record.addressFree.receiverPhone && <p><strong>SĐT:</strong> {record.addressFree.receiverPhone}</p>}
                  <p>
                    {record.addressFree.province ? record.addressFree.province : ''}
                    {record.addressFree.district ? `, ${record.addressFree.district}` : ''}
                    {record.addressFree.ward ? `, ${record.addressFree.ward}` : ''}
                    {record.addressFree.address ? `, ${record.addressFree.address}` : ''}
                  </p>
                </div>
              )}
              
              {record.shipping?.orderCode && (
                <div className="mt-3">
                  <h4 className="font-medium mb-1">Thông tin vận chuyển:</h4>
                  <p><strong>Mã vận đơn:</strong> {record.shipping.orderCode}</p>
                  <p>
                    <strong>Trạng thái vận chuyển:</strong> {' '}
                    {(() => {
                      // Mapping trạng thái vận chuyển sang màu sắc
                      const statusColors: Record<string, string> = {
                        'ready_to_pick': 'blue',
                        'picking': 'cyan',
                        'picked': 'geekblue',
                        'delivering': 'purple',
                        'delivered': 'green',
                        'delivery_fail': 'orange',
                        'waiting_to_return': 'gold',
                        'return': 'volcano',
                        'returned': 'red',
                        'cancel': 'magenta',
                        'exception': 'error',
                      };
                      
                      // Mapping trạng thái vận chuyển sang tên tiếng Việt
                      const statusNames: Record<string, string> = {
                        'ready_to_pick': 'Chờ lấy hàng',
                        'picking': 'Đang lấy hàng',
                        'picked': 'Đã lấy hàng',
                        'delivering': 'Đang giao hàng',
                        'delivered': 'Đã giao hàng',
                        'delivery_fail': 'Giao hàng thất bại',
                        'waiting_to_return': 'Chờ trả hàng',
                        'return': 'Đang trả hàng',
                        'returned': 'Đã trả hàng',
                        'cancel': 'Đã hủy',
                        'exception': 'Ngoại lệ',
                      };
                      
                      const statusCode = record.shipping?.statusCode;
                      const color = statusColors[statusCode] || 'default';
                      const statusText = record.shipping?.statusName || statusNames[statusCode] || 'Không xác định';
                      
                      return <Tag color={color}>{statusText}</Tag>;
                    })()}
                  </p>
                  {record.shipping.expectedDeliveryTime && (
                    <p><strong>Thời gian dự kiến:</strong> {record.shipping.expectedDeliveryTime}</p>
                  )}
                  {record.shipping.fee && (
                    <p><strong>Phí vận chuyển:</strong> {record.shipping.fee.toLocaleString('vi-VN')}đ</p>
                  )}
                </div>
              )}
            </div>
          ),
        }}
      />

      <Modal
        title="Chi tiết đơn hàng"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalVisible(false)}>
            Đóng
          </Button>,
          currentItem && currentItem.status === 'delivered' && (
            <div key="info" style={{ marginRight: 8, color: '#1890ff' }}>
            </div>
          ),
          currentItem && currentItem.status !== 'cancelled' && currentItem.status !== 'completed' && currentItem.status !== 'refunded' && (
            <>
              {/* Chỉ hiển thị các trạng thái mà admin có quyền thay đổi */}
              {!currentItem.shipping?.orderCode ? (
                <Select
                  key="status"
                  style={{ width: 200, marginRight: 8 }}
                  placeholder="Cập nhật trạng thái"
                  onChange={(value) => handleUpdateStatus(currentItem._id, value)}
                  defaultValue={currentItem?.status}
                >
                  {/* Trước khi tạo vận đơn, admin có thể thay đổi trạng thái */}
                  {/* Chỉ hiển thị trạng thái hiện tại và trạng thái tiếp theo, disable các trạng thái cũ */}
                  <Select.Option value="pending" disabled={currentItem.status !== 'pending'}>Chờ xác nhận</Select.Option>
                  <Select.Option value="confirmed" disabled={currentItem.status !== 'pending' && currentItem.status !== 'confirmed'}>Đã xác nhận</Select.Option>
                  <Select.Option value="processing" disabled={currentItem.status !== 'confirmed' && currentItem.status !== 'processing'}>Đang xử lý</Select.Option>
                  <Select.Option value="shipped" disabled={currentItem.status !== 'processing' && currentItem.status !== 'shipped'}>Đang giao hàng</Select.Option>
                  <Select.Option value="delivered" disabled={currentItem.status !== 'shipped' && currentItem.status !== 'delivered'}>Đã giao hàng</Select.Option>
                  <Select.Option value="completed" disabled={currentItem.status !== 'delivered' && currentItem.status !== 'completed'}>Hoàn thành</Select.Option>
                  <Select.Option value="cancelled" disabled={currentItem.status !== 'pending'}>Hủy đơn hàng</Select.Option>
                </Select>
              ) : (
                <div style={{ marginRight: 8 }}>
                  <Tag color="blue">Đơn hàng đang được xử lý bởi GHN</Tag>
                  <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                    Trạng thái đơn hàng được cập nhật tự động từ GHN
                  </div>
                </div>
              )}
              
              {/* Nút tạo vận đơn GHN - chỉ hiển thị khi đơn hàng cần tạo vận đơn GHN */}
              {(currentItem.status === 'confirmed') && !currentItem.shipping?.orderCode && 
               currentItem.note && currentItem.note.startsWith('[GHN]') && (
                <Button 
                  key="create-shipping"
                  type="primary"
                  icon={<CarOutlined />}
                  onClick={() => createShippingMutation.mutate(currentItem._id)}
                  loading={createShippingMutation.isPending}
                  style={{ marginRight: 8 }}
                >
                  Tạo vận đơn GHN
                </Button>
              )}
              
              {/* Nút xem trạng thái vận chuyển */}
              {currentItem.shipping?.orderCode && (
                <Button
                  key="view-shipping"
                  type="default"
                  icon={<EyeOutlined />}
                  onClick={() => window.open(`/shipping`, '_blank')}
                >
                  Xem vận chuyển
                </Button>
              )}
            </>
          )
        ]}
        width={700}
      >
        {currentItem && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-500">Mã đơn hàng:</p>
                <p className="font-medium">{currentItem._id}</p>
              </div>
              <div>
                <p className="text-gray-500">Ngày tạo:</p>
                <p>{new Date(currentItem.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-500">Khách hàng:</p>
                <p className="font-medium">{currentItem.userId?.fullName || currentItem.userId?.name || 'Không có tên'}</p>
              </div>
              <div>
                <p className="text-gray-500">Email:</p>
                <p>{currentItem.userId?.email || 'Không có email'}</p>
              </div>
              <div>
                <p className="text-gray-500">Số điện thoại:</p>
                <p>{currentItem.userId?.phone || currentItem.addressFree?.receiverPhone || 'Không có số điện thoại'}</p>
              </div>
              <div>
                <p className="text-gray-500">Tổng tiền:</p>
                <p className="font-medium">{currentItem.totalPrice?.toLocaleString()} đ</p>
              </div>
              <div>
                <p className="text-gray-500">Phí vận chuyển:</p>
                <p>{currentItem.shippingPrice?.toLocaleString()} đ</p>
              </div>
              <div>
                <p className="text-gray-500">Phương thức thanh toán:</p>
                <p>{{
                    'vnpay': 'VNPay',
                    'momo': 'MoMo',
                    'cash': 'Tiền mặt',
                    'credit_card': 'Thẻ tín dụng'
                  }[currentItem.paymentMethod] || currentItem.paymentMethod}</p>
              </div>
              <div>
                <p className="text-gray-500">Phương thức vận chuyển:</p>
                {currentItem.note && currentItem.note.startsWith('[GHN]') ? (
                  <Tag color="blue">Giao hàng nhanh (GHN)</Tag>
                ) : (
                  <p>{{
                    'standard': 'Giao hàng tiêu chuẩn',
                    'express': 'Giao hàng hỏa tốc'
                  }[currentItem.shippingMethod] || currentItem.shippingMethod}</p>
                )}
                {currentItem.note && currentItem.note.startsWith('[GHN]') && !currentItem.shipping?.orderCode && (
                  <div style={{ fontSize: '12px', color: '#ff4d4f', marginTop: '4px' }}>
                    Cần tạo vận đơn GHN
                  </div>
                )}
              </div>
              <div>
                <p className="text-gray-500">Lí do hủy/hoàn tiền:</p>
                <p>{currentItem.reason}</p>
              </div>
              <div>
                <p className="text-gray-500">Trạng thái thanh toán:</p>
                <Tag color={getPaymentStatusColor(currentItem.paymentStatus)}>{
                  {
                    'paid': 'Đã thanh toán',
                    'pending': 'Đang xử lý',
                    'failed': 'Thất bại',
                    'refunded': 'Đã hoàn tiền',
                    'unpaid': 'Chưa thanh toán',
                    'cancelled': 'Đã hủy'
                  }[currentItem.paymentStatus] || currentItem.paymentStatus
                }</Tag>
              </div>
              {currentItem.shipping?.orderCode && (
                <div>
                  <p className="text-gray-500">Trạng thái vận chuyển:</p>
                  <div>
                    {(() => {
                      // Mapping trạng thái vận chuyển sang màu sắc
                      const statusColors: Record<string, string> = {
                        'ready_to_pick': 'blue',
                        'picking': 'cyan',
                        'picked': 'geekblue',
                        'delivering': 'purple',
                        'delivered': 'green',
                        'delivery_fail': 'orange',
                        'waiting_to_return': 'gold',
                        'return': 'volcano',
                        'returned': 'red',
                        'cancel': 'magenta',
                        'exception': 'error',
                      };
                      
                      // Mapping trạng thái vận chuyển sang tên tiếng Việt
                      const statusNames: Record<string, string> = {
                        'ready_to_pick': 'Chờ lấy hàng',
                        'picking': 'Đang lấy hàng',
                        'picked': 'Đã lấy hàng',
                        'delivering': 'Đang giao hàng',
                        'delivered': 'Đã giao hàng',
                        'delivery_fail': 'Giao hàng thất bại',
                        'waiting_to_return': 'Chờ trả hàng',
                        'return': 'Đang trả hàng',
                        'returned': 'Đã trả hàng',
                        'cancel': 'Đã hủy',
                        'exception': 'Ngoại lệ',
                      };
                      
                      const statusCode = currentItem.shipping?.statusCode;
                      const color = statusColors[statusCode] || 'default';
                      const statusText = currentItem.shipping?.statusName || statusNames[statusCode] || 'Không xác định';
                      
                      return <Tag color={color}>{statusText}</Tag>;
                    })()} 
                    <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                      Mã vận đơn: {currentItem.shipping?.orderCode}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Sản phẩm:</h4>
              <Table
                dataSource={currentItem.items || []}
                rowKey="_id"
                pagination={false}
                size="small"
                columns={[
                  {
                    title: 'Sản phẩm',
                    dataIndex: 'productId',
                    key: 'product',
                    render: (product) => product?.name || 'N/A'
                  },
                  {
                    title: 'Dung tích',
                    key: 'capacity',
                    render: (_, record) => {
                      // Kiểm tra và log dữ liệu để debug
                      console.log('Product data:', record.productId);
                      console.log('Variant data:', record.variantId);
                      
                      // Lấy dung tích từ sản phẩm chính
                      const productCapacity = record.productId?.capacity;
                      
                      // Kiểm tra variant_attributes
                      const attrs = record.variantId?.variant_attributes || [];
                      console.log('Variant attributes:', attrs);
                      
                      // Tìm thuộc tính dung tích trong variant_attributes
                      let variantCapacity = null;
                      for (const attr of attrs) {
                        console.log('Checking attribute:', attr);
                        if (attr?.attributeId) {
                          const slug = attr.attributeId.slug?.toLowerCase();
                          const name = attr.attributeId.name?.toLowerCase();
                          console.log('Attribute slug:', slug, 'name:', name);
                          
                          if (slug === 'dung-tich' || name === 'dung tích' || name === 'dung tich' || 
                              slug === 'capacity' || name === 'capacity') {
                            variantCapacity = attr.value;
                            console.log('Found capacity in variant:', variantCapacity);
                            break;
                          }
                        }
                      }
                      
                      // Hiển thị dung tích từ variant hoặc sản phẩm chính
                      if (variantCapacity) {
                        return `${variantCapacity}ml`;
                      } else if (productCapacity) {
                        return `${productCapacity}ml`;
                      } else {
                        return '100ml'; // Giá trị mặc định nếu không tìm thấy
                      }
                    }
                  },


                  {
                    title: 'Phiên bản',
                    dataIndex: 'variantId',
                    key: 'variant',
                    render: (variant) => variant?.sku || 'N/A'
                  },
                  {
                    title: 'Số lượng',
                    dataIndex: 'quantity',
                    key: 'quantity'
                  },
                  {
                    title: 'Đơn giá',
                    dataIndex: 'price',
                    key: 'price',
                    render: (price) => `${price?.toLocaleString()} đ`
                  },
                  {
                    title: 'Thành tiền',
                    key: 'total',
                    render: (_, record) => `${(record.price * record.quantity).toLocaleString()} đ`
                  }
                ]}
              />
            </div>
            

            
            {currentItem.addressFree && (
              <div>
                <h4 className="font-medium mb-1">Địa chỉ giao hàng:</h4>
                {currentItem.addressFree.receiverName && (
                  <p><strong>Người nhận:</strong> {currentItem.addressFree.receiverName}</p>
                )}
                {currentItem.addressFree.receiverPhone && (
                  <p><strong>Số điện thoại:</strong> {currentItem.addressFree.receiverPhone}</p>
                )}
                <p>
                  {currentItem.addressFree.province ? currentItem.addressFree.province : ''}
                  {currentItem.addressFree.district ? `, ${currentItem.addressFree.district}` : ''}
                  {currentItem.addressFree.ward ? `, ${currentItem.addressFree.ward}` : ''}
                  {currentItem.addressFree.address ? `, ${currentItem.addressFree.address}` : ''}
                </p>
              </div>
            )}
            
            {currentItem.note && (
              <div>
                <h4 className="font-medium mb-1">Ghi chú:</h4>
                <p>{currentItem.note.startsWith('[GHN]') 
                    ? currentItem.note.substring(5).trim() || 'Đơn hàng Giao Hàng Nhanh' 
                    : currentItem.note}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default OrderPage
