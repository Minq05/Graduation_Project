export const shippingKeys = {
  all: ['shipping'] as const,
  provinces: () => [...shippingKeys.all, 'provinces'] as const,
  districts: (provinceId: number) => [...shippingKeys.all, 'districts', provinceId] as const,
  wards: (districtId: number) => [...shippingKeys.all, 'wards', districtId] as const,
  shippingFee: (data: any) => [...shippingKeys.all, 'fee', JSON.stringify(data)] as const,
  orderStatus: (orderId: string) => [...shippingKeys.all, 'status', orderId] as const
}