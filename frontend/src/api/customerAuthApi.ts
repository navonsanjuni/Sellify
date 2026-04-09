import { baseApi } from './baseApi';
import type { ApiResponse } from '@/types/api';
import type { Customer } from '@/types/customer';

interface CustomerLoginResponse {
  customer: Customer;
  accessToken: string;
  refreshToken: string;
}

export const customerAuthApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    customerLogin: build.mutation<CustomerLoginResponse, { email: string; password: string }>({
      query: (body) => ({ url: '/customers/auth/login', method: 'POST', body }),
      transformResponse: (r: ApiResponse<CustomerLoginResponse>) => r.data,
      extraOptions: { realm: 'public' },
    }),
    customerRegister: build.mutation<
      CustomerLoginResponse,
      { name: string; email: string; password: string; phone?: string }
    >({
      query: (body) => ({ url: '/customers/auth/register', method: 'POST', body }),
      transformResponse: (r: ApiResponse<CustomerLoginResponse>) => r.data,
      extraOptions: { realm: 'public' },
    }),
    customerLogoutApi: build.mutation<void, void>({
      query: () => ({ url: '/customers/auth/logout', method: 'POST' }),
      extraOptions: { realm: 'customer' },
    }),
    getCustomerMe: build.query<{ customer: Customer }, void>({
      query: () => '/customers/auth/me',
      transformResponse: (r: ApiResponse<{ customer: Customer }>) => r.data,
      extraOptions: { realm: 'customer' },
      providesTags: ['CustomerMe'],
    }),
    updateCustomerProfile: build.mutation<
      { customer: Customer },
      Partial<Customer>
    >({
      query: (body) => ({ url: '/customers/auth/profile', method: 'PUT', body }),
      transformResponse: (r: ApiResponse<{ customer: Customer }>) => r.data,
      extraOptions: { realm: 'customer' },
      invalidatesTags: ['CustomerMe'],
    }),
    changeCustomerPassword: build.mutation<
      { message: string },
      { currentPassword: string; newPassword: string }
    >({
      query: (body) => ({
        url: '/customers/auth/change-password',
        method: 'PUT',
        body,
      }),
      transformResponse: (r: ApiResponse<{ message: string }>) => r.data,
      extraOptions: { realm: 'customer' },
    }),
  }),
});

export const {
  useCustomerLoginMutation,
  useCustomerRegisterMutation,
  useCustomerLogoutApiMutation,
  useGetCustomerMeQuery,
  useUpdateCustomerProfileMutation,
  useChangeCustomerPasswordMutation,
} = customerAuthApi;
