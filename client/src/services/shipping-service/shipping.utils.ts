// Bảng phí vận chuyển dựa trên tỉnh thành
// Giá trị là phí vận chuyển từ TP.HCM đến các tỉnh thành khác
export const SHIPPING_RATES: Record<string, number> = {
  // Miền Nam
  'Hồ Chí Minh': 30000,
  'Bình Dương': 35000,
  'Đồng Nai': 35000,
  'Bà Rịa - Vũng Tàu': 40000,
  'Long An': 40000,
  'Tiền Giang': 40000,
  'Bến Tre': 45000,
  'Vĩnh Long': 45000,
  'Cần Thơ': 45000,
  'An Giang': 50000,
  'Kiên Giang': 50000,
  'Cà Mau': 55000,
  'Bạc Liêu': 55000,
  'Sóc Trăng': 50000,
  'Trà Vinh': 45000,
  'Hậu Giang': 50000,
  'Đồng Tháp': 45000,
  'Tây Ninh': 40000,
  'Bình Phước': 45000,

  // Miền Trung
  'Đà Nẵng': 60000,
  'Thừa Thiên Huế': 65000,
  'Quảng Nam': 65000,
  'Quảng Ngãi': 70000,
  'Bình Định': 70000,
  'Phú Yên': 75000,
  'Khánh Hòa': 75000,
  'Ninh Thuận': 65000,
  'Bình Thuận': 55000,
  'Kon Tum': 80000,
  'Gia Lai': 80000,
  'Đắk Lắk': 75000,
  'Đắk Nông': 70000,
  'Lâm Đồng': 60000,

  // Miền Bắc
  'Hà Nội': 70000,
  'Hải Phòng': 75000,
  'Quảng Ninh': 80000,
  'Hải Dương': 75000,
  'Hưng Yên': 75000,
  'Bắc Ninh': 75000,
  'Bắc Giang': 80000,
  'Thái Nguyên': 80000,
  'Vĩnh Phúc': 75000,
  'Phú Thọ': 80000,
  'Hà Nam': 75000,
  'Nam Định': 75000,
  'Thái Bình': 75000,
  'Ninh Bình': 75000,
  'Thanh Hóa': 70000,
  'Nghệ An': 70000,
  'Hà Tĩnh': 70000,
  'Quảng Bình': 70000,
  'Quảng Trị': 70000,

  // Tây Bắc và Đông Bắc
  'Hòa Bình': 80000,
  'Sơn La': 85000,
  'Điện Biên': 90000,
  'Lai Châu': 90000,
  'Lào Cai': 85000,
  'Yên Bái': 85000,
  'Tuyên Quang': 85000,
  'Hà Giang': 90000,
  'Cao Bằng': 90000,
  'Bắc Kạn': 85000,
  'Lạng Sơn': 85000
}

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
    return shippingMethod === 'express-ghn' ? 45000 : (shippingMethod === 'express' ? 60000 : 30000)
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
  // Phân loại tỉnh thành theo khu vực để ước tính thời gian giao hàng
  const southProvinces = [
    'Hồ Chí Minh', 'Bình Dương', 'Đồng Nai', 'Bà Rịa - Vũng Tàu', 'Long An',
    'Tiền Giang', 'Bến Tre', 'Vĩnh Long', 'Cần Thơ', 'An Giang', 'Kiên Giang',
    'Cà Mau', 'Bạc Liêu', 'Sóc Trăng', 'Trà Vinh', 'Hậu Giang', 'Đồng Tháp', 'Tây Ninh',
    'Bình Phước'
  ]

  const centralProvinces = [
    'Đà Nẵng', 'Thừa Thiên Huế', 'Quảng Nam', 'Quảng Ngãi', 'Bình Định', 'Phú Yên',
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
