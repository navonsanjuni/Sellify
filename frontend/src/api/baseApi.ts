import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/app/store';
import { getApiBase } from '@/lib/utils';
import { logout, setAccessToken } from '@/features/auth/authSlice';
import { customerLogout, setCustomerAccessToken } from '@/features/customerAuth/customerAuthSlice';

export type Realm = 'admin' | 'customer' | 'public';

export interface ExtraOptions {
  realm?: Realm;
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: `${getApiBase()}/api`,
});

function withAuthHeader(args: string | FetchArgs, token: string | null): FetchArgs {
  const base: FetchArgs = typeof args === 'string' ? { url: args } : { ...args };
  if (token) {
    base.headers = {
      ...(base.headers as Record<string, string> | undefined),
      Authorization: `Bearer ${token}`,
    };
  }
  return base;
}

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError,
  ExtraOptions
> = async (args, api, extraOptions) => {
  const realm: Realm = extraOptions?.realm ?? 'public';
  const state = api.getState() as RootState;

  const token =
    realm === 'admin'
      ? state.auth.accessToken
      : realm === 'customer'
        ? state.customerAuth.accessToken
        : null;

  let result = await rawBaseQuery(withAuthHeader(args, token), api, extraOptions);

  if (result.error && result.error.status === 401 && realm !== 'public') {
    const refreshToken =
      realm === 'admin' ? state.auth.refreshToken : state.customerAuth.refreshToken;

    if (refreshToken) {
      const refreshUrl = realm === 'admin' ? '/auth/refresh' : '/customers/auth/refresh';
      const refreshResult = await rawBaseQuery(
        { url: refreshUrl, method: 'POST', body: { refreshToken } },
        api,
        extraOptions,
      );
      const refreshData = (refreshResult.data as { data?: { accessToken?: string } })?.data;
      if (refreshData?.accessToken) {
        if (realm === 'admin') {
          api.dispatch(setAccessToken(refreshData.accessToken));
        } else {
          api.dispatch(setCustomerAccessToken(refreshData.accessToken));
        }
        result = await rawBaseQuery(
          withAuthHeader(args, refreshData.accessToken),
          api,
          extraOptions,
        );
      } else {
        if (realm === 'admin') api.dispatch(logout());
        else api.dispatch(customerLogout());
      }
    } else {
      if (realm === 'admin') api.dispatch(logout());
      else api.dispatch(customerLogout());
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'Product',
    'Category',
    'Order',
    'Customer',
    'Payment',
    'User',
    'Dashboard',
    'Me',
    'CustomerMe',
  ],
  endpoints: () => ({}),
});
