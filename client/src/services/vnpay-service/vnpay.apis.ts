import axiosInstance from '@/config/axios.customize'

export interface VNPayPaymentRequest {
  amount: number
  orderId: string
  orderInfo: string
}

export interface VNPayPaymentResponse {
  success?: boolean
  paymentUrl: string
  message?: string
  error?: string
}

export interface VNPayReturnResponse {
  success: boolean
  message: string
  data?: any
  code?: string
  verified?: boolean
}

export const createVNPayPaymentAPI = async (data: VNPayPaymentRequest): Promise<VNPayPaymentResponse> => {
  try {
    console.log('Sending VNPay payment request:', data)
    const response = await axiosInstance.post('/api/v1/vnpay/create-payment', data)
    console.log('VNPay payment response:', response)
    
    if (!response.paymentUrl) {
      throw new Error(response.message || 'Không nhận được URL thanh toán từ VNPay!')
    }
    
    return response
  } catch (error) {
    console.error('VNPay API Error:', error)
    throw error
  }
}

export const verifyVNPayReturnAPI = async (params: URLSearchParams): Promise<VNPayReturnResponse> => {
  const response = await axiosInstance.get(`/api/v1/vnpay/return?${params.toString()}`)
  return response.data
}

export const checkOrderStatusAPI = async (orderId: string): Promise<any> => {
  const response = await axiosInstance.get(`/api/v1/orders/${orderId}`)
  return response.data
}