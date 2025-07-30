import axios from '@/config/axios.customize'

// Lấy sản phẩm flash sale đang hoạt động
export const getFlashSaleProducts = async () => {
  try {
    console.log('Calling flash sale API: /api/v1/flashsales-item/active')
    const response = await axios.get('/api/v1/flashsales-item/active')
    console.log('Full API response:', response)
    
    // Vì axios interceptor đã return res.data, nên response chính là data
    console.log('API response (after interceptor):', response)
    console.log('Response type:', typeof response)
    console.log('Response statusCode:', response?.statusCode)
    console.log('Response data:', response?.data)
    
    // Trả về response để component xử lý
    return response
  } catch (error) {
    console.error('Error fetching flash sale products:', error)
    console.error('Error details:', error.response?.data)
    return { statusCode: 500, data: [] }
  }
}

// Lấy tất cả flash sale đang hoạt động
export const getActiveFlashSales = async () => {
  try {
    const response = await axios.get('/api/v1/flashsales/active')
    return response.data || { data: [] }
  } catch (error) {
    console.error('Error fetching active flash sales:', error)
    return { data: [] }
  }
}

// Lấy flash sale theo ID
export const getFlashSaleById = async (id: string) => {
  try {
    const response = await axios.get(`/api/v1/flashsales/${id}`)
    return response.data
  } catch (error) {
    console.error('Error fetching flash sale by id:', error)
    throw error
  }
}

// Lấy sản phẩm flash sale theo flash sale ID
export const getFlashSaleItems = async (flashSaleId: string, params?: { current?: number; pageSize?: number }) => {
  try {
    const response = await axios.get('/api/v1/flashsales-item', {
      params: { flashSaleId, ...params }
    })
    return response.data
  } catch (error) {
    console.error('Error fetching flash sale items:', error)
    throw error
  }
}