import { Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface PaymentLoadingProps {
  message?: string
}

const PaymentLoading = ({ message = 'Đang xử lý thanh toán...' }: PaymentLoadingProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-sm">
        <CardContent className="flex flex-col items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
          <p className="text-gray-600 text-center">{message}</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default PaymentLoading