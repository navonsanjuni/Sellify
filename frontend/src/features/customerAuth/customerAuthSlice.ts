import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Customer } from '@/types/customer';
import { STORAGE_KEYS } from '@/lib/constants';
import { readJSON, removeKey, writeJSON } from '@/lib/storage';

interface CustomerAuthState {
  customer: Customer | null;
  accessToken: string | null;
  refreshToken: string | null;
}

const persisted = readJSON<CustomerAuthState>(STORAGE_KEYS.customerAuth, {
  customer: null,
  accessToken: null,
  refreshToken: null,
});

const customerAuthSlice = createSlice({
  name: 'customerAuth',
  initialState: persisted,
  reducers: {
    setCustomerCredentials(
      state,
      action: PayloadAction<{ customer: Customer; accessToken: string; refreshToken: string }>,
    ) {
      state.customer = action.payload.customer;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      writeJSON(STORAGE_KEYS.customerAuth, state);
    },
    setCustomerAccessToken(state, action: PayloadAction<string>) {
      state.accessToken = action.payload;
      writeJSON(STORAGE_KEYS.customerAuth, state);
    },
    setCustomer(state, action: PayloadAction<Customer>) {
      state.customer = action.payload;
      writeJSON(STORAGE_KEYS.customerAuth, state);
    },
    customerLogout(state) {
      state.customer = null;
      state.accessToken = null;
      state.refreshToken = null;
      removeKey(STORAGE_KEYS.customerAuth);
    },
  },
});

export const {
  setCustomerCredentials,
  setCustomerAccessToken,
  setCustomer,
  customerLogout,
} = customerAuthSlice.actions;
export default customerAuthSlice.reducer;
