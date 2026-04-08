import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '@/types/user';
import { STORAGE_KEYS } from '@/lib/constants';
import { readJSON, removeKey, writeJSON } from '@/lib/storage';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
}

const persisted = readJSON<AuthState>(STORAGE_KEYS.adminAuth, {
  user: null,
  accessToken: null,
  refreshToken: null,
});

const authSlice = createSlice({
  name: 'auth',
  initialState: persisted,
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{ user: User; accessToken: string; refreshToken: string }>,
    ) {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      writeJSON(STORAGE_KEYS.adminAuth, state);
    },
    setAccessToken(state, action: PayloadAction<string>) {
      state.accessToken = action.payload;
      writeJSON(STORAGE_KEYS.adminAuth, state);
    },
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
      writeJSON(STORAGE_KEYS.adminAuth, state);
    },
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      removeKey(STORAGE_KEYS.adminAuth);
    },
  },
});

export const { setCredentials, setAccessToken, setUser, logout } = authSlice.actions;
export default authSlice.reducer;
