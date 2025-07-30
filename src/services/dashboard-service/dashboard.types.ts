export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  revenueChange: string;
  ordersChange: string;
  usersChange: string;
  productsChange: string;
  revenueTrend: 'up' | 'down';
  ordersTrend: 'up' | 'down';
  usersTrend: 'up' | 'down';
  productsTrend: 'up' | 'down';
}

export interface RevenueDataPoint {
  label: string;
  value: number;
  fullLabel: string;
}

export interface RevenueData {
  data: RevenueDataPoint[];
}

export interface OrdersData {
  data: {
    date: string;
    count: number;
    total: number;
  }[];
}