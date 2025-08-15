import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Tag, Space, Modal, message, Tooltip, Card, Typography, Descriptions, Select } from 'antd';
import { ReloadOutlined, SearchOutlined, EyeOutlined, CarOutlined, StopOutlined, EditOutlined } from '@ant-design/icons';
import axios from '../../config/axios.customize';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createShippingOrderAPI, getShippingStatusAPI, cancelShippingOrderAPI, updateShippingStatusAPI } from '@/services/shipping-service/shipping.apis';

const { Title, Text } = Typography;
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

const ShippingManagement: React.FC = () => {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [updateStatusModalVisible, setUpdateStatusModalVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const queryClient = useQueryClient();
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefreshTime, setLastRefreshTime] = useState<string>('');

  // Fetch orders with shipping information
  const { data: orders, isLoading, refetch, error } = useQuery({
    queryKey: ['orders-with-shipping'],
    queryFn: async () => {
      try {
        const response = await axios.get('/api/v1/orders');
        console.log('Orders response:', response.data);
        
        // Kiểm tra cấu trúc dữ liệu thực tế
        const results = response.data?.results || [];
        console.log('Orders array:', results);
        
        // Filter orders that have shipping information
        const filteredOrders = results.filter((order: any) => {
          console.log('Order:', order._id, 'has shipping:', !!order.shipping?.orderCode);
          return order.shipping?.orderCode;
        });
        
        console.log('Filtered orders with shipping:', filteredOrders.length);
        return filteredOrders;
      } catch (error) {
        console.error('Lỗi khi lấy danh sách đơn hàng:', error);
        message.error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.');
        return [];
      }
    },
    refetchOnWindowFocus: true,
    retry: 1
  });

  // Hàm cập nhật trạng thái tất cả đơn hàng có vận đơn
  const updateAllOrdersStatus = useCallback(async () => {
    if (!orders || orders.length === 0) return;
    
    try {
      const ordersWithShipping = orders.filter(order => 
        order.shipping?.orderCode && 
        order.shipping?.statusCode !== 'delivered' && 
        order.shipping?.statusCode !== 'cancel' &&
        order.shipping?.statusCode !== 'returned'
      );
      
      console.log(`Đang cập nhật trạng thái cho ${ordersWithShipping.length} đơn hàng`);
      
      // Nếu không có đơn hàng nào cần cập nhật
      if (ordersWithShipping.length === 0) {
        setLastRefreshTime(new Date().toLocaleTimeString());
        return;
      }
      
      // Cập nhật từng đơn hàng
      for (const order of ordersWithShipping) {
        try {
          const response = await getShippingStatusAPI(order._id).catch(error => {
            console.error(`Lỗi kết nối API khi cập nhật đơn hàng ${order._id}:`, error);
            return { data: { order } }; // Trả về dữ liệu hiện tại nếu không thể kết nối
          });
          
          console.log(`Đã cập nhật trạng thái đơn hàng ${order._id}`);
          
          // Kiểm tra cấu trúc dữ liệu trả về
          const updatedOrder = response?.data?.order || response?.data || order;
          const shippingStatus = updatedOrder?.shipping?.statusCode;
          
          // Cập nhật trạng thái đơn hàng dựa trên trạng thái vận chuyển
          if (shippingStatus === 'cancel') {
            // Nếu GHN đã hủy đơn, cập nhật trạng thái đơn hàng thành 'cancelled'
            await axios.patch(`/api/v1/orders/${order._id}/status`, {
              status: 'cancelled',
              reason: 'Hủy bởi GHN'
            });
            console.log(`Đã cập nhật đơn hàng ${order._id} thành trạng thái hủy`);
          } else if (shippingStatus === 'ready_to_pick') {
            // Đơn hàng đang chờ lấy hàng
            await axios.patch(`/api/v1/orders/${order._id}/status`, {
              status: 'processing'
            });
            console.log(`Đã cập nhật đơn hàng ${order._id} thành trạng thái đang xử lý`);
          } else if (['picking', 'picked', 'delivering'].includes(shippingStatus)) {
            // Đơn hàng đang được vận chuyển
            await axios.patch(`/api/v1/orders/${order._id}/status`, {
              status: 'shipped'
            });
            console.log(`Đã cập nhật đơn hàng ${order._id} thành trạng thái đang giao hàng`);
          } else if (shippingStatus === 'delivered') {
            // Nếu GHN đã giao hàng, cập nhật trạng thái đơn hàng thành 'delivered'
            await axios.patch(`/api/v1/orders/${order._id}/status`, {
              status: 'delivered'
            });
            console.log(`Đã cập nhật đơn hàng ${order._id} thành trạng thái đã giao hàng`);
          } else if (['delivery_fail', 'waiting_to_return', 'return', 'returned'].includes(shippingStatus)) {
            // Đơn hàng giao thất bại hoặc đang/đã trả hàng
            await axios.patch(`/api/v1/orders/${order._id}/status`, {
              status: 'cancelled',
              reason: 'Giao hàng thất bại hoặc đã trả hàng'
            });
            console.log(`Đã cập nhật đơn hàng ${order._id} thành trạng thái hủy do giao hàng thất bại`);
          }
          
          // Đợi 1000ms giữa các request để tránh quá tải API
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`Lỗi cập nhật đơn hàng ${order._id}:`, error);
        }
      }
      
      // Cập nhật thời gian làm mới cuối cùng
      setLastRefreshTime(new Date().toLocaleTimeString());
      // Làm mới dữ liệu
      queryClient.invalidateQueries({ queryKey: ['orders-with-shipping'] });
      // Làm mới dữ liệu đơn hàng
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái đơn hàng:', error);
    }
  }, [orders, queryClient]);
  
  // Cập nhật tự động mỗi 15 phút
  useEffect(() => {
    if (!autoRefresh || !orders) return;
    
    // KHÔNG cập nhật ngay khi component được tải để tránh quá tải server
    // Chỉ cập nhật khi người dùng nhấn nút cập nhật
    
    // Thiết lập interval để cập nhật định kỳ
    const intervalId = setInterval(() => {
      updateAllOrdersStatus();
    }, 15 * 60 * 1000); // 15 phút
    
    return () => clearInterval(intervalId);
  }, [autoRefresh, updateAllOrdersStatus, orders]);

  // Create shipping order mutation
  const createShippingMutation = useMutation({
    mutationFn: async (orderId: string) => {
      return await createShippingOrderAPI(orderId);
    },
    onSuccess: () => {
      message.success('Đã tạo đơn vận chuyển thành công');
      queryClient.invalidateQueries({ queryKey: ['orders-with-shipping'] });
    },
    onError: (error: any) => {
      message.error(`Lỗi khi tạo đơn vận chuyển: ${error.response?.data?.message || error.message}`);
    }
  });

  // Get shipping status mutation
  const getStatusMutation = useMutation({
    mutationFn: async (orderId: string) => {
      try {
        return await getShippingStatusAPI(orderId);
      } catch (error) {
        console.error(`Lỗi kết nối API khi lấy trạng thái đơn hàng ${orderId}:`, error);
        message.error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.');
        throw error;
      }
    },
    onSuccess: async (data) => {
      message.success('Đã cập nhật trạng thái vận chuyển');
      
      // Đồng bộ trạng thái đơn hàng với trạng thái vận chuyển
      console.log('Get status response:', data);
      const updatedOrder = data?.data?.order || data?.data || data;
      const shippingStatus = updatedOrder?.shipping?.statusCode;
      
      // Cập nhật trạng thái đơn hàng dựa trên trạng thái vận chuyển
      if (shippingStatus === 'cancel') {
        // Nếu GHN đã hủy đơn, cập nhật trạng thái đơn hàng thành 'cancelled'
        await axios.patch(`/api/v1/orders/${updatedOrder._id}/status`, {
          status: 'cancelled',
          reason: 'Hủy bởi GHN'
        });
        message.warning('Đơn hàng đã bị hủy bởi GHN');
      } else if (shippingStatus === 'ready_to_pick') {
        // Đơn hàng đang chờ lấy hàng
        await axios.patch(`/api/v1/orders/${updatedOrder._id}/status`, {
          status: 'processing'
        });
        message.info('Đơn hàng đang được xử lý');
      } else if (['picking', 'picked', 'delivering'].includes(shippingStatus)) {
        // Đơn hàng đang được vận chuyển
        await axios.patch(`/api/v1/orders/${updatedOrder._id}/status`, {
          status: 'shipped'
        });
        message.info('Đơn hàng đang được giao');
      } else if (shippingStatus === 'delivered') {
        // Nếu GHN đã giao hàng, cập nhật trạng thái đơn hàng thành 'delivered'
        await axios.patch(`/api/v1/orders/${updatedOrder._id}/status`, {
          status: 'delivered'
        });
        message.success('Đơn hàng đã được giao thành công');
      } else if (['delivery_fail', 'waiting_to_return', 'return', 'returned'].includes(shippingStatus)) {
        // Đơn hàng giao thất bại hoặc đang/đã trả hàng
        await axios.patch(`/api/v1/orders/${updatedOrder._id}/status`, {
          status: 'cancelled',
          reason: 'Giao hàng thất bại hoặc đã trả hàng'
        });
        message.warning('Đơn hàng đã bị hủy do giao hàng thất bại');
      }
      
      // Làm mới dữ liệu
      queryClient.invalidateQueries({ queryKey: ['orders-with-shipping'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      
      // Show status details
      setSelectedOrder(updatedOrder);
      setDetailModalVisible(true);
    },
    onError: (error: any) => {
      message.error(`Lỗi khi lấy trạng thái vận chuyển: ${error.response?.data?.message || error.message}`);
    }
  });

  // Cancel shipping order mutation
  const cancelShippingMutation = useMutation({
    mutationFn: async ({ orderId, reason }: { orderId: string; reason: string }) => {
      return await cancelShippingOrderAPI(orderId, reason);
    },
    onSuccess: () => {
      message.success('Đã hủy đơn vận chuyển thành công');
      setCancelModalVisible(false);
      setCancelReason('');
      queryClient.invalidateQueries({ queryKey: ['orders-with-shipping'] });
    },
    onError: (error: any) => {
      message.error(`Lỗi khi hủy đơn vận chuyển: ${error.response?.data?.message || error.message}`);
    }
  });

  // Handle create shipping order
  const handleCreateShipping = (orderId: string) => {
    createShippingMutation.mutate(orderId);
  };

  // Handle get shipping status
  const handleGetStatus = (orderId: string) => {
    getStatusMutation.mutate(orderId);
  };

  // Handle cancel shipping
  const handleCancelShipping = () => {
    if (!selectedOrder?._id) return;
    
    cancelShippingMutation.mutate({
      orderId: selectedOrder._id,
      reason: cancelReason || 'Hủy bởi quản trị viên'
    });
  };

  // Show detail modal
  const showDetailModal = (order: any) => {
    setSelectedOrder(order);
    setDetailModalVisible(true);
  };
  
  // Show update status modal
  const showUpdateStatusModal = (order: any) => {
    setSelectedOrder(order);
    setSelectedStatus(order.shipping?.statusCode || '');
    setUpdateStatusModalVisible(true);
  };
  
  // Hàm refresh dữ liệu
  const refreshData = () => {
    // Làm mới dữ liệu
    queryClient.invalidateQueries({ queryKey: ['orders-with-shipping'] });
    queryClient.invalidateQueries({ queryKey: ['orders'] });
    refetch();
    setLastRefreshTime(new Date().toLocaleTimeString());
  };
  
  // Update shipping status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      // Cập nhật trạng thái vận chuyển
      return await updateShippingStatusAPI(orderId, status);
    },
    onSuccess: async (data) => {
      message.success('Đã cập nhật trạng thái vận chuyển');
      setUpdateStatusModalVisible(false);
      
      // Đồng bộ trạng thái đơn hàng với trạng thái vận chuyển
      // Kiểm tra cấu trúc dữ liệu trả về
      console.log('Update status response:', data);
      
      // Xử lý cấu trúc dữ liệu trả về từ API
      const updatedOrder = data?.data || data;
      const shippingStatus = updatedOrder?.shipping?.statusCode;
      
      try {
        // Cập nhật trạng thái đơn hàng dựa trên trạng thái vận chuyển
        if (shippingStatus === 'cancel') {
          // Nếu đã hủy đơn, cập nhật trạng thái đơn hàng thành 'cancelled'
          await axios.patch(`/api/v1/orders/${updatedOrder._id}/status`, {
            status: 'cancelled',
            reason: 'Hủy bởi quản trị viên'
          });
          message.warning('Đơn hàng đã bị hủy');
        } else if (shippingStatus === 'ready_to_pick') {
          // Đơn hàng đang chờ lấy hàng
          await axios.patch(`/api/v1/orders/${updatedOrder._id}/status`, {
            status: 'processing'
          });
          message.info('Đơn hàng đang được xử lý');
        } else if (['picking', 'picked', 'delivering'].includes(shippingStatus)) {
          // Đơn hàng đang được vận chuyển
          await axios.patch(`/api/v1/orders/${updatedOrder._id}/status`, {
            status: 'shipped'
          });
          message.info('Đơn hàng đang được giao');
        } else if (shippingStatus === 'delivered') {
          // Nếu đã giao hàng, cập nhật trạng thái đơn hàng thành 'delivered'
          await axios.patch(`/api/v1/orders/${updatedOrder._id}/status`, {
            status: 'delivered'
          });
          message.success('Đơn hàng đã được giao thành công');
        } else if (['delivery_fail', 'waiting_to_return', 'return', 'returned'].includes(shippingStatus)) {
          // Đơn hàng giao thất bại hoặc đang/đã trả hàng
          await axios.patch(`/api/v1/orders/${updatedOrder._id}/status`, {
            status: 'cancelled',
            reason: 'Giao hàng thất bại hoặc đã trả hàng'
          });
          message.warning('Đơn hàng đã bị hủy do giao hàng thất bại');
        }
      } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái đơn hàng:', error);
        message.error('Có lỗi xảy ra khi cập nhật trạng thái đơn hàng');
      } finally {
        // Làm mới dữ liệu
        queryClient.invalidateQueries({ queryKey: ['orders-with-shipping'] });
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        
        // Làm mới dữ liệu bằng cách gọi refetch
        refetch();
      }
    },
    onError: (error: any) => {
      message.error(`Lỗi khi cập nhật trạng thái vận chuyển: ${error.response?.data?.message || error.message}`);
    }
  });

  // Table columns
  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: '_id',
      key: '_id',
      render: (text: string) => <span>{text.slice(-8)}</span>,
    },
    {
      title: 'Khách hàng',
      dataIndex: 'userId',
      key: 'userId',
      render: (user: any) => <span>{user?.fullName || user?.name || 'Không có tên'}</span>,
    },
    {
      title: 'Mã vận đơn GHN',
      dataIndex: ['shipping', 'orderCode'],
      key: 'orderCode',
      render: (text: string) => <span>{text || 'Chưa có'}</span>,
    },
    {
      title: 'Trạng thái vận chuyển',
      dataIndex: ['shipping', 'statusCode'],
      key: 'statusCode',
      render: (status: string, record: any) => {
        // Nếu đơn hàng đã hủy, chỉ hiển thị "Đã hủy"
        if (status === 'cancel' || record.status === 'cancelled') {
          return <Tag color="red">Đã hủy</Tag>;
        }
        
        // Nếu không có trạng thái
        if (!status) {
          return <span>Chưa có trạng thái</span>;
        }
        // Hiển thị trạng thái vận chuyển bình thường
        const color = statusColors[status] || 'default';
        // Ưu tiên sử dụng statusName từ API, nếu không có thì dùng từ mapping
        const statusText = record.shipping?.statusName || statusNames[status] || 'Không xác định';
        return <Tag color={color}>{statusText}</Tag>;
      },
    },
    {
      title: 'Thời gian dự kiến',
      dataIndex: ['shipping', 'expectedDeliveryTime'],
      key: 'expectedDeliveryTime',
      render: (text: string) => <span>{text || 'Chưa xác định'}</span>,
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button 
              icon={<EyeOutlined />} 
              onClick={() => showDetailModal(record)} 
              type="primary" 
              ghost
            />
          </Tooltip>
          
          {!record.shipping?.orderCode && (
            <Tooltip title="Tạo vận đơn">
              <Button 
                icon={<CarOutlined />} 
                onClick={() => handleCreateShipping(record._id)} 
                type="primary"
                loading={createShippingMutation.isPending}
              />
            </Tooltip>
          )}
          
          {record.shipping?.orderCode && (
            <Tooltip title="Xem trạng thái mới nhất">
              <Button 
                icon={<ReloadOutlined />} 
                onClick={() => handleGetStatus(record._id)} 
                loading={getStatusMutation.isPending}
              />
            </Tooltip>
          )}
          
          {record.shipping?.orderCode && 
           record.shipping?.statusCode !== 'cancel' && 
           record.shipping?.statusCode !== 'delivered' && 
           record.status !== 'cancelled' && 
           record.status !== 'delivered' && (
            <Tooltip title="Cập nhật trạng thái">
              <Button 
                icon={<EditOutlined />} 
                onClick={() => showUpdateStatusModal(record)}
                type="default"
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <Title level={4}>Quản lý vận chuyển</Title>
            <div style={{ fontSize: '12px', color: '#888' }}>
              {lastRefreshTime ? `Cập nhật lần cuối: ${lastRefreshTime}` : ''}
              {autoRefresh && <span> (Tự động cập nhật)</span>}
            </div>
          </div>
          <div>
            <Button 
              style={{ marginRight: 8 }}
              type={autoRefresh ? "primary" : "default"}
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              {autoRefresh ? 'Tắt tự động cập nhật' : 'Bật tự động cập nhật'}
            </Button>
            <Button 
              type="primary" 
              icon={<ReloadOutlined />} 
              onClick={() => {
                updateAllOrdersStatus();
                refreshData();
              }}
            >
              Cập nhật trạng thái
            </Button>
          </div>
        </div>
        
        {error ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p>Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.</p>
            <Button onClick={() => refetch()} icon={<ReloadOutlined />}>Thử lại</Button>
          </div>
        ) : (
          <Table 
            columns={columns} 
            dataSource={orders || []} 
            rowKey="_id" 
            loading={isLoading}
            pagination={{ pageSize: 10 }}
          />
        )}
      </Card>

      {/* Order Detail Modal */}
      <Modal
        title="Chi tiết vận đơn"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={700}
      >
        {selectedOrder && (
          <div>
            <Descriptions title="Thông tin đơn hàng" bordered column={2}>
              <Descriptions.Item label="Mã đơn hàng">{selectedOrder._id}</Descriptions.Item>
              <Descriptions.Item label="Mã vận đơn GHN">{selectedOrder.shipping?.orderCode || 'Chưa có'}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái vận chuyển">
                {selectedOrder.shipping?.statusCode === 'cancel' || selectedOrder.status === 'cancelled' ? (
                  <Tag color="red">Đã hủy</Tag>
                ) : (
                  <Tag color={statusColors[selectedOrder.shipping?.statusCode] || 'default'}>
                    {selectedOrder.shipping?.statusName || statusNames[selectedOrder.shipping?.statusCode] || 'Không xác định'}
                  </Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian dự kiến">
                {selectedOrder.shipping?.expectedDeliveryTime || 'Chưa xác định'}
              </Descriptions.Item>
              <Descriptions.Item label="Tổng tiền đơn hàng">
                {selectedOrder.totalPrice?.toLocaleString('vi-VN')}đ
              </Descriptions.Item>
            </Descriptions>

            <Descriptions title="Thông tin người nhận" bordered column={1} style={{ marginTop: 16 }}>
              <Descriptions.Item label="Tên người nhận">
                {selectedOrder.userId?.fullName || selectedOrder.userId?.name || 'Không có tên'}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                {selectedOrder.userId?.phone || 'Không có số điện thoại'}
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ">
                {selectedOrder.addressFree?.address || selectedOrder.addressId?.address || 'Không có địa chỉ'}
                {', '}
                {selectedOrder.addressFree?.ward || selectedOrder.addressId?.ward || ''}
                {', '}
                {selectedOrder.addressFree?.district || selectedOrder.addressId?.district || ''}
                {', '}
                {selectedOrder.addressFree?.province || selectedOrder.addressId?.province || ''}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
      
      {/* Update Status Modal */}
      <Modal
        title="Cập nhật trạng thái vận chuyển"
        open={updateStatusModalVisible}
        onCancel={() => setUpdateStatusModalVisible(false)}
        onOk={() => {
          if (selectedOrder?._id && selectedStatus) {
            updateStatusMutation.mutate({
              orderId: selectedOrder._id,
              status: selectedStatus
            }, {
              onSuccess: () => {
                // Làm mới dữ liệu ngay lập tức
                refreshData();
              }
            });
          } else {
            message.warning('Vui lòng chọn trạng thái mới');
          }
        }}
        okText="Cập nhật"
        cancelText="Hủy"
        confirmLoading={updateStatusMutation.isPending}
      >
        <p>Cập nhật trạng thái vận chuyển cho đơn hàng:</p>
        <p>Mã đơn hàng: {selectedOrder?._id}</p>
        <p>Mã vận đơn GHN: {selectedOrder?.shipping?.orderCode}</p>
        
        <div style={{ marginTop: 16 }}>
          <Text strong>Trạng thái hiện tại:</Text>
          <Tag color={statusColors[selectedOrder?.shipping?.statusCode] || 'default'} style={{ marginLeft: 8 }}>
            {selectedOrder?.shipping?.statusName || statusNames[selectedOrder?.shipping?.statusCode] || 'Không xác định'}
          </Tag>
        </div>
        
        <div style={{ marginTop: 16 }}>
          <Text strong>Trạng thái mới:</Text>
          <Select
            style={{ width: '100%', marginTop: 8 }}
            value={selectedStatus}
            onChange={(value) => setSelectedStatus(value)}
            placeholder="Chọn trạng thái mới"
          >
            {/* Hiển thị các trạng thái theo thứ tự và vô hiệu hóa các trạng thái không hợp lệ */}
            <Select.Option value="ready_to_pick" disabled={selectedOrder?.shipping?.statusCode !== undefined && selectedOrder?.shipping?.statusCode !== 'ready_to_pick'}>Chờ lấy hàng</Select.Option>
            <Select.Option value="picking" disabled={selectedOrder?.shipping?.statusCode !== 'ready_to_pick' && selectedOrder?.shipping?.statusCode !== 'picking'}>Đang lấy hàng</Select.Option>
            <Select.Option value="picked" disabled={selectedOrder?.shipping?.statusCode !== 'picking' && selectedOrder?.shipping?.statusCode !== 'picked'}>Đã lấy hàng</Select.Option>
            <Select.Option value="delivering" disabled={selectedOrder?.shipping?.statusCode !== 'picked' && selectedOrder?.shipping?.statusCode !== 'delivering' && selectedOrder?.shipping?.statusCode !== 'delivery_fail'}>Đang giao hàng</Select.Option>
            <Select.Option value="delivered" disabled={selectedOrder?.shipping?.statusCode !== 'delivering' && selectedOrder?.shipping?.statusCode !== 'delivered'}>Đã giao hàng</Select.Option>
            <Select.Option value="delivery_fail" disabled={selectedOrder?.shipping?.statusCode !== 'delivering' && selectedOrder?.shipping?.statusCode !== 'delivery_fail'}>Giao hàng thất bại</Select.Option>
            <Select.Option value="waiting_to_return" disabled={selectedOrder?.shipping?.statusCode !== 'delivery_fail' && selectedOrder?.shipping?.statusCode !== 'waiting_to_return'}>Chờ trả hàng</Select.Option>
            <Select.Option value="return" disabled={selectedOrder?.shipping?.statusCode !== 'waiting_to_return' && selectedOrder?.shipping?.statusCode !== 'return'}>Đang trả hàng</Select.Option>
            <Select.Option value="returned" disabled={selectedOrder?.shipping?.statusCode !== 'return' && selectedOrder?.shipping?.statusCode !== 'returned'}>Đã trả hàng</Select.Option>
            <Select.Option value="cancel" disabled={['delivered', 'returned', 'cancel'].includes(selectedOrder?.shipping?.statusCode || '')}>Hủy đơn hàng</Select.Option>
          </Select>
        </div>
      </Modal>
    </div>
  );
};

export default ShippingManagement;
