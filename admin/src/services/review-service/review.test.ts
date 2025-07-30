import axios from '@/config/axios.customize';

export const testReviewConnection = async () => {
  try {
    console.log('Testing review API connection...');
    
    // Test debug API first (no auth required)
    const debugResponse = await axios.get('/api/v1/reviews/debug');
    console.log('Debug API response:', debugResponse);
    
    // Test admin API (requires auth)
    const adminResponse = await axios.get('/api/v1/reviews?page=1&limit=10');
    console.log('Admin API response:', adminResponse);
    
    return { success: true, debugResponse, adminResponse };
  } catch (error) {
    console.error('API connection error:', error);
    return { success: false, error };
  }
};