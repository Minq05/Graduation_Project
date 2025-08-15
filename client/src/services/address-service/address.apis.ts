import axiosInstance from '@/config/axios.customize'

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
}

export const getProvincesAPI = async (): Promise<Province[]> => {
  const response = await axiosInstance.get('/api/v1/ghn/provinces')
  return response.data
}

export const getDistrictsAPI = async (provinceId: number): Promise<District[]> => {
  const response = await axiosInstance.get(`/api/v1/ghn/districts/${provinceId}`)
  return response.data
}

export const getWardsAPI = async (districtId: number): Promise<Ward[]> => {
  const response = await axiosInstance.get(`/api/v1/ghn/wards/${districtId}`)
  return response.data
}

export const calculateShippingFeeAPI = async (data: ShippingFeeRequest): Promise<ShippingFeeResponse> => {
  const response = await axiosInstance.post('/api/v1/ghn/shipping-fee', data)
  return response.data
}