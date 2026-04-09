import { baseApi } from './baseApi';
import type { ApiResponse, Paginated } from '@/types/api';
import type { Customer } from '@/types/customer';

type CustomerList = Paginated<Customer> & { customers: Customer[] };

export const customersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listCustomers: build.query<
      CustomerList,
      { page?: number; limit?: number; search?: string } | void
    >({
      query: (params) => ({ url: '/customers', params: params || undefined }),
      transformResponse: (r: ApiResponse<CustomerList>) => r.data,
      extraOptions: { realm: 'admin' },
      providesTags: ['Customer'],
    }),
    getCustomer: build.query<{ customer: Customer }, string>({
      query: (id) => `/customers/${id}`,
      transformResponse: (r: ApiResponse<{ customer: Customer }>) => r.data,
      extraOptions: { realm: 'admin' },
      providesTags: (_r, _e, id) => [{ type: 'Customer', id }],
    }),
    createCustomer: build.mutation<{ customer: Customer }, Partial<Customer>>({
      query: (body) => ({ url: '/customers', method: 'POST', body }),
      transformResponse: (r: ApiResponse<{ customer: Customer }>) => r.data,
      extraOptions: { realm: 'admin' },
      invalidatesTags: ['Customer'],
    }),
    updateCustomer: build.mutation<
      { customer: Customer },
      { id: string; body: Partial<Customer> }
    >({
      query: ({ id, body }) => ({ url: `/customers/${id}`, method: 'PUT', body }),
      transformResponse: (r: ApiResponse<{ customer: Customer }>) => r.data,
      extraOptions: { realm: 'admin' },
      invalidatesTags: ['Customer'],
    }),
    deleteCustomer: build.mutation<void, string>({
      query: (id) => ({ url: `/customers/${id}`, method: 'DELETE' }),
      extraOptions: { realm: 'admin' },
      invalidatesTags: ['Customer'],
    }),
  }),
});

export const {
  useListCustomersQuery,
  useGetCustomerQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
} = customersApi;
