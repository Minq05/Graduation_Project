import axios from 'axios'
import instance from '@/config/axios.customize'

// GHN API Types
export interface Province {
  ProvinceID: number
  ProvinceName: string
  CountryID: number
  Code: string
}

export interface District {
  DistrictID: number
  ProvinceID: number
  DistrictName: string
  Code: string
}

export interface Ward {
  WardCode: string
  DistrictID: number
  WardName: string
}

export interface ShippingFeeRequest {
  to_district_id: number
  to_ward_code: string
  weight?: number
  length?: number
  width?: number
  height?: number
  insurance_value?: number
  service_id?: number
}

export interface ShippingFeeResponse {
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
  service_id?: number
  estimated_delivery_time?: string
}

export interface ShippingService {
  service_id: number
  short_name: string
  service_type_id: number
}

// GHN API Service
const GHNService = {
  // Lấy danh sách tỉnh/thành phố
  getProvinces: async (): Promise<Province[]> => {
    const response = await instance.get('/api/v1/ghn/provinces')
    return response.data.data
  },

  // Lấy danh sách quận/huyện theo tỉnh/thành phố
  getDistricts: async (provinceId: number): Promise<District[]> => {
    const response = await instance.get(`/api/v1/ghn/districts/${provinceId}`)
    return response.data.data
  },

  // Lấy danh sách phường/xã theo quận/huyện
  getWards: async (districtId: number): Promise<Ward[]> => {
    const response = await instance.get(`/api/v1/ghn/wards/${districtId}`)
    return response.data.data
  },

  // Lấy danh sách dịch vụ vận chuyển có sẵn
  getAvailableServices: async (toDistrictId: number): Promise<ShippingService[]> => {
    const response = await instance.get('/api/v1/ghn/available-services', {
      params: { toDistrictId }
    })
    return response.data.data
  },

  // Tính phí vận chuyển
  calculateShippingFee: async (data: ShippingFeeRequest): Promise<ShippingFeeResponse> => {
    const response = await instance.post('/api/v1/ghn/shipping-fee', data)
    return response.data.data
  }
}

export default GHNService
