import { baseApi } from './baseApi';
import type { ApiResponse } from '@/types/api';
import type { User } from '@/types/user';

interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    adminLogin: build.mutation<LoginResponse, { email: string; password: string }>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      transformResponse: (r: ApiResponse<LoginResponse>) => r.data,
      extraOptions: { realm: 'public' },
    }),
    adminRegister: build.mutation<
      { user: User },
      { name: string; email: string; password: string; role?: 'admin' | 'staff' }
    >({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
      transformResponse: (r: ApiResponse<{ user: User }>) => r.data,
      extraOptions: { realm: 'admin' },
      invalidatesTags: ['User'],
    }),
    adminLogout: build.mutation<void, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
      extraOptions: { realm: 'admin' },
    }),
    getMe: build.query<{ user: User }, void>({
      query: () => '/auth/me',
      transformResponse: (r: ApiResponse<{ user: User }>) => r.data,
      extraOptions: { realm: 'admin' },
      providesTags: ['Me'],
    }),
  }),
});

export const {
  useAdminLoginMutation,
  useAdminRegisterMutation,
  useAdminLogoutMutation,
  useGetMeQuery,
} = authApi;
