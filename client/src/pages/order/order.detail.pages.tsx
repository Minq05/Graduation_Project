import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Package,
  Truck,
  MapPin,
  Calendar,
  CreditCard,
  Hash,
  Tag,
  Clock
} from 'lucide-react'
import ShippingTracker from '@/components/shipping/shipping-tracker'
import { useQuery } from '@tanstack/react-query'
import instance from '@/config/axios.customize'
import type { IOrder, IOrderItem } from '@/types/order'
import { getPaymentMethodLabel, getPaymentStatusColor, getShippingMethodLabel, getStatusColor, ORDER_STATUS } from './order.constant.pages'
import { useNavigate, useParams, useSearchParams } from 'react-router'

const OrderDetails = () => {
  const params = useParams()
  const orderId = params?.orderId as string
  const nav = useNavigate()
  const [searchParams] = useSearchParams()
  const tab = searchParams.get('tab') || 'pending'

  const { data: order, isLoading } = useQuery<IOrder>({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const res = await instance.get(`/api/v1/orders/${orderId}`)
      return res.data
    },
    enabled: !!orderId
  })

  const { data: orderItems = [] } = useQuery<IOrderItem[]>({
    queryKey: ['order-items', orderId],
    queryFn: async () => {
      const res = await instance.get(`/api/v1/orders/${orderId}/items`)
      return res.data
    },
    enabled: !!orderId
  })

  const formatCurrency = (value?: number) =>
    value
      ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
      : '0₫'

  const formatFullAddress = (address?: IOrder['addressId']) => {
    if (!address) return 'Không có địa chỉ'
    return [address.hamlet, address.ward, address.district, address.province]
      .filter(Boolean)
      .join(', ')
  }
  if (isLoading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'>
        <div className='max-w-6xl mx-auto p-6'>
          <div className='animate-pulse'>
            <div className='h-8 bg-gray-200 rounded-lg w-64 mb-8'></div>
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
              <div className='lg:col-span-2 space-y-6'>
                <div className='h-96 bg-gray-200 rounded-xl'></div>
                <div className='h-64 bg-gray-200 rounded-xl'></div>
              </div>
              <div className='h-80 bg-gray-200 rounded-xl'></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center'>
        <Card className='p-8 text-center'>
          <CardContent>
            <Package className='h-16 w-16 text-gray-400 mx-auto mb-4' />
            <h2 className='text-xl font-semibold text-gray-900 mb-2'>Không tìm thấy đơn hàng</h2>
            <p className='text-gray-600'>Đơn hàng này không tồn tại hoặc đã bị xóa.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'>
      <div className='max-w-6xl mx-auto p-6'>
        {/* Header */}
        <div className='flex items-center gap-4 mb-8'>
          <Button
            variant='ghost'
            size='sm'
            className='p-2 h-auto hover:bg-white/50 rounded-full transition-all duration-200'
            onClick={() => nav(`/account/683f11fbc1c5cb3b5e991c17/order?tab=${tab}`)} // thay userId nếu cần
          >
            <ArrowLeft className='h-5 w-5 text-gray-700' />
          </Button>

          <div>
            <h1 className='text-2xl font-bold text-gray-900'>Chi tiết đơn hàng</h1>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Main Content */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Order Status & Info */}
            <Card className='bg-white/70 backdrop-blur-sm border-0 shadow-lg'>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between mb-6'>
                  <h2 className='text-lg font-semibold text-gray-900 flex items-center gap-2'>
                    <Package className='h-5 w-5 text-purple-600' />
                    Thông tin đơn hàng
                  </h2>
                  <Badge className={`${getStatusColor(order.status)} border`}>
                    {ORDER_STATUS.find((s) => s.key === order.status)?.label}
                  </Badge>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div className='space-y-4'>
                    <div className='flex items-center gap-3'>
                      <Hash className='h-4 w-4 text-gray-500' />
                      <div>
                        <p className='text-sm text-gray-600'>Mã đơn hàng</p>
                        <p className='font-medium text-gray-900'>{order._id}</p>
                      </div>
                    </div>

                    <div className='flex items-center gap-3'>
                      <Calendar className='h-4 w-4 text-gray-500' />
                      <div>
                        <p className='text-sm text-gray-600'>Ngày đặt hàng</p>
                        <p className='font-medium text-gray-900'>
                          {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>

                    <div className='flex items-center gap-3'>
                      <Tag className='h-4 w-4 text-gray-500' />
                      <div>
                        <p className='text-sm text-gray-600'>Mã giảm giá</p>
                        <p className='font-medium text-gray-900'>{order.discountId || 'Không áp dụng'}</p>
                      </div>
                    </div>
                  </div>

                  <div className='space-y-4'>
                    <div className='flex items-center gap-3'>
                      <CreditCard className='h-4 w-4 text-gray-500' />
                      <div>
                        <p className='text-sm text-gray-600'>Hình thức thanh toán</p>
                        <Badge className={`${getPaymentStatusColor(order.paymentMethod)} border mt-1`}>
                          {getPaymentMethodLabel(order.paymentMethod)}
                        </Badge>
                      </div>
                    </div>

                    <div className='flex items-center gap-3'>
                      <Clock className='h-4 w-4 text-gray-500' />
                      <div>
                        <p className='text-sm text-gray-600'>Cập nhật lần cuối</p>
                        <p className='font-medium text-gray-900'>
                          {new Date(order.updatedAt).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>

                    <div className='flex items-center gap-3'>
                      <Truck className='h-4 w-4 text-gray-500' />
                      <div>
                        <p className='text-sm text-gray-600'>Phương thức vận chuyển</p>
                        <p className='font-medium text-gray-900'>{getShippingMethodLabel(order.shippingMethod)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card className='bg-white/70 backdrop-blur-sm border-0 shadow-lg'>
              <CardContent className='p-6'>
                <h2 className='text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4'>
                  <MapPin className='h-5 w-5 text-green-600' />
                  Địa chỉ giao hàng
                </h2>
                <div className='bg-gray-50 rounded-lg p-4'>
                  <p className='font-medium text-gray-900 mb-1'>{order.userId?.fullName}</p>
                  <p className='text-sm text-gray-600 mb-2'>Số điện thoại: {order.userId?.phone}</p>
                  <p className='text-sm text-gray-700'>{formatFullAddress(order.addressId)}</p>
                </div>
              </CardContent>
            </Card>
            
            {/* Shipping Tracker */}
            {order.shipping?.orderCode && (
              <Card className='bg-white/70 backdrop-blur-sm border-0 shadow-lg'>
                <CardContent className='p-6'>
                  <h2 className='text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4'>
                    <Truck className='h-5 w-5 text-blue-600' />
                    Theo dõi vận chuyển
                  </h2>
                  <ShippingTracker orderId={order._id} />
                </CardContent>
              </Card>
            )}

            {/* Order Items */}
            <Card className='bg-white/70 backdrop-blur-sm border-0 shadow-lg'>
              <CardContent className='p-6'>
                <h2 className='text-lg font-semibold text-gray-900 mb-4'>
                  Sản phẩm đã đặt ({orderItems.length} sản phẩm)
                </h2>
                <div className='space-y-4'>
                  {orderItems.map((item) => (
                    <div key={item._id} className='flex items-center gap-4 p-4 bg-gray-50 rounded-lg'>
                      <div className='w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0 shadow-sm'>
                        <img
                          src={item.productId?.image?.[0] || '/placeholder.svg?height=64&width=64'}
                          alt={item.productId?.name || 'Sản phẩm'}
                          className='w-full h-full object-cover'
                          crossOrigin='anonymous'

                        />
                      </div>
                      <div className='flex-1'>
                        <h3 className='font-medium text-gray-900 mb-1'>
                          {item.productId?.name || 'Không có tên'}
                        </h3>
                        <div className='flex items-center justify-between'>
                          <span className='text-sm text-gray-600'>
                            Số lượng: <span className='font-medium'>{item.quantity}</span>
                          </span>
                          <span className='font-semibold text-gray-900'>
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Summary */}
          <div className='lg:col-span-1'>
            <Card className='bg-gradient-to-br from-purple-600 to-purple-900 text-white border-0 shadow-xl sticky top-6'>
              <CardContent className='p-6'>
                <h2 className='text-lg font-semibold mb-6 flex items-center gap-2'>
                  <CreditCard className='h-5 w-5' />
                  Tóm tắt đơn hàng
                </h2>

                <div className='space-y-4'>
                  <div className='flex justify-between items-center'>
                    <span className='text-blue-100'>Tạm tính:</span>
                    <span className='font-medium'>
                      {formatCurrency((order.totalPrice || 0) - (order.shippingPrice || 0))}
                    </span>
                  </div>

                  <div className='flex justify-between items-center'>
                    <span className='text-blue-100'>Phí vận chuyển:</span>
                    <span className='font-medium'>{formatCurrency(order.shippingPrice)}</span>
                  </div>

                  {order.discountId && (
                    <div className='flex justify-between items-center'>
                      <span className='text-blue-100'>Giảm giá:</span>
                      <span className='font-medium text-green-300'>-{formatCurrency(0)}</span>
                    </div>
                  )}

                  <hr className='border-400/30' />

                  <div className='flex justify-between items-center text-lg font-bold'>
                    <span>Tổng cộng:</span>
                    <span>{formatCurrency(order.totalPrice)}</span>
                  </div>
                </div>

                <div className='mt-6 pt-6 border-t border-400/30'>
                  <div className='text-center space-y-3'>
                    {order.status === 'completed' && (
                      <Button
                        onClick={() => nav(`/review/order/${order._id}`)}
                        variant='secondary'
                        size='sm'
                        className='bg-blue-600 hover:bg-blue-700 text-white w-full mb-2'
                      >
                        Đánh giá sản phẩm
                      </Button>
                    )}
                    <p className='text-blue-100 text-sm mb-2'>Cần hỗ trợ?</p>
                    <Button
                      onClick={() => nav('/contact')}
                      variant='secondary'
                      size='sm'
                      className='bg-white/20 hover:bg-white/30 text-white border-white/30'
                    >
                      Liên hệ hỗ trợ
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetails
