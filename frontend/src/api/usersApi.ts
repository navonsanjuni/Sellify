import { baseApi } from './baseApi';
import type { ApiResponse, Paginated } from '@/types/api';
import type { User } from '@/types/user';

type UserList = Paginated<User> & { users: User[] };

export const usersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listUsers: build.query<
      UserList,
      { page?: number; limit?: number; search?: string; role?: string } | void
    >({
      query: (params) => ({ url: '/users', params: params || undefined }),
      transformResponse: (r: ApiResponse<UserList>) => r.data,
      extraOptions: { realm: 'admin' },
      providesTags: ['User'],
    }),
    getUser: build.query<{ user: User }, string>({
      query: (id) => `/users/${id}`,
      transformResponse: (r: ApiResponse<{ user: User }>) => r.data,
      extraOptions: { realm: 'admin' },
    }),
    updateUser: build.mutation<{ user: User }, { id: string; body: Partial<User> }>({
      query: ({ id, body }) => ({ url: `/users/${id}`, method: 'PUT', body }),
      transformResponse: (r: ApiResponse<{ user: User }>) => r.data,
      extraOptions: { realm: 'admin' },
      invalidatesTags: ['User', 'Me'],
    }),
    deleteUser: build.mutation<void, string>({
      query: (id) => ({ url: `/users/${id}`, method: 'DELETE' }),
      extraOptions: { realm: 'admin' },
      invalidatesTags: ['User'],
    }),
    changePassword: build.mutation<
      void,
      { id: string; currentPassword: string; newPassword: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/users/${id}/change-password`,
        method: 'PUT',
        body,
      }),
      extraOptions: { realm: 'admin' },
    }),
  }),
});

export const {
  useListUsersQuery,
  useGetUserQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useChangePasswordMutation,
} = usersApi;
