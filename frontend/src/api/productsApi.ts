import { baseApi } from './baseApi';
import type { ApiResponse, Paginated } from '@/types/api';
import type { Product } from '@/types/product';

interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  lowStock?: 'true';
  minPrice?: number;
  maxPrice?: number;
  sort?: 'price-low' | 'price-high' | 'newest';
}

type ProductList = Paginated<Product> & { products: Product[] };

export const productsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Public storefront
    listPublicProducts: build.query<ProductList, ListParams>({
      query: (params) => ({ url: '/products/public', params }),
      transformResponse: (r: ApiResponse<ProductList>) => r.data,
      providesTags: ['Product'],
    }),
    getFeaturedProducts: build.query<{ products: Product[] }, { limit?: number } | void>({
      query: (params) => ({ url: '/products/public/featured', params: params || undefined }),
      transformResponse: (r: ApiResponse<{ products: Product[] }>) => r.data,
      providesTags: ['Product'],
    }),
    getPublicProduct: build.query<{ product: Product }, string>({
      query: (id) => `/products/public/${id}`,
      transformResponse: (r: ApiResponse<{ product: Product }>) => r.data,
      providesTags: (_r, _e, id) => [{ type: 'Product', id }],
    }),

    // Admin
    listProducts: build.query<ProductList, ListParams>({
      query: (params) => ({ url: '/products', params }),
      transformResponse: (r: ApiResponse<ProductList>) => r.data,
      extraOptions: { realm: 'admin' },
      providesTags: ['Product'],
    }),
    getProduct: build.query<{ product: Product }, string>({
      query: (id) => `/products/${id}`,
      transformResponse: (r: ApiResponse<{ product: Product }>) => r.data,
      extraOptions: { realm: 'admin' },
      providesTags: (_r, _e, id) => [{ type: 'Product', id }],
    }),
    createProduct: build.mutation<{ product: Product }, FormData>({
      query: (body) => ({ url: '/products', method: 'POST', body }),
      transformResponse: (r: ApiResponse<{ product: Product }>) => r.data,
      extraOptions: { realm: 'admin' },
      invalidatesTags: ['Product', 'Dashboard'],
    }),
    updateProduct: build.mutation<{ product: Product }, { id: string; body: FormData }>({
      query: ({ id, body }) => ({ url: `/products/${id}`, method: 'PUT', body }),
      transformResponse: (r: ApiResponse<{ product: Product }>) => r.data,
      extraOptions: { realm: 'admin' },
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Product', id }, 'Product'],
    }),
    deleteProduct: build.mutation<void, string>({
      query: (id) => ({ url: `/products/${id}`, method: 'DELETE' }),
      extraOptions: { realm: 'admin' },
      invalidatesTags: ['Product'],
    }),
    adjustStock: build.mutation<{ product: Product }, { id: string; quantity: number }>({
      query: ({ id, quantity }) => ({
        url: `/products/${id}/stock`,
        method: 'PATCH',
        body: { quantity },
      }),
      transformResponse: (r: ApiResponse<{ product: Product }>) => r.data,
      extraOptions: { realm: 'admin' },
      invalidatesTags: ['Product', 'Dashboard'],
    }),
  }),
});

export const {
  useListPublicProductsQuery,
  useGetFeaturedProductsQuery,
  useGetPublicProductQuery,
  useListProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useAdjustStockMutation,
} = productsApi;
