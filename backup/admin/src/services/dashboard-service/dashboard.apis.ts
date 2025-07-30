import axios from '@/config/axios.customize';
import { DashboardStats, RevenueData, OrdersData } from './dashboard.types';
import { store } from '@/redux/store';

export interface DashboardParams {
  startDate?: string;
  endDate?: string;
}

export const fetchDashboardStats = async (params?: DashboardParams) => {
  // Get token from Redux store
  const token = store.getState().auth.access_token;
  
  return await axios.get<DashboardStats>('/dashboard/stats', { 
    params,
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};

export const fetchRevenueData = async (params?: DashboardParams) => {
  // Get token from Redux store
  const token = store.getState().auth.access_token;
  
  return await axios.get<RevenueData>('/dashboard/revenue', { 
    params,
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};

export const fetchOrdersData = async (params?: DashboardParams) => {
  // Get token from Redux store
  const token = store.getState().auth.access_token;
  
  return await axios.get<OrdersData>('/dashboard/orders', { 
    params,
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
};