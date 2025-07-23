import axios from 'axios'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

// GHN API Configuration
const GHN_API_URL = 'https://dev-online-gateway.ghn.vn/shiip/public-api'
const GHN_TOKEN = '0ebc1f84-5ff5-11f0-9b81-222185cb68c8'
const GHN_SHOP_ID = '197102'

// Interface for GHN API responses
interface GHNResponse<T> {
  code: number
  message: string
  data: T
}

// Interface for province data
interface Province {
  ProvinceID: number
  ProvinceName: string
  CountryID: number
  Code: string
}

// Interface for district data
interface District {
  DistrictID: number
  ProvinceID: number
  DistrictName: string
  Code: string
}

// Interface for ward data
interface Ward {
  WardCode: string
  DistrictID: number
  WardName: string
}

// Interface for shipping fee calculation
interface ShippingFeeRequest {
  from_district_id: number
  to_district_id: number
  to_ward_code: string
  height: number
  length: number
  weight: number
  width: number
  insurance_value?: number
  service_id?: number
  coupon?: string
}

// Interface for shipping fee response
interface ShippingFeeResponse {
  total: number
  service_fee: number
  insurance_fee: number
  pick_station_fee: number
  coupon_value: number
  r2s_fee: number
  document_return: number
  double_check: number
  pick_remote_areas_fee: number
  deliver_remote_areas_fee: number
  cod_fee: number
}

// Interface for creating an order
interface CreateOrderRequest {
  payment_type_id: number
  note: string
  required_note: string
  client_order_code: string
  to_name: string
  to_phone: string
  to_address: string
  to_ward_code: string
  to_district_id: number
  cod_amount?: number
  content: string
  weight: number
  length: number
  width: number
  height: number
  service_id?: number
  service_type_id?: number
  pickup_time?: number
  items: Array<{
    name: string
    code: string
    quantity: number
    price: number
    weight: number
  }>
}

// Interface for order creation response
interface CreateOrderResponse {
  order_code: string
  expected_delivery_time: string
  fee: {
    main_service: number
    insurance: number
    station_do: number
    station_pu: number
    return: number
    r2s: number
    coupon: number
  }
}

// Interface for order status
interface OrderStatus {
  status: string
  status_name: string
}

/**
 * GHN Service for shipping integration
 */
class GHNService {
  private axiosInstance = axios.create({
    baseURL: GHN_API_URL,
    headers: {
      'Content-Type': 'application/json',
      'Token': GHN_TOKEN,
      'ShopId': GHN_SHOP_ID
    }
  })

  /**
   * Get all provinces from GHN
   */
  async getProvinces(): Promise<Province[]> {
    try {
      const response = await this.axiosInstance.get<GHNResponse<Province[]>>('/master-data/province')
      return response.data.data
    } catch (error: any) {
      console.error('Error fetching provinces from GHN:', error.response?.data || error.message)
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Không thể lấy danh sách tỉnh/thành phố từ GHN'
      )
    }
  }

  /**
   * Get districts by province ID
   */
  async getDistricts(provinceId: number): Promise<District[]> {
    try {
      const response = await this.axiosInstance.post<GHNResponse<District[]>>('/master-data/district', {
        province_id: provinceId
      })
      return response.data.data
    } catch (error: any) {
      console.error('Error fetching districts from GHN:', error.response?.data || error.message)
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Không thể lấy danh sách quận/huyện từ GHN'
      )
    }
  }

  /**
   * Get wards by district ID
   */
  async getWards(districtId: number): Promise<Ward[]> {
    try {
      const response = await this.axiosInstance.post<GHNResponse<Ward[]>>('/master-data/ward', {
        district_id: districtId
      })
      return response.data.data
    } catch (error: any) {
      console.error('Error fetching wards from GHN:', error.response?.data || error.message)
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Không thể lấy danh sách phường/xã từ GHN'
      )
    }
  }

  /**
   * Calculate shipping fee
   */
  async calculateShippingFee(data: ShippingFeeRequest): Promise<ShippingFeeResponse> {
    try {
      const response = await this.axiosInstance.post<GHNResponse<ShippingFeeResponse>>(
        '/v2/shipping-order/fee',
        data
      )
      return response.data.data
    } catch (error: any) {
      console.error('Error calculating shipping fee from GHN:', error.response?.data || error.message)
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Không thể tính phí vận chuyển từ GHN'
      )
    }
  }

  /**
   * Create shipping order
   */
  async createOrder(data: CreateOrderRequest): Promise<CreateOrderResponse> {
    try {
      console.log('Creating GHN order with data:', JSON.stringify(data));
      
      // Validate phone number format
      let toPhone = data.to_phone;
      if (!toPhone || toPhone.length !== 10 || !toPhone.startsWith('0')) {
        toPhone = '0987654321';
      }
      
      // Add shop_id to the request data
      const requestData = {
        ...data,
        to_phone: toPhone, // Override with validated phone
        shop_id: Number(GHN_SHOP_ID),
        from_name: 'Shop Admin',
        from_phone: '0987654321',
        from_address: '123 Đường Test',
        from_ward_name: 'Phường Bến Nghé',
        from_district_name: 'Quận 1',
        from_province_name: 'TP Hồ Chí Minh',
        from_ward_code: '20308',
        from_district_id: 1442
      };
      
      const response = await this.axiosInstance.post<GHNResponse<CreateOrderResponse>>(
        '/v2/shipping-order/create',
        requestData
      );
      
      console.log('GHN response:', response.data);
      return response.data.data;
    } catch (error: any) {
      console.error('Error creating order with GHN:', error.response?.data || error.message);
      if (error.response?.data) {
        console.error('GHN error details:', JSON.stringify(error.response.data));
      }
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Không thể tạo đơn vận chuyển với GHN: ' + (error.response?.data?.message || error.message)
      );
    }
  }

  /**
   * Get order status
   */
  async getOrderStatus(orderCode: string): Promise<OrderStatus> {
    try {
      const response = await this.axiosInstance.post<GHNResponse<OrderStatus>>(
        '/v2/shipping-order/detail',
        { order_code: orderCode }
      )
      return response.data.data
    } catch (error: any) {
      console.error('Error getting order status from GHN:', error.response?.data || error.message)
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Không thể lấy trạng thái đơn hàng từ GHN'
      )
    }
  }

  /**
   * Cancel shipping order
   */
  async cancelOrder(orderCode: string): Promise<any> {
    try {
      const response = await this.axiosInstance.post<GHNResponse<any>>(
        '/v2/switch-status/cancel',
        { order_codes: [orderCode] }
      )
      return response.data.data
    } catch (error: any) {
      console.error('Error canceling order with GHN:', error.response?.data || error.message)
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Không thể hủy đơn vận chuyển với GHN'
      )
    }
  }
}

export const ghnService = new GHNService()