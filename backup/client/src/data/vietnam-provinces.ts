export interface Province {
  code: string;
  name: string;
}

export interface District {
  code: string;
  name: string;
  provinceCode: string;
}

export interface Ward {
  code: string;
  name: string;
  districtCode: string;
}

export const provinces: Province[] = [
  { code: '01', name: 'Hà Nội' },
  { code: '02', name: 'Hồ Chí Minh' },
  { code: '03', name: 'Đà Nẵng' },
  { code: '04', name: 'Hải Phòng' },
  { code: '05', name: 'Cần Thơ' },
  { code: '06', name: 'An Giang' },
  { code: '07', name: 'Bà Rịa - Vũng Tàu' },
  { code: '08', name: 'Bắc Giang' },
  { code: '09', name: 'Bắc Kạn' },
  { code: '10', name: 'Bạc Liêu' },
  { code: '11', name: 'Bắc Ninh' },
  { code: '12', name: 'Bến Tre' },
  { code: '13', name: 'Bình Định' },
  { code: '14', name: 'Bình Dương' },
  { code: '15', name: 'Bình Phước' },
  { code: '16', name: 'Bình Thuận' },
  { code: '17', name: 'Cà Mau' },
  { code: '18', name: 'Cao Bằng' },
  { code: '19', name: 'Đắk Lắk' },
  { code: '20', name: 'Đắk Nông' },
  { code: '21', name: 'Điện Biên' },
  { code: '22', name: 'Đồng Nai' },
  { code: '23', name: 'Đồng Tháp' },
  { code: '24', name: 'Gia Lai' },
  { code: '25', name: 'Hà Giang' },
  { code: '26', name: 'Hà Nam' },
  { code: '27', name: 'Hà Tĩnh' },
  { code: '28', name: 'Hải Dương' },
  { code: '29', name: 'Hậu Giang' },
  { code: '30', name: 'Hòa Bình' },
  { code: '31', name: 'Hưng Yên' },
  { code: '32', name: 'Khánh Hòa' },
  { code: '33', name: 'Kiên Giang' },
  { code: '34', name: 'Kon Tum' },
  { code: '35', name: 'Lai Châu' },
  { code: '36', name: 'Lâm Đồng' },
  { code: '37', name: 'Lạng Sơn' },
  { code: '38', name: 'Lào Cai' },
  { code: '39', name: 'Long An' },
  { code: '40', name: 'Nam Định' },
  { code: '41', name: 'Nghệ An' },
  { code: '42', name: 'Ninh Bình' },
  { code: '43', name: 'Ninh Thuận' },
  { code: '44', name: 'Phú Thọ' },
  { code: '45', name: 'Phú Yên' },
  { code: '46', name: 'Quảng Bình' },
  { code: '47', name: 'Quảng Nam' },
  { code: '48', name: 'Quảng Ngãi' },
  { code: '49', name: 'Quảng Ninh' },
  { code: '50', name: 'Quảng Trị' },
  { code: '51', name: 'Sóc Trăng' },
  { code: '52', name: 'Sơn La' },
  { code: '53', name: 'Tây Ninh' },
  { code: '54', name: 'Thái Bình' },
  { code: '55', name: 'Thái Nguyên' },
  { code: '56', name: 'Thanh Hóa' },
  { code: '57', name: 'Thừa Thiên Huế' },
  { code: '58', name: 'Tiền Giang' },
  { code: '59', name: 'Trà Vinh' },
  { code: '60', name: 'Tuyên Quang' },
  { code: '61', name: 'Vĩnh Long' },
  { code: '62', name: 'Vĩnh Phúc' },
  { code: '63', name: 'Yên Bái' }
];

// Dữ liệu quận/huyện của Hà Nội
export const districts: District[] = [
  { code: '001', name: 'Ba Đình', provinceCode: '01' },
  { code: '002', name: 'Hoàn Kiếm', provinceCode: '01' },
  { code: '003', name: 'Tây Hồ', provinceCode: '01' },
  { code: '004', name: 'Long Biên', provinceCode: '01' },
  { code: '005', name: 'Cầu Giấy', provinceCode: '01' },
  { code: '006', name: 'Đống Đa', provinceCode: '01' },
  { code: '007', name: 'Hai Bà Trưng', provinceCode: '01' },
  { code: '008', name: 'Hoàng Mai', provinceCode: '01' },
  { code: '009', name: 'Thanh Xuân', provinceCode: '01' },
  { code: '016', name: 'Sóc Sơn', provinceCode: '01' },
  { code: '017', name: 'Đông Anh', provinceCode: '01' },
  { code: '018', name: 'Gia Lâm', provinceCode: '01' },
  { code: '019', name: 'Nam Từ Liêm', provinceCode: '01' },
  { code: '020', name: 'Thanh Trì', provinceCode: '01' },
  { code: '021', name: 'Bắc Từ Liêm', provinceCode: '01' },
  { code: '250', name: 'Mê Linh', provinceCode: '01' },
  { code: '268', name: 'Hà Đông', provinceCode: '01' },
  { code: '269', name: 'Sơn Tây', provinceCode: '01' },
  { code: '271', name: 'Ba Vì', provinceCode: '01' },
  { code: '272', name: 'Phúc Thọ', provinceCode: '01' },
  { code: '273', name: 'Đan Phượng', provinceCode: '01' },
  { code: '274', name: 'Hoài Đức', provinceCode: '01' },
  { code: '275', name: 'Quốc Oai', provinceCode: '01' },
  { code: '276', name: 'Thạch Thất', provinceCode: '01' },
  { code: '277', name: 'Chương Mỹ', provinceCode: '01' },
  { code: '278', name: 'Thanh Oai', provinceCode: '01' },
  { code: '279', name: 'Thường Tín', provinceCode: '01' },
  { code: '280', name: 'Phú Xuyên', provinceCode: '01' },
  { code: '281', name: 'Ứng Hòa', provinceCode: '01' },
  { code: '282', name: 'Mỹ Đức', provinceCode: '01' }
];

// Dữ liệu phường/xã của quận Ba Đình (ví dụ)
export const wards: Ward[] = [
  { code: '00001', name: 'Phúc Xá', districtCode: '001' },
  { code: '00004', name: 'Trúc Bạch', districtCode: '001' },
  { code: '00006', name: 'Vĩnh Phúc', districtCode: '001' },
  { code: '00007', name: 'Cống Vị', districtCode: '001' },
  { code: '00008', name: 'Liễu Giai', districtCode: '001' },
  { code: '00010', name: 'Nguyễn Trung Trực', districtCode: '001' },
  { code: '00013', name: 'Quán Thánh', districtCode: '001' },
  { code: '00016', name: 'Ngọc Hà', districtCode: '001' },
  { code: '00019', name: 'Điện Biên', districtCode: '001' },
  { code: '00022', name: 'Đội Cấn', districtCode: '001' },
  { code: '00025', name: 'Ngọc Khánh', districtCode: '001' },
  { code: '00028', name: 'Kim Mã', districtCode: '001' },
  { code: '00031', name: 'Giảng Võ', districtCode: '001' },
  { code: '00034', name: 'Thành Công', districtCode: '001' },
  
  // Phường của quận Hoàn Kiếm
  { code: '00037', name: 'Phúc Tân', districtCode: '002' },
  { code: '00040', name: 'Đồng Xuân', districtCode: '002' },
  { code: '00043', name: 'Hàng Mã', districtCode: '002' },
  { code: '00046', name: 'Hàng Buồm', districtCode: '002' },
  { code: '00049', name: 'Hàng Đào', districtCode: '002' },
  { code: '00052', name: 'Hàng Bồ', districtCode: '002' },
  { code: '00055', name: 'Cửa Đông', districtCode: '002' },
  { code: '00058', name: 'Lý Thái Tổ', districtCode: '002' },
  { code: '00061', name: 'Hàng Bạc', districtCode: '002' },
  { code: '00064', name: 'Hàng Gai', districtCode: '002' },
  { code: '00067', name: 'Chương Dương', districtCode: '002' },
  { code: '00070', name: 'Hàng Trống', districtCode: '002' },
  { code: '00073', name: 'Cửa Nam', districtCode: '002' },
  { code: '00076', name: 'Hàng Bông', districtCode: '002' },
  { code: '00079', name: 'Tràng Tiền', districtCode: '002' },
  { code: '00082', name: 'Trần Hưng Đạo', districtCode: '002' },
  { code: '00085', name: 'Phan Chu Trinh', districtCode: '002' },
  { code: '00088', name: 'Hàng Bài', districtCode: '002' },
  
  // Thêm phường của các quận khác ở Hà Nội tương tự...
];

// Hàm lấy danh sách quận/huyện theo mã tỉnh/thành phố
export const getDistrictsByProvinceCode = (provinceCode: string): District[] => {
  return districts.filter(district => district.provinceCode === provinceCode);
};

// Hàm lấy danh sách phường/xã theo mã quận/huyện
export const getWardsByDistrictCode = (districtCode: string): Ward[] => {
  return wards.filter(ward => ward.districtCode === districtCode);
};