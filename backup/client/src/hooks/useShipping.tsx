import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  getProvinces,
  getDistricts,
  getWards,
  calculateShippingFee,
  type Province,
  type District,
  type Ward,
  type ShippingFeeRequest
} from '@/services/shipping-service/shipping.apis'
import { shippingKeys } from '@/services/shipping-service/shipping.keys'

export const useShipping = () => {
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null)
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null)
  const [selectedWard, setSelectedWard] = useState<Ward | null>(null)
  const [packageInfo, setPackageInfo] = useState({
    weight: 500,
    length: 20,
    width: 20,
    height: 10
  })

  // Query for provinces
  const {
    data: provinces = [],
    isLoading: isLoadingProvinces
  } = useQuery({
    queryKey: shippingKeys.provinces(),
    queryFn: getProvinces
  })

  // Query for districts based on selected province
  const {
    data: districts = [],
    isLoading: isLoadingDistricts
  } = useQuery({
    queryKey: shippingKeys.districts(selectedProvince?.ProvinceID || 0),
    queryFn: () => getDistricts(selectedProvince?.ProvinceID || 0),
    enabled: !!selectedProvince
  })

  // Query for wards based on selected district
  const {
    data: wards = [],
    isLoading: isLoadingWards
  } = useQuery({
    queryKey: shippingKeys.wards(selectedDistrict?.DistrictID || 0),
    queryFn: () => getWards(selectedDistrict?.DistrictID || 0),
    enabled: !!selectedDistrict
  })

  // Calculate shipping fee
  const calculateFee = (data: ShippingFeeRequest) => {
    return useQuery({
      queryKey: shippingKeys.shippingFee(data),
      queryFn: () => calculateShippingFee(data),
      enabled: false // Only run when explicitly called
    })
  }

  // Handle province selection
  const handleProvinceChange = (province: Province) => {
    setSelectedProvince(province)
    setSelectedDistrict(null)
    setSelectedWard(null)
  }

  // Handle district selection
  const handleDistrictChange = (district: District) => {
    setSelectedDistrict(district)
    setSelectedWard(null)
  }

  // Handle ward selection
  const handleWardChange = (ward: Ward) => {
    setSelectedWard(ward)
  }

  // Update package information
  const updatePackageInfo = (info: Partial<typeof packageInfo>) => {
    setPackageInfo(prev => ({ ...prev, ...info }))
  }

  return {
    // Data
    provinces,
    districts,
    wards,
    selectedProvince,
    selectedDistrict,
    selectedWard,
    packageInfo,

    // Loading states
    isLoadingProvinces,
    isLoadingDistricts,
    isLoadingWards,

    // Actions
    handleProvinceChange,
    handleDistrictChange,
    handleWardChange,
    updatePackageInfo,
    calculateFee
  }
}
