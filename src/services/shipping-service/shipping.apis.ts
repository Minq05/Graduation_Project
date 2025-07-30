import instance from '@/config/axios.customize'

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
  products?: Array<{id: string, quantity: number}>
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

// Get all provinces
export const getProvinces = async (): Promise<Province[]> => {
  const response = await instance.get('/api/v1/ghn/provinces')
  return response.data.data
}

// Get districts by province ID
export const getDistricts = async (provinceId: number): Promise<District[]> => {
  const response = await instance.get(`/api/v1/ghn/districts/${provinceId}`)
  return response.data.data
}

// Get wards by district ID
export const getWards = async (districtId: number): Promise<Ward[]> => {
  const response = await instance.get(`/api/v1/ghn/wards/${districtId}`)
  return response.data.data
}

// Get available shipping services
export const getAvailableServices = async (toDistrictId: number, fromDistrictId?: number): Promise<ShippingService[]> => {
  const params = { toDistrictId, ...(fromDistrictId && { fromDistrictId }) }
  const response = await instance.get('/api/v1/ghn/available-services', { params })
  return response.data.data
}

// Calculate shipping fee
export const calculateShippingFee = async (data: ShippingFeeRequest): Promise<ShippingFeeResponse> => {
  const response = await instance.post('/api/v1/ghn/shipping-fee', data)
  return response.data.data
}

// Get shipping order status
export const getShippingStatus = async (orderId: string): Promise<any> => {
  const response = await instance.get(`/api/v1/ghn/order-status/${orderId}`)
  return response.data.data
}

// Refresh shipping status
export const refreshShippingStatus = async (orderId: string): Promise<any> => {
  const response = await instance.get(`/api/v1/ghn/order-status/${orderId}`)
  return response.data.data
}