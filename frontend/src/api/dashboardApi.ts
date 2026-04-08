import { baseApi } from './baseApi';
import type { ApiResponse } from '@/types/api';

export interface DashboardStats {
  todaySales: { total: number; orders: number };
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  topProducts: { _id: string; name: string; totalSold: number; totalRevenue: number }[];
  lowStockProducts: { name: string; stock: number; lowStockThreshold: number; sku?: string }[];
  recentOrders: {
    _id?: string;
    orderNumber: string;
    total: number;
    paymentStatus: string;
    customer?: { name: string } | null;
    createdAt: string;
  }[];
  salesByDay: { date: string; sales: number; orders: number }[];
}

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getDashboardStats: build.query<DashboardStats, void>({
      query: () => '/dashboard/stats',
      transformResponse: (r: ApiResponse<DashboardStats>) => r.data,
      extraOptions: { realm: 'admin' },
      providesTags: ['Dashboard'],
    }),
  }),
});

export const { useGetDashboardStatsQuery } = dashboardApi;
