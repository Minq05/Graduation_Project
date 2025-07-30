import { useMutation } from '@tanstack/react-query'
import { createVNPayPaymentAPI, VNPayPaymentRequest } from '@/services/vnpay-service/vnpay.apis'
import { toast } from 'react-toastify'

export const useVNPay = () => {
  const vnpayMutation = useMutation({
    mutationFn: (data: VNPayPaymentRequest) => createVNPayPaymentAPI(data),
    onSuccess: (response) => {
      console.log('VNPay payment success:', response)
      if (response.paymentUrl) {
        window.location.href = response.paymentUrl
      } else {
        toast.error('Không nhận được URL thanh toán từ VNPay!')
      }
    },
    onError: (error: any) => {
      console.error('VNPay payment error:', error)
      const errorMessage = error?.message || error?.response?.data?.message || 'Không thể tạo liên kết thanh toán VNPay!'
      toast.error(errorMessage)
    }
  })

  const createPayment = (data: VNPayPaymentRequest) => {
    vnpayMutation.mutate(data)
  }

  return {
    createPayment,
    isLoading: vnpayMutation.isPending,
    error: vnpayMutation.error
  }
}

export default useVNPay