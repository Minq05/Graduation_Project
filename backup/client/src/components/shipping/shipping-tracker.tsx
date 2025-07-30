import React, { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { refreshShippingStatus } from '@/services/shipping-service/shipping.apis'

interface ShippingTrackerProps {
  orderId: string
}

// Mapping for shipping status in Vietnamese
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
  'exception': 'Ngoại lệ'
}

// Define the step mapping for GHN status codes
const statusStepMap: Record<string, number> = {
  'ready_to_pick': 0,
  'picking': 1,
  'picked': 2,
  'delivering': 3,
  'delivered': 4,
  'delivery_fail': 3,
  'waiting_to_return': 3,
  'return': 3,
  'returned': 3,
  'cancel': -1,
  'exception': -1
}

const ShippingTracker: React.FC<ShippingTrackerProps> = ({ orderId }) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [shippingData, setShippingData] = useState<any>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchShippingStatus = async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await refreshShippingStatus(orderId)
      setShippingData(data)
      setLoading(false)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể lấy thông tin vận chuyển')
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchShippingStatus()
    setRefreshing(false)
  }

  useEffect(() => {
    fetchShippingStatus()
  }, [orderId])

  if (loading) {
    return (
      <Card className="shipping-tracker">
        <CardContent className="p-6 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <div className="mt-4">Đang tải thông tin vận chuyển...</div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="shipping-tracker">
        <CardContent className="p-6 text-center">
          <h3 className="text-red-500 font-medium text-lg">{error}</h3>
          <p className="text-gray-600">Đơn hàng này có thể chưa được tạo vận đơn hoặc đã bị hủy.</p>
        </CardContent>
      </Card>
    )
  }

  if (!shippingData || !shippingData.order?.shipping) {
    return (
      <Card className="shipping-tracker">
        <CardContent className="p-6 text-center">
          <h3 className="font-medium text-lg">Chưa có thông tin vận chuyển</h3>
          <p className="text-gray-600">Đơn hàng này chưa được tạo vận đơn.</p>
        </CardContent>
      </Card>
    )
  }

  const { order } = shippingData
  const { shipping } = order
  const currentStep = statusStepMap[shipping.statusCode] || 0

  // Define steps for the shipping process
  const steps = [
    {
      title: 'Chờ lấy hàng',
      description: 'Đơn hàng đã được tiếp nhận'
    },
    {
      title: 'Đang lấy hàng',
      description: 'Shipper đang đến lấy hàng'
    },
    {
      title: 'Đã lấy hàng',
      description: 'Đơn hàng đã được lấy'
    },
    {
      title: 'Đang giao hàng',
      description: 'Đơn hàng đang được giao đến bạn'
    },
    {
      title: 'Đã giao hàng',
      description: 'Đơn hàng đã được giao thành công'
    }
  ]

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-medium mb-4">Theo dõi đơn hàng</h3>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <div>
              <span className="font-medium">Mã vận đơn:</span> {shipping.orderCode}
            </div>
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              {refreshing && <Loader2 className="h-4 w-4 animate-spin" />}
              Cập nhật
            </Button>
          </div>

          <div className="mb-2">
            <span className="font-medium">Trạng thái:</span>{' '}
            <span className={shipping.statusCode === 'cancel' ? 'text-red-500' : 'text-green-600'}>
              {shipping.statusName || statusNames[shipping.statusCode] || 'Không xác định'}
            </span>
          </div>

          {shipping.expectedDeliveryTime && (
            <div>
              <span className="font-medium">Thời gian dự kiến giao hàng:</span> {shipping.expectedDeliveryTime}
            </div>
          )}
        </div>

        {shipping.statusCode === 'cancel' ? (
          <div className="text-center p-4 bg-red-50 rounded-md">
            <h4 className="text-red-500 font-medium">Đơn hàng đã bị hủy</h4>
            {order.reason && <p className="text-gray-600">Lý do: {order.reason}</p>}
          </div>
        ) : (
          <div className="space-y-6">
            {steps.map((step, index) => (
              <div key={index} className={`flex gap-4 ${index > currentStep ? 'opacity-50' : ''}`}>
                <div className="relative">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${index <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                    {index < currentStep ? '✓' : index + 1}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`absolute top-8 left-4 w-0.5 h-16 ${index < currentStep ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                  )}
                </div>
                <div className="pb-8">
                  <h4 className="font-medium">{step.title}</h4>
                  <p className="text-gray-600 text-sm">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default ShippingTracker
