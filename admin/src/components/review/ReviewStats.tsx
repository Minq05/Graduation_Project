import { useQuery } from '@tanstack/react-query';
import { fetchReviewStats } from '@/services/review-service/review.apis';
import { REVIEW_QUERY_KEYS } from '@/services/review-service/review.keys';
import { Card, Statistic, Row, Col, Progress, Empty } from 'antd';
import { StarOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useAppSelector } from '@/redux/hooks';

const ReviewStats = () => {
  const themeMode = useAppSelector(state => state.app.themeMode);
  const isDark = themeMode === 'dark';

  const { data: statsData, isLoading } = useQuery({
    queryKey: [REVIEW_QUERY_KEYS.STATS],
    queryFn: fetchReviewStats,
  });

  if (isLoading) {
    return <div>Đang tải thống kê...</div>;
  }

  if (!statsData?.data) {
    return <Empty description="Không có dữ liệu thống kê" />;
  }

  const stats = statsData.data;
  const approvalRate = stats.total > 0 ? ((stats.approved / stats.total) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      {/* Tổng quan */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className={isDark ? 'bg-gray-800 border-gray-700' : ''}>
            <Statistic
              title="Tổng đánh giá"
              value={stats.total}
              prefix={<StarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className={isDark ? 'bg-gray-800 border-gray-700' : ''}>
            <Statistic
              title="Đã duyệt"
              value={stats.approved}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className={isDark ? 'bg-gray-800 border-gray-700' : ''}>
            <Statistic
              title="Chờ duyệt"
              value={stats.pending}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className={isDark ? 'bg-gray-800 border-gray-700' : ''}>
            <Statistic
              title="Từ chối"
              value={stats.rejected}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Tỷ lệ phê duyệt */}
      <Card 
        title="Tỷ lệ phê duyệt" 
        className={isDark ? 'bg-gray-800 border-gray-700' : ''}
      >
        <Progress
          percent={Number(approvalRate)}
          status="active"
          strokeColor={{
            '0%': '#108ee9',
            '100%': '#87d068',
          }}
        />
        <p className="mt-2 text-gray-600">
          {stats.approved} trên {stats.total} đánh giá đã được phê duyệt
        </p>
      </Card>

      {/* Phân bố theo rating */}
      {stats.ratingDistribution && stats.ratingDistribution.length > 0 && (
        <Card 
          title="Phân bố theo số sao" 
          className={isDark ? 'bg-gray-800 border-gray-700' : ''}
        >
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map(rating => {
              const ratingData = stats.ratingDistribution.find((r: any) => r._id === rating);
              const count = ratingData ? ratingData.count : 0;
              const percentage = stats.approved > 0 ? (count / stats.approved) * 100 : 0;
              
              return (
                <div key={rating} className="flex items-center space-x-3">
                  <span className="w-12">{rating} sao</span>
                  <Progress 
                    percent={percentage} 
                    size="small" 
                    className="flex-1"
                    format={() => `${count}`}
                  />
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};

export default ReviewStats;