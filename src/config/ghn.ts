/**
 * Giao Hàng Nhanh (GHN) Configuration
 */
export const GHN_CONFIG = {
  API_URL: 'https://dev-online-gateway.ghn.vn/shiip/public-api',
  TOKEN: '0ebc1f84-5ff5-11f0-9b81-222185cb68c8',
  SHOP_ID: 197102,
  SHOP_INFO: {
    name: 'Shop Vietperfume',
    phone: '0987654321',
    address: 'Đường Trần Thái Tông',
    ward_name: 'Phường Dịch Vọng Hậu',
    ward_code: '20308',
    district_id: 1442,
    district_name: 'Quận Cầu Giấy',
    province_name: 'TP Hà Nội'
  },
  DEFAULT_SERVICE_ID: 53320, // Standard service
  DEFAULT_SERVICE_TYPE_ID: 2, // Standard service type
  DEFAULT_PACKAGE: {
    weight: 500, // Default 500g
    length: 20,
    width: 20,
    height: 10
  }
}
