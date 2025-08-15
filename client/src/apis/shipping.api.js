import axios from 'axios'

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000'

export const shippingApi = {
  // Tính phí vận chuyển
  calculateShippingFee: async (data) => {
    const response = await axios.post(`${API_BASE_URL}/shipping/calculate`, data)
    return response.data
  },

  // Lấy danh sách phương thức vận chuyển
  getShippingMethods: async () => {
    const response = await axios.get(`${API_BASE_URL}/shipping/methods`)
    return response.data
  }
}