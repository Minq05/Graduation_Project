import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAllReviews, approveReview, rejectReview, deleteReview, fetchReviewDetail } from '@/services/review-service/review.apis';
import { testReviewConnection } from '@/services/review-service/review.test';
import { REVIEW_QUERY_KEYS } from '@/services/review-service/review.keys';
import { Review } from '@/services/review-service/review.types';
import { Table, Button, Space, Modal, Input, Tag, Rate, Image, Tooltip, Select, DatePicker, Descriptions } from 'antd';
import { ExclamationCircleOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { theme } from 'antd';
import { useAppSelector } from '@/redux/hooks';

const { confirm } = Modal;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const ReviewsPage = () => {
  const { token } = theme.useToken();
  const themeMode = useAppSelector(state => state.app.themeMode);
  const isDark = themeMode === 'dark';

  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [currentReviewId, setCurrentReviewId] = useState<string | null>(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const queryClient = useQueryClient();

  // Xây dựng query params
  const buildQueryParams = () => {
    const params = new URLSearchParams();
    params.append('page', pagination.current.toString());
    params.append('limit', pagination.pageSize.toString());
    
    if (searchText) {
      params.append('search', searchText);
    }
    
    if (statusFilter) {
      params.append('status', statusFilter);
    }
    
    if (dateRange && dateRange[0] && dateRange[1]) {
      params.append('startDate', dateRange[0].startOf('day').toISOString());
      params.append('endDate', dateRange[1].endOf('day').toISOString());
    }
    
    return params.toString();
  };

  // Fetch reviews
  const { data: reviewsData, isLoading } = useQuery({
    queryKey: [REVIEW_QUERY_KEYS.FETCH_ALL, pagination.current, pagination.pageSize, searchText, statusFilter, dateRange],
    queryFn: () => fetchAllReviews(buildQueryParams()),
  });

  // Approve review mutation
  const approveMutation = useMutation({
    mutationFn: approveReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [REVIEW_QUERY_KEYS.FETCH_ALL] });
    },
  });

  // Reject review mutation
  const rejectMutation = useMutation({
    mutationFn: ({ reviewId, reason }: { reviewId: string; reason: string }) => 
      rejectReview(reviewId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [REVIEW_QUERY_KEYS.FETCH_ALL] });
      setRejectModalVisible(false);
      setRejectReason('');
    },
  });

  // Delete review mutation
  const deleteMutation = useMutation({
    mutationFn: ({ reviewId, reason }: { reviewId: string; reason: string }) => 
      deleteReview(reviewId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [REVIEW_QUERY_KEYS.FETCH_ALL] });
      setDeleteModalVisible(false);
      setDeleteReason('');
    },
  });

  // Fetch review detail mutation
  const reviewDetailMutation = useMutation({
    mutationFn: fetchReviewDetail,
    onSuccess: (data) => {
      setSelectedReview(data.data);
      setDetailModalVisible(true);
    },
  });

  // Handle approve review
  const handleApprove = (reviewId: string) => {
    confirm({
      title: 'Bạn có chắc chắn muốn phê duyệt đánh giá này?',
      icon: <ExclamationCircleOutlined />,
      content: 'Đánh giá sẽ được hiển thị công khai sau khi phê duyệt.',
      okText: 'Phê duyệt',
      cancelText: 'Hủy',
      onOk: () => {
        approveMutation.mutate(reviewId);
      },
    });
  };

  // Handle reject review
  const handleReject = (reviewId: string) => {
    setCurrentReviewId(reviewId);
    setRejectModalVisible(true);
  };

  // Handle delete review
  const handleDelete = (reviewId: string) => {
    setCurrentReviewId(reviewId);
    setDeleteModalVisible(true);
  };

  // Handle view review detail
  const handleViewDetail = (reviewId: string) => {
    reviewDetailMutation.mutate(reviewId);
  };

  // Submit reject reason
  const submitRejectReason = () => {
    if (currentReviewId && rejectReason.trim()) {
      rejectMutation.mutate({ reviewId: currentReviewId, reason: rejectReason });
    }
  };

  // Submit delete reason
  const submitDeleteReason = () => {
    if (currentReviewId && deleteReason.trim()) {
      deleteMutation.mutate({ reviewId: currentReviewId, reason: deleteReason });
    }
  };

  // Test API connection
  const handleTestConnection = async () => {
    const result = await testReviewConnection();
    console.log('Test result:', result);
  };

  // Table columns
  const columns: ColumnsType<Review> = [
    {
      title: 'Sản phẩm',
      dataIndex: 'productId',
      key: 'product',
      render: (productId: any) => {
        const product = typeof productId === 'object' ? productId : { name: 'Không xác định' };
        return (
          <div className="flex items-center">
            {product.images && product.images.length > 0 && (
              <Image 
                src={product.images[0]} 
                alt={product.name} 
                width={40} 
                height={40} 
                className="object-cover rounded mr-2"
                preview={false}
              />
            )}
            <span>{product.name}</span>
          </div>
        );
      },
    },
    {
      title: 'Người dùng',
      dataIndex: 'userId',
      key: 'user',
      render: (userId: any) => {
        const user = typeof userId === 'object' ? userId : { fullName: 'Không xác định', email: '' };
        return (
          <div>
            <div>{user.fullName || 'Không xác định'}</div>
            <div className="text-xs text-gray-500">{user.email}</div>
          </div>
        );
      },
    },
    {
      title: 'Đánh giá',
      key: 'rating',
      dataIndex: 'rating',
      render: (rating: number) => <Rate disabled defaultValue={rating} />,
    },
    {
      title: 'Nội dung',
      dataIndex: 'comment',
      key: 'comment',
      render: (comment: string) => (
        <Tooltip title={comment}>
          <div className="max-w-xs truncate">{comment}</div>
        </Tooltip>
      ),
    },
    {
      title: 'Hình ảnh',
      dataIndex: 'images',
      key: 'images',
      render: (images: string[]) => (
        <div className="flex space-x-1">
          {images && images.length > 0 ? (
            images.slice(0, 3).map((image, index) => (
              <Image 
                key={index} 
                src={image} 
                alt={`review-image-${index}`} 
                width={30} 
                height={30} 
                className="object-cover rounded"
              />
            ))
          ) : (
            <span>Không có</span>
          )}
          {images && images.length > 3 && (
            <div className="bg-gray-200 w-8 h-8 rounded flex items-center justify-center text-xs">
              +{images.length - 3}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'default';
        let text = 'Không xác định';
        
        switch (status) {
          case 'pending':
            color = 'gold';
            text = 'Chờ duyệt';
            break;
          case 'approved':
            color = 'green';
            text = 'Đã duyệt';
            break;
          case 'rejected':
            color = 'red';
            text = 'Từ chối';
            break;
        }
        
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="default" 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record._id)}
          >
            Chi tiết
          </Button>
          {record.status === 'pending' && (
            <>
              <Button 
                type="primary" 
                size="small" 
                onClick={() => handleApprove(record._id)}
              >
                Duyệt
              </Button>
              <Button 
                danger
                size="small"
                onClick={() => handleReject(record._id)}
              >
                Từ chối
              </Button>
            </>
          )}
          <Button 
            danger 
            size="small" 
            onClick={() => handleDelete(record._id)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý đánh giá</h1>
        <Button onClick={handleTestConnection} type="dashed">
          Test API Connection
        </Button>
      </div>
      
      {/* Filters */}
      <div className="mb-4 flex gap-4">
        <Input.Search
          placeholder="Tìm kiếm theo tên sản phẩm hoặc người dùng"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
        />
        <Select
          placeholder="Lọc theo trạng thái"
          value={statusFilter}
          onChange={setStatusFilter}
          allowClear
          style={{ width: 150 }}
        >
          <Select.Option value="pending">Chờ duyệt</Select.Option>
          <Select.Option value="approved">Đã duyệt</Select.Option>
          <Select.Option value="rejected">Từ chối</Select.Option>
        </Select>
        <RangePicker
          value={dateRange}
          onChange={setDateRange}
          format="DD/MM/YYYY"
        />
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={reviewsData?.data?.results || []}
        loading={isLoading}
        rowKey="_id"
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: reviewsData?.data?.meta?.total || 0,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} đánh giá`,
          onChange: (page, pageSize) => {
            setPagination({ current: page, pageSize: pageSize || 10 });
          },
        }}
      />

      {/* Reject Modal */}
      <Modal
        title="Từ chối đánh giá"
        open={rejectModalVisible}
        onOk={submitRejectReason}
        onCancel={() => {
          setRejectModalVisible(false);
          setRejectReason('');
        }}
        confirmLoading={rejectMutation.isPending}
      >
        <TextArea
          rows={4}
          placeholder="Nhập lý do từ chối..."
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
        />
      </Modal>

      {/* Delete Modal */}
      <Modal
        title="Xóa đánh giá"
        open={deleteModalVisible}
        onOk={submitDeleteReason}
        onCancel={() => {
          setDeleteModalVisible(false);
          setDeleteReason('');
        }}
        confirmLoading={deleteMutation.isPending}
      >
        <TextArea
          rows={4}
          placeholder="Nhập lý do xóa..."
          value={deleteReason}
          onChange={(e) => setDeleteReason(e.target.value)}
        />
      </Modal>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết đánh giá"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedReview && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Sản phẩm">
              {selectedReview.productId?.name || 'Không xác định'}
            </Descriptions.Item>
            <Descriptions.Item label="Người dùng">
              {selectedReview.userId?.fullName || 'Không xác định'} ({selectedReview.userId?.email})
            </Descriptions.Item>
            <Descriptions.Item label="Đánh giá">
              <Rate disabled value={selectedReview.rating} />
            </Descriptions.Item>
            <Descriptions.Item label="Nội dung">
              {selectedReview.comment}
            </Descriptions.Item>
            <Descriptions.Item label="Hình ảnh">
              {selectedReview.images && selectedReview.images.length > 0 ? (
                <div className="flex gap-2">
                  {selectedReview.images.map((image, index) => (
                    <Image key={index} src={image} width={100} height={100} />
                  ))}
                </div>
              ) : (
                'Không có'
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={selectedReview.status === 'approved' ? 'green' : selectedReview.status === 'rejected' ? 'red' : 'gold'}>
                {selectedReview.status === 'approved' ? 'Đã duyệt' : selectedReview.status === 'rejected' ? 'Từ chối' : 'Chờ duyệt'}
              </Tag>
            </Descriptions.Item>
            {selectedReview.rejectReason && (
              <Descriptions.Item label="Lý do từ chối">
                {selectedReview.rejectReason}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Ngày tạo">
              {dayjs(selectedReview.createdAt).format('DD/MM/YYYY HH:mm')}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default ReviewsPage;