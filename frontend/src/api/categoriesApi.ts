import { baseApi } from './baseApi';
import type { ApiResponse, Paginated } from '@/types/api';
import type { Category } from '@/types/category';

type CategoryList = Paginated<Category> & { categories: Category[] };

export const categoriesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listPublicCategories: build.query<{ categories: Category[] }, void>({
      query: () => '/categories/public',
      transformResponse: (r: ApiResponse<{ categories: Category[] }>) => r.data,
      providesTags: ['Category'],
    }),
    listCategories: build.query<CategoryList, { page?: number; limit?: number } | void>({
      query: (params) => ({ url: '/categories', params: params || undefined }),
      transformResponse: (r: ApiResponse<CategoryList>) => r.data,
      extraOptions: { realm: 'admin' },
      providesTags: ['Category'],
    }),
    getCategory: build.query<{ category: Category }, string>({
      query: (id) => `/categories/${id}`,
      transformResponse: (r: ApiResponse<{ category: Category }>) => r.data,
      extraOptions: { realm: 'admin' },
    }),
    createCategory: build.mutation<{ category: Category }, FormData>({
      query: (body) => ({ url: '/categories', method: 'POST', body }),
      transformResponse: (r: ApiResponse<{ category: Category }>) => r.data,
      extraOptions: { realm: 'admin' },
      invalidatesTags: ['Category'],
    }),
    updateCategory: build.mutation<{ category: Category }, { id: string; body: FormData }>({
      query: ({ id, body }) => ({ url: `/categories/${id}`, method: 'PUT', body }),
      transformResponse: (r: ApiResponse<{ category: Category }>) => r.data,
      extraOptions: { realm: 'admin' },
      invalidatesTags: ['Category'],
    }),
    deleteCategory: build.mutation<void, string>({
      query: (id) => ({ url: `/categories/${id}`, method: 'DELETE' }),
      extraOptions: { realm: 'admin' },
      invalidatesTags: ['Category'],
    }),
  }),
});

export const {
  useListPublicCategoriesQuery,
  useListCategoriesQuery,
  useGetCategoryQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoriesApi;
