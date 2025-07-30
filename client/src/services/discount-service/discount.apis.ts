import axios from '@/config/axios.customize'

export interface IDiscount {
  _id: string
  code: string
  type: '%' | 'Vnd'
  value: number
  min_order_value: number
  max_discount_amount: number
  usage_limit: number
  usage_per_user: number
  status: string
  startDate: string
  endDate: string
  description?: string
}

export const applyDiscountAPI = async (code: string, orderValue: number) => {
  try {
    const response = await axios.post<IBackendResponse<any>>('/api/v1/discounts/apply', {
      code,
      orderValue
    })
    return response
  } catch (error: any) {
    throw error.response?.data || error
  }
}