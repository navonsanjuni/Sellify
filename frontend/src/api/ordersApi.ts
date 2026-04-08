import { baseApi } from './baseApi';
import type { ApiResponse, Paginated } from '@/types/api';
import type { Order } from '@/types/order';
import type { OrderStatus, PaymentMethod, PaymentStatus } from '@/lib/constants';

type OrderList = Paginated<Order> & { orders: Order[] };

interface ListOrdersParams {
  page?: number;
  limit?: number;
  search?: string;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  startDate?: string;
  endDate?: string;
}

interface CreateOrderBody {
  customerId?: string;
  items: { productId: string; quantity: number }[];
  discount?: number;
  tax?: number;
  paymentMethod?: PaymentMethod;
  amountPaid?: number;
  notes?: string;
}

export const ordersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Admin
    listOrders: build.query<OrderList, ListOrdersParams | void>({
      query: (params) => ({ url: '/orders', params: params || undefined }),
      transformResponse: (r: ApiResponse<OrderList>) => r.data,
      extraOptions: { realm: 'admin' },
      providesTags: ['Order'],
    }),
    getOrder: build.query<{ order: Order }, string>({
      query: (id) => `/orders/${id}`,
      transformResponse: (r: ApiResponse<{ order: Order }>) => r.data,
      extraOptions: { realm: 'admin' },
      providesTags: (_r, _e, id) => [{ type: 'Order', id }],
    }),
    createOrder: build.mutation<{ order: Order }, CreateOrderBody>({
      query: (body) => ({ url: '/orders', method: 'POST', body }),
      transformResponse: (r: ApiResponse<{ order: Order }>) => r.data,
      extraOptions: { realm: 'admin' },
      invalidatesTags: ['Order', 'Product', 'Dashboard', 'Payment'],
    }),
    updateOrderPayment: build.mutation<
      { order: Order },
      {
        id: string;
        paymentStatus: PaymentStatus;
        paymentMethod?: PaymentMethod;
        amountPaid?: number;
      }
    >({
      query: ({ id, ...body }) => ({ url: `/orders/${id}/payment`, method: 'PATCH', body }),
      transformResponse: (r: ApiResponse<{ order: Order }>) => r.data,
      extraOptions: { realm: 'admin' },
      invalidatesTags: ['Order', 'Payment', 'Dashboard'],
    }),
    updateOrderStatus: build.mutation<
      { order: Order },
      { id: string; orderStatus: OrderStatus }
    >({
      query: ({ id, orderStatus }) => ({
        url: `/orders/${id}/status`,
        method: 'PATCH',
        body: { orderStatus },
      }),
      transformResponse: (r: ApiResponse<{ order: Order }>) => r.data,
      extraOptions: { realm: 'admin' },
      invalidatesTags: ['Order'],
    }),

    // Customer
    listMyOrders: build.query<OrderList, { page?: number; limit?: number } | void>({
      query: (params) => ({ url: '/orders/my', params: params || undefined }),
      transformResponse: (r: ApiResponse<OrderList>) => r.data,
      extraOptions: { realm: 'customer' },
      providesTags: ['Order'],
    }),
    getMyOrder: build.query<{ order: Order }, string>({
      query: (id) => `/orders/my/${id}`,
      transformResponse: (r: ApiResponse<{ order: Order }>) => r.data,
      extraOptions: { realm: 'customer' },
    }),
  }),
});

export const {
  useListOrdersQuery,
  useGetOrderQuery,
  useCreateOrderMutation,
  useUpdateOrderPaymentMutation,
  useUpdateOrderStatusMutation,
  useListMyOrdersQuery,
  useGetMyOrderQuery,
} = ordersApi;
