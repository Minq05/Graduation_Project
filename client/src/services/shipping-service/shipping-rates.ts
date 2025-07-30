// Bảng phí vận chuyển dựa trên khoảng cách thực tế từ vị trí shop đến vị trí nhận hàng

// Tỉnh thành của shop (lấy từ config GHN)
export const SHOP_PROVINCE = 'Hà Nội'

// Bảng khoảng cách tương đối từ Hà Nội đến các tỉnh thành (đơn vị: km)
const DISTANCE_FROM_HANOI: Record<string, number> = {
  // Miền Bắc (gần)
  'Hà Nội': 0,
  'Hưng Yên': 40,
  'Bắc Ninh': 30,
  'Hải Dương': 60,
  'Vĩnh Phúc': 50,
  'Hà Nam': 60,

  // Miền Bắc (trung bình)
  'Hải Phòng': 120,
  'Thái Bình': 110,
  'Nam Định': 90,
  'Ninh Bình': 100,
  'Bắc Giang': 60,
  'Phú Thọ': 80,
  'Thái Nguyên': 80,

  // Miền Bắc (xa)
  'Quảng Ninh': 150,
  'Hòa Bình': 80,
  'Bắc Kạn': 170,
  'Lạng Sơn': 180,
  'Tuyên Quang': 130,
  'Yên Bái': 180,
  'Lào Cai': 320,
  'Hà Giang': 320,
  'Cao Bằng': 280,
  'Sơn La': 320,
  'Điện Biên': 500,
  'Lai Châu': 450,

  // Miền Trung (gần)
  'Thanh Hóa': 160,
  'Nghệ An': 300,
  'Hà Tĩnh': 350,
  'Quảng Bình': 500,
  'Quảng Trị': 600,
  'Thừa Thiên Huế': 650,
  'Huế': 650,

  // Miền Trung (xa)
  'Đà Nẵng': 800,
  'Quảng Nam': 850,
  'Quảng Ngãi': 950,
  'Bình Định': 1100,
  'Phú Yên': 1200,
  'Khánh Hòa': 1300,
  'Ninh Thuận': 1400,
  'Bình Thuận': 1500,

  // Tây Nguyên
  'Kon Tum': 1200,
  'Gia Lai': 1150,
  'Đắk Lắk': 1300,
  'Đắk Nông': 1400,
  'Lâm Đồng': 1500,

  // Miền Nam (gần)
  'Bình Phước': 1600,
  'Tây Ninh': 1650,
  'Bình Dương': 1700,
  'Đồng Nai': 1750,
  'Bà Rịa - Vũng Tàu': 1800,
  'Hồ Chí Minh': 1700,
  'Long An': 1750,

  // Miền Nam (xa)
  'Tiền Giang': 1800,
  'Bến Tre': 1850,
  'Vĩnh Long': 1850,
  'Trà Vinh': 1900,
  'Đồng Tháp': 1850,
  'An Giang': 1900,
  'Kiên Giang': 2000,
  'Cần Thơ': 1900,
  'Hậu Giang': 1950,
  'Sóc Trăng': 2000,
  'Bạc Liêu': 2050,
  'Cà Mau': 2100
}

// Tính phí vận chuyển dựa trên khoảng cách
const calculateShippingFeeByDistance = (distance: number): number => {
  // Phí cơ bản cho 10km đầu tiên
  const baseFee = 15000

  if (distance <= 10) {
    return baseFee
  } else if (distance <= 50) {
    // 10-50km: 15k + 1k/km
    return baseFee + (distance - 10) * 1000
  } else if (distance <= 100) {
    // 50-100km: 55k + 800đ/km
    return 55000 + (distance - 50) * 800
  } else if (distance <= 200) {
    // 100-200km: 95k + 700đ/km
    return 95000 + (distance - 100) * 700
  } else if (distance <= 500) {
    // 200-500km: 165k + 600đ/km
    return 165000 + (distance - 200) * 600
  } else if (distance <= 1000) {
    // 500-1000km: 345k + 500đ/km
    return 345000 + (distance - 500) * 500
  } else if (distance <= 1500) {
    // 1000-1500km: 595k + 400đ/km
    return 595000 + (distance - 1000) * 400
  } else {
    // >1500km: 795k + 300đ/km
    return 795000 + (distance - 1500) * 300
  }
}

// Tạo bảng giá vận chuyển dựa trên khoảng cách
export const SHIPPING_RATES: Record<string, number> = {}

// Điền bảng giá vận chuyển
Object.entries(DISTANCE_FROM_HANOI).forEach(([province, distance]) => {
  // Tính phí vận chuyển dựa trên khoảng cách
  const fee = calculateShippingFeeByDistance(distance)

  // Làm tròn đến 1000 đồng
  const roundedFee = Math.ceil(fee / 1000) * 1000

  // Lưu vào bảng giá
  SHIPPING_RATES[province] = roundedFee
})

// Thêm các tên tỉnh thành khác có thể có trong dữ liệu
const additionalProvinces = [
  'Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
  'An Giang', 'Bà Rịa - Vũng Tàu', 'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu',
  'Bắc Ninh', 'Bến Tre', 'Bình Định', 'Bình Dương', 'Bình Phước',
  'Bình Thuận', 'Cà Mau', 'Cao Bằng', 'Đắk Lắk', 'Đắk Nông',
  'Điện Biên', 'Đồng Nai', 'Đồng Tháp', 'Gia Lai', 'Hà Giang',
  'Hà Nam', 'Hà Tĩnh', 'Hải Dương', 'Hậu Giang', 'Hòa Bình',
  'Hưng Yên', 'Khánh Hòa', 'Kiên Giang', 'Kon Tum', 'Lai Châu',
  'Lâm Đồng', 'Lạng Sơn', 'Lào Cai', 'Long An', 'Nam Định',
  'Nghệ An', 'Ninh Bình', 'Ninh Thuận', 'Phú Thọ', 'Phú Yên',
  'Quảng Bình', 'Quảng Nam', 'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị',
  'Sóc Trăng', 'Sơn La', 'Tây Ninh', 'Thái Bình', 'Thái Nguyên',
  'Thanh Hóa', 'Thừa Thiên Huế', 'Tiền Giang', 'Trà Vinh', 'Tuyên Quang',
  'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái'
]

// Thêm các tỉnh thành chưa có trong bảng giá
additionalProvinces.forEach(province => {
  if (!SHIPPING_RATES[province]) {
    // Nếu chưa có trong bảng giá, thêm với giá mặc định
    SHIPPING_RATES[province] = 50000
  }
})

// Lấy phí vận chuyển dựa trên tỉnh thành
export const getShippingRateByProvince = (provinceName: string, shippingMethod: string): number => {
  // Nếu không có tên tỉnh hoặc không tìm thấy trong bảng giá
  if (!provinceName || !SHIPPING_RATES[provinceName]) {
    // Giá mặc định
    return shippingMethod === 'express-ghn' ? 45000 : 
      shippingMethod === 'express' ? 60000 : 30000
  }

  // Lấy giá cơ bản từ bảng
  const baseRate = SHIPPING_RATES[provinceName]

  // Điều chỉnh theo phương thức vận chuyển
  switch (shippingMethod) {
  case 'express-ghn':
    return Math.round(baseRate * 1.5) // Phí giao hàng nhanh = 1.5 lần phí tiêu chuẩn
  case 'express':
    return Math.round(baseRate * 2) // Phí giao hàng hỏa tốc = 2 lần phí tiêu chuẩn
  case 'standard':
  default:
    return baseRate
  }
}

// Lấy thời gian giao hàng dự kiến dựa trên tỉnh thành
export const getEstimatedDeliveryTime = (provinceName: string, shippingMethod: string): string => {
  // Miền Nam
  const southProvinces = [
    'Hồ Chí Minh', 'Bình Dương', 'Đồng Nai', 'Bà Rịa - Vũng Tàu', 'Long An',
    'Tiền Giang', 'Bến Tre', 'Vĩnh Long', 'Cần Thơ', 'An Giang', 'Kiên Giang',
    'Cà Mau', 'Bạc Liêu', 'Sóc Trăng', 'Trà Vinh', 'Hậu Giang', 'Đồng Tháp', 'Tây Ninh',
    'Bình Phước'
  ]

  // Miền Trung
  const centralProvinces = [
    'Đà Nẵng', 'Thừa Thiên Huế', 'Huế', 'Quảng Nam', 'Quảng Ngãi', 'Bình Định', 'Phú Yên',
    'Khánh Hòa', 'Ninh Thuận', 'Bình Thuận', 'Kon Tum', 'Gia Lai',
    'Đắk Lắk', 'Đắk Nông', 'Lâm Đồng'
  ]

  // Xác định khu vực
  let region = 'north' // Mặc định là miền Bắc
  if (southProvinces.includes(provinceName)) {
    region = 'south'
  } else if (centralProvinces.includes(provinceName)) {
    region = 'central'
  }

  // Ước tính thời gian giao hàng dựa trên khu vực và phương thức vận chuyển
  switch (shippingMethod) {
  case 'express-ghn':
    if (region === 'south') return '1-2 ngày'
    if (region === 'central') return '2-3 ngày'
    return '3-4 ngày'
  case 'express':
    if (region === 'south') return '24 giờ'
    if (region === 'central') return '48 giờ'
    return '72 giờ'
  case 'standard':
  default:
    if (region === 'south') return '2-3 ngày'
    if (region === 'central') return '3-5 ngày'
    return '5-7 ngày'
  }
}
