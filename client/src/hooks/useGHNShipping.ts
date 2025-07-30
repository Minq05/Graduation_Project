import { useState, useEffect } from 'react'
import GHNService, { ShippingFeeResponse, ShippingService } from '@/services/shipping-service/ghn.service'
import { GHNAddressData } from '@/components/shipping/GHNAddressSelector'
import { getShippingRateByProvince, getEstimatedDeliveryTime, SHOP_PROVINCE } from '@/services/shipping-service/shipping-rates'

interface UseGHNShippingProps {
  addressData: GHNAddressData | null
  cartItems: Array<{id: string, quantity: number, weight?: number}>
}

export const useGHNShipping = ({ addressData, cartItems }: UseGHNShippingProps) => {
  const [shippingMethod, setShippingMethod] = useState('standard')
  const [serviceId, setServiceId] = useState<number | undefined>(undefined)
  const [shippingFee, setShippingFee] = useState<number>(30000)
  const [availableServices, setAvailableServices] = useState<ShippingService[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [shippingDetails, setShippingDetails] = useState<ShippingFeeResponse | null>(null)

  // Lấy danh sách dịch vụ vận chuyển khi có địa chỉ
  useEffect(() => {
    if (!addressData?.districtId) return

    const fetchServices = async () => {
      setLoading(true)
      try {
        const services = await GHNService.getAvailableServices(addressData.districtId)
        setAvailableServices(services)

        // Tự động chọn service_id phù hợp với phương thức vận chuyển
        const standardService = services.find(s => s.service_type_id === 2)
        const expressService = services.find(s => s.service_type_id === 1)

        if (shippingMethod === 'standard' && standardService) {
          setServiceId(standardService.service_id)
        } else if (shippingMethod === 'express-ghn' && expressService) {
          setServiceId(expressService.service_id)
        } else if (standardService) {
          setServiceId(standardService.service_id)
        } else if (services.length > 0) {
          setServiceId(services[0].service_id)
        }

        setError(null)
      } catch (err) {
        console.error('Lỗi khi lấy dịch vụ vận chuyển:', err)
        setError('Không thể lấy danh sách dịch vụ vận chuyển')
        setAvailableServices([])
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [addressData?.districtId, shippingMethod])

  // Tính phí vận chuyển khi có địa chỉ
  useEffect(() => {
    if (!addressData?.provinceName) {
      // Nếu không có tỉnh thành, sử dụng giá mặc định
      setShippingFee(getDefaultShippingFee())
      return
    }

    const calculateFee = () => {
      setLoading(true)
      try {
        // Tính phí vận chuyển dựa trên tỉnh thành
        const fee = getShippingRateByProvince(addressData.provinceName, shippingMethod)
        setShippingFee(fee)

        // Tạo thông tin chi tiết về phí vận chuyển
        setShippingDetails({
          total: fee,
          service_fee: fee,
          insurance_fee: 0,
          pick_station_fee: 0,
          coupon_value: 0,
          r2s_fee: 0,
          document_return: 0,
          double_check: 0,
          pick_remote_areas_fee: 0,
          deliver_remote_areas_fee: 0,
          cod_fee: 0,
          estimated_delivery_time: getEstimatedDeliveryTime(addressData.provinceName, shippingMethod)
        })

        setError(null)
      } catch (err) {
        console.error('Lỗi khi tính phí vận chuyển:', err)
        setError('Không thể tính phí vận chuyển')
        setShippingFee(getDefaultShippingFee())
        setShippingDetails(null)
      } finally {
        setLoading(false)
      }
    }

    // Giả lập loading trong 300ms để tạo trải nghiệm người dùng tốt hơn
    const timer = setTimeout(calculateFee, 300)
    return () => clearTimeout(timer)
  }, [addressData?.provinceName, shippingMethod])

  // Cập nhật service_id khi thay đổi phương thức vận chuyển
  useEffect(() => {
    if (!availableServices.length) return

    if (shippingMethod === 'standard') {
      const standardService = availableServices.find(s => s.service_type_id === 2)
      if (standardService) setServiceId(standardService.service_id)
    } else if (shippingMethod === 'express-ghn') {
      const expressService = availableServices.find(s => s.service_type_id === 1)
      if (expressService) setServiceId(expressService.service_id)
    }
  }, [shippingMethod, availableServices])

  // Lấy phí vận chuyển mặc định
  const getDefaultShippingFee = () => {
    switch (shippingMethod) {
    case 'standard': return 30000
    case 'express-ghn': return 45000
    case 'express': return 60000
    default: return 30000
    }
  }

  // Lấy thời gian giao hàng dự kiến
  const getDeliveryTime = () => {
    if (shippingDetails?.estimated_delivery_time) {
      return shippingDetails.estimated_delivery_time
    }

    if (!addressData?.provinceName) {
      return shippingMethod === 'standard' ? '2-3 ngày' : 
        shippingMethod === 'express-ghn' ? '1-2 ngày' : '24 giờ'
    }

    return getEstimatedDeliveryTime(addressData.provinceName, shippingMethod)
  }

  return {
    shippingMethod,
    setShippingMethod,
    shippingFee,
    loading,
    error,
    availableServices,
    estimatedDeliveryTime: getDeliveryTime(),
    shippingDetails,
    shopProvince: SHOP_PROVINCE
  }
}
