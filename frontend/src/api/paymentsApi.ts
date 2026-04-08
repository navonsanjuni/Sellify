import { baseApi } from './baseApi';
import type { ApiResponse, Paginated } from '@/types/api';
import type { Payment } from '@/types/payment';

type PaymentList = Paginated<Payment> & { payments: Payment[] };

interface PaymentListParams {
  page?: number;
  limit?: number;
  method?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

interface RecordPaymentBody {
  orderId: string;
  amount: number;
  method: 'cash' | 'card' | 'transfer' | 'stripe';
  transactionId?: string;
  notes?: string;
}

export const paymentsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listPayments: build.query<PaymentList, PaymentListParams | void>({
      query: (params) => ({ url: '/payments', params: params || undefined }),
      transformResponse: (r: ApiResponse<PaymentList>) => r.data,
      extraOptions: { realm: 'admin' },
      providesTags: ['Payment'],
    }),
    listPaymentsForOrder: build.query<{ payments: Payment[] }, string>({
      query: (orderId) => `/payments/order/${orderId}`,
      transformResponse: (r: ApiResponse<{ payments: Payment[] }>) => r.data,
      extraOptions: { realm: 'admin' },
      providesTags: ['Payment'],
    }),
    recordPayment: build.mutation<{ payment: Payment }, RecordPaymentBody>({
      query: (body) => ({ url: '/payments', method: 'POST', body }),
      transformResponse: (r: ApiResponse<{ payment: Payment }>) => r.data,
      extraOptions: { realm: 'admin' },
      invalidatesTags: ['Payment', 'Order', 'Dashboard'],
    }),
  }),
});

export const {
  useListPaymentsQuery,
  useListPaymentsForOrderQuery,
  useRecordPaymentMutation,
} = paymentsApi;
