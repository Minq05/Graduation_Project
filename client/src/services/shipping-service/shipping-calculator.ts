// Danh sách các tỉnh thành và phí ship tương ứng
const SHIPPING_RATES = {
  // Miền Bắc
  'Thành phố Hà Nội': { standard: 25000, express: 35000, expressGhn: 30000 },
  'Tỉnh Hà Giang': { standard: 45000, express: 65000, expressGhn: 55000 },
  'Tỉnh Cao Bằng': { standard: 50000, express: 70000, expressGhn: 60000 },
  'Tỉnh Bắc Kạn': { standard: 48000, express: 68000, expressGhn: 58000 },
  'Tỉnh Tuyên Quang': { standard: 42000, express: 62000, expressGhn: 52000 },
  'Tỉnh Lào Cai': { standard: 47000, express: 67000, expressGhn: 57000 },
  'Tỉnh Điện Biên': { standard: 55000, express: 75000, expressGhn: 65000 },
  'Tỉnh Lai Châu': { standard: 53000, express: 73000, expressGhn: 63000 },
  'Tỉnh Sơn La': { standard: 50000, express: 70000, expressGhn: 60000 },
  'Tỉnh Yên Bái': { standard: 45000, express: 65000, expressGhn: 55000 },
  'Tỉnh Hoà Bình': { standard: 40000, express: 60000, expressGhn: 50000 },
  'Tỉnh Thái Nguyên': { standard: 38000, express: 58000, expressGhn: 48000 },
  'Tỉnh Lạng Sơn': { standard: 46000, express: 66000, expressGhn: 56000 },
  'Tỉnh Quảng Ninh': { standard: 35000, express: 55000, expressGhn: 45000 },
  'Tỉnh Bắc Giang': { standard: 36000, express: 56000, expressGhn: 46000 },
  'Tỉnh Phú Thọ': { standard: 37000, express: 57000, expressGhn: 47000 },
  'Tỉnh Vĩnh Phúc': { standard: 32000, express: 52000, expressGhn: 42000 },
  'Tỉnh Bắc Ninh': { standard: 30000, express: 50000, expressGhn: 40000 },
  'Tỉnh Hải Dương': { standard: 33000, express: 53000, expressGhn: 43000 },
  'Thành phố Hải Phòng': { standard: 35000, express: 55000, expressGhn: 45000 },
  'Tỉnh Hưng Yên': { standard: 31000, express: 51000, expressGhn: 41000 },
  'Tỉnh Thái Bình': { standard: 38000, express: 58000, expressGhn: 48000 },
  'Tỉnh Hà Nam': { standard: 34000, express: 54000, expressGhn: 44000 },
  'Tỉnh Nam Định': { standard: 39000, express: 59000, expressGhn: 49000 },
  'Tỉnh Ninh Bình': { standard: 41000, express: 61000, expressGhn: 51000 },

  // Miền Trung
  'Tỉnh Thanh Hóa': { standard: 43000, express: 63000, expressGhn: 53000 },
  'Tỉnh Nghệ An': { standard: 45000, express: 65000, expressGhn: 55000 },
  'Tỉnh Hà Tĩnh': { standard: 47000, express: 67000, expressGhn: 57000 },
  'Tỉnh Quảng Bình': { standard: 49000, express: 69000, expressGhn: 59000 },
  'Tỉnh Quảng Trị': { standard: 51000, express: 71000, expressGhn: 61000 },
  'Tỉnh Thừa Thiên Huế': { standard: 48000, express: 68000, expressGhn: 58000 },
  'Thành phố Đà Nẵng': { standard: 46000, express: 66000, expressGhn: 56000 },
  'Tỉnh Quảng Nam': { standard: 47000, express: 67000, expressGhn: 57000 },
  'Tỉnh Quảng Ngãi': { standard: 49000, express: 69000, expressGhn: 59000 },
  'Tỉnh Bình Định': { standard: 51000, express: 71000, expressGhn: 61000 },
  'Tỉnh Phú Yên': { standard: 53000, express: 73000, expressGhn: 63000 },
  'Tỉnh Khánh Hòa': { standard: 50000, express: 70000, expressGhn: 60000 },
  'Tỉnh Ninh Thuận': { standard: 52000, express: 72000, expressGhn: 62000 },
  'Tỉnh Bình Thuận': { standard: 48000, express: 68000, expressGhn: 58000 },
  'Tỉnh Kon Tum': { standard: 55000, express: 75000, expressGhn: 65000 },
  'Tỉnh Gia Lai': { standard: 53000, express: 73000, expressGhn: 63000 },
  'Tỉnh Đắk Lắk': { standard: 51000, express: 71000, expressGhn: 61000 },
  'Tỉnh Đắk Nông': { standard: 53000, express: 73000, expressGhn: 63000 },
  'Tỉnh Lâm Đồng': { standard: 49000, express: 69000, expressGhn: 59000 },

  // Miền Nam
  'Thành phố Hồ Chí Minh': { standard: 30000, express: 50000, expressGhn: 40000 },
  'Tỉnh Tây Ninh': { standard: 35000, express: 55000, expressGhn: 45000 },
  'Tỉnh Bình Dương': { standard: 32000, express: 52000, expressGhn: 42000 },
  'Tỉnh Bình Phước': { standard: 37000, express: 57000, expressGhn: 47000 },
  'Tỉnh Đồng Nai': { standard: 33000, express: 53000, expressGhn: 43000 },
  'Tỉnh Bà Rịa - Vũng Tàu': { standard: 36000, express: 56000, expressGhn: 46000 },
  'Tỉnh Long An': { standard: 34000, express: 54000, expressGhn: 44000 },
  'Tỉnh Tiền Giang': { standard: 36000, express: 56000, expressGhn: 46000 },
  'Tỉnh Bến Tre': { standard: 38000, express: 58000, expressGhn: 48000 },
  'Tỉnh Trà Vinh': { standard: 40000, express: 60000, expressGhn: 50000 },
  'Tỉnh Vĩnh Long': { standard: 39000, express: 59000, expressGhn: 49000 },
  'Tỉnh Đồng Tháp': { standard: 41000, express: 61000, expressGhn: 51000 },
  'Tỉnh An Giang': { standard: 43000, express: 63000, expressGhn: 53000 },
  'Tỉnh Kiên Giang': { standard: 45000, express: 65000, expressGhn: 55000 },
  'Thành phố Cần Thơ': { standard: 42000, express: 62000, expressGhn: 52000 },
  'Tỉnh Hậu Giang': { standard: 44000, express: 64000, expressGhn: 54000 },
  'Tỉnh Sóc Trăng': { standard: 46000, express: 66000, expressGhn: 56000 },
  'Tỉnh Bạc Liêu': { standard: 48000, express: 68000, expressGhn: 58000 },
  'Tỉnh Cà Mau': { standard: 50000, express: 70000, expressGhn: 60000 }
}

export type ShippingMethod = 'standard' | 'express' | 'express-ghn'

export const calculateShippingFee = (provinceName: string, method: ShippingMethod = 'standard'): number => {
  const rates = SHIPPING_RATES[provinceName as keyof typeof SHIPPING_RATES]
  
  if (!rates) {
    // Phí mặc định nếu không tìm thấy tỉnh thành
    switch (method) {
      case 'standard': return 35000
      case 'express': return 55000
      case 'express-ghn': return 45000
      default: return 35000
    }
  }

  switch (method) {
    case 'standard': return rates.standard
    case 'express': return rates.express
    case 'express-ghn': return rates.expressGhn
    default: return rates.standard
  }
}

export const getEstimatedDeliveryTime = (provinceName: string, method: ShippingMethod = 'standard'): string => {
  // Tỉnh thành gần (miền Nam và một số tỉnh miền Trung gần)
  const nearProvinces = [
    'Thành phố Hồ Chí Minh', 'Tỉnh Bình Dương', 'Tỉnh Đồng Nai', 
    'Tỉnh Long An', 'Tỉnh Tiền Giang', 'Tỉnh Bến Tre'
  ]
  
  // Tỉnh thành xa (miền Bắc và miền Trung xa)
  const farProvinces = [
    'Tỉnh Hà Giang', 'Tỉnh Cao Bằng', 'Tỉnh Điện Biên', 'Tỉnh Lai Châu',
    'Tỉnh Cà Mau', 'Tỉnh Bạc Liêu', 'Tỉnh Kiên Giang'
  ]

  const isNear = nearProvinces.includes(provinceName)
  const isFar = farProvinces.includes(provinceName)

  switch (method) {
    case 'standard':
      if (isNear) return '1-2 ngày'
      if (isFar) return '3-5 ngày'
      return '2-3 ngày'
    
    case 'express-ghn':
      if (isNear) return '6-12 giờ'
      if (isFar) return '1-2 ngày'
      return '12-24 giờ'
    
    case 'express':
      if (isNear) return '3-6 giờ'
      if (isFar) return '12-24 giờ'
      return '6-12 giờ'
    
    default:
      return '2-3 ngày'
  }
}

export const getAllProvinces = (): string[] => {
  return Object.keys(SHIPPING_RATES)
}