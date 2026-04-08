import { baseApi } from './baseApi';
import type { ApiResponse } from '@/types/api';
import type { Order } from '@/types/order';
import type { ShippingAddress } from '@/types/order';

interface CheckoutItem {
  product: string;
  quantity: number;
}

export const checkoutApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createCheckoutSession: build.mutation<
      { sessionId: string; url: string },
      { items: CheckoutItem[]; shippingAddress: ShippingAddress }
    >({
      query: (body) => ({ url: '/checkout/create-session', method: 'POST', body }),
      transformResponse: (r: ApiResponse<{ sessionId: string; url: string }>) => r.data,
      extraOptions: { realm: 'customer' },
    }),
    getCheckoutSession: build.query<{ status: string; order?: Order }, string>({
      query: (sessionId) => `/checkout/session/${sessionId}`,
      transformResponse: (r: ApiResponse<{ status: string; order?: Order }>) => r.data,
      extraOptions: { realm: 'customer' },
    }),
  }),
});

export const { useCreateCheckoutSessionMutation, useGetCheckoutSessionQuery } = checkoutApi;
