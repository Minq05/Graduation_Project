// Hàm tính khoảng cách giữa 2 tọa độ (Haversine formula)
export const calculateDistanceByCoordinates = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371 // Bán kính Trái Đất (km)
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Hàm giả lập tọa độ từ địa chỉ (trong thực tế nên dùng Geocoding API)
export const getCoordinatesFromAddress = async (address: string): Promise<{ lat: number; lon: number }> => {
  // Giả lập tọa độ dựa trên hash của địa chỉ
  const hash = address.split('').reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0)
    return a & a
  }, 0)
  
  return {
    lat: 10.8 + (Math.abs(hash) % 1000) / 10000, // Khu vực TP.HCM
    lon: 106.6 + (Math.abs(hash >> 8) % 1000) / 10000
  }
}