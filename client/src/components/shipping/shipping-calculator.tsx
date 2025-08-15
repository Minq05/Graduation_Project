import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AddressDropdown } from '@/components/ui/address-dropdown'
import { calculateShippingFeeAPI, Province, District, Ward } from '@/services/address-service/address.apis'
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'

interface ShippingCalculatorProps {
  onShippingFeeChange?: (fee: number) => void
  defaultProvinceId?: number
  defaultDistrictId?: number
  defaultWardCode?: string
}

export const ShippingCalculator = ({
  onShippingFeeChange,
  defaultProvinceId,
  defaultDistrictId,
  defaultWardCode
}: ShippingCalculatorProps) => {
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null)
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null)
  const [selectedWard, setSelectedWard] = useState<Ward | null>(null)

  // Calculate shipping fee when address is complete
  const { data: shippingFee, isLoading: isCalculating } = useQuery({
    queryKey: ['shipping-fee', selectedDistrict?.DistrictID, selectedWard?.WardCode],
    queryFn: () => calculateShippingFeeAPI({
      to_district_id: selectedDistrict!.DistrictID,
      to_ward_code: selectedWard!.WardCode,
      weight: 500, // Default weight 500g
      length: 20,
      width: 20,
      height: 10
    }),
    enabled: !!(selectedDistrict && selectedWard),
    staleTime: 5 * 60 * 1000 // Cache for 5 minutes
  })

  useEffect(() => {
    if (shippingFee && onShippingFeeChange) {
      onShippingFeeChange(shippingFee.total)
    }
  }, [shippingFee, onShippingFeeChange])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Tính phí vận chuyển</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <AddressDropdown
          onProvinceChange={setSelectedProvince}
          onDistrictChange={setSelectedDistrict}
          onWardChange={setSelectedWard}
          defaultProvinceId={defaultProvinceId}
          defaultDistrictId={defaultDistrictId}
          defaultWardCode={defaultWardCode}
        />

        {isCalculating && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Đang tính phí vận chuyển...</span>
          </div>
        )}

        {shippingFee && !isCalculating && (
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span>Phí vận chuyển:</span>
              <span className="font-semibold">{formatCurrency(shippingFee.service_fee)}</span>
            </div>
            {shippingFee.insurance_fee > 0 && (
              <div className="flex justify-between">
                <span>Phí bảo hiểm:</span>
                <span>{formatCurrency(shippingFee.insurance_fee)}</span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between font-bold">
              <span>Tổng cộng:</span>
              <span className="text-purple-600">{formatCurrency(shippingFee.total)}</span>
            </div>
          </div>
        )}

        {selectedDistrict && selectedWard && !shippingFee && !isCalculating && (
          <div className="text-center py-4 text-gray-500">
            Không thể tính phí vận chuyển cho địa chỉ này
          </div>
        )}
      </CardContent>
    </Card>
  )
}