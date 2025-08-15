// Tính phí ship dựa trên khoảng cách từ Hà Nội đến các tỉnh thành
const SHOP_PROVINCE = 'Hà Nội'

// Bảng phí ship theo khu vực (VND)
const SHIPPING_RATES = {
  // Miền Bắc - gần Hà Nội
  north_near: {
    standard: 25000,
    express: 35000,
    express_ghn: 30000
  },
  // Miền Bắc - xa Hà Nội
  north_far: {
    standard: 35000,
    express: 50000,
    express_ghn: 40000
  },
  // Miền Trung
  central: {
    standard: 45000,
    express: 65000,
    express_ghn: 55000
  },
  // Miền Nam
  south: {
    standard: 55000,
    express: 80000,
    express_ghn: 70000
  }
}

// Phân loại tỉnh thành theo khu vực
const PROVINCE_REGIONS = {
  north_near: [
    'Hà Nội', 'Hải Phòng', 'Quảng Ninh', 'Hải Dương', 'Hưng Yên', 
    'Thái Bình', 'Nam Định', 'Ninh Bình', 'Hà Nam', 'Vĩnh Phúc',
    'Bắc Ninh', 'Bắc Giang'
  ],
  north_far: [
    'Lào Cai', 'Yên Bái', 'Điện Biên', 'Lai Châu', 'Sơn La', 
    'Hòa Bình', 'Thái Nguyên', 'Tuyên Quang', 'Phú Thọ', 'Cao Bằng',
    'Bắc Kạn', 'Lạng Sơn', 'Hà Giang'
  ],
  central: [
    'Thanh Hóa', 'Nghệ An', 'Hà Tĩnh', 'Quảng Bình', 'Quảng Trị',
    'Thừa Thiên Huế', 'Đà Nẵng', 'Quảng Nam', 'Quảng Ngãi',
    'Bình Định', 'Phú Yên', 'Khánh Hòa', 'Ninh Thuận', 'Bình Thuận',
    'Kon Tum', 'Gia Lai', 'Đắk Lắk', 'Đắk Nông', 'Lâm Đồng'
  ],
  south: [
    'Hồ Chí Minh', 'Bình Phước', 'Tây Ninh', 'Bình Dương', 'Đồng Nai',
    'Bà Rịa - Vũng Tàu', 'Long An', 'Tiền Giang', 'Bến Tre', 'Trà Vinh',
    'Vĩnh Long', 'Đồng Tháp', 'An Giang', 'Kiên Giang', 'Cần Thơ',
    'Hậu Giang', 'Sóc Trăng', 'Bạc Liêu', 'Cà Mau'
  ]
}

// Hàm xác định khu vực của tỉnh
const getProvinceRegion = (provinceName: string): keyof typeof SHIPPING_RATES => {
  for (const [region, provinces] of Object.entries(PROVINCE_REGIONS)) {
    if (provinces.some(p => provinceName.includes(p) || p.includes(provinceName))) {
      return region as keyof typeof SHIPPING_RATES
    }
  }
  return 'central'
}

// Hàm tính phí ship theo tỉnh thành và phương thức
export const calculateShippingFee = (
  provinceName: string, 
  shippingMethod: 'standard' | 'express' | 'express_ghn' = 'standard'
): number => {
  if (!provinceName) return SHIPPING_RATES.north_near.standard

  if (provinceName.includes(SHOP_PROVINCE) || SHOP_PROVINCE.includes(provinceName)) {
    return shippingMethod === 'standard' ? 15000 : 
           shippingMethod === 'express_ghn' ? 20000 : 25000
  }

  const region = getProvinceRegion(provinceName)
  return SHIPPING_RATES[region][shippingMethod]
}

// Hàm ước tính thời gian giao hàng
export const estimateDeliveryTime = (
  provinceName: string,
  shippingMethod: 'standard' | 'express' | 'express_ghn' = 'standard'
): string => {
  if (!provinceName) return '2-3 ngày'

  if (provinceName.includes(SHOP_PROVINCE) || SHOP_PROVINCE.includes(provinceName)) {
    return shippingMethod === 'standard' ? '1-2 ngày' :
           shippingMethod === 'express_ghn' ? '4-6 giờ' : '2-4 giờ'
  }

  const region = getProvinceRegion(provinceName)
  
  switch (region) {
    case 'north_near':
      return shippingMethod === 'standard' ? '1-2 ngày' :
             shippingMethod === 'express_ghn' ? '6-12 giờ' : '4-8 giờ'
    case 'north_far':
      return shippingMethod === 'standard' ? '2-3 ngày' :
             shippingMethod === 'express_ghn' ? '1-2 ngày' : '12-24 giờ'
    case 'central':
      return shippingMethod === 'standard' ? '3-4 ngày' :
             shippingMethod === 'express_ghn' ? '2-3 ngày' : '1-2 ngày'
    case 'south':
      return shippingMethod === 'standard' ? '4-5 ngày' :
             shippingMethod === 'express_ghn' ? '2-4 ngày' : '1-3 ngày'
    default:
      return '2-3 ngày'
  }
}

export { SHOP_PROVINCE }