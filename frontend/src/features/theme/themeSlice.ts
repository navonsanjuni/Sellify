import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { STORAGE_KEYS } from '@/lib/constants';
import { readJSON, writeJSON } from '@/lib/storage';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  mode: ThemeMode;
}

const persisted = readJSON<ThemeState>(STORAGE_KEYS.theme, { mode: 'system' });

const themeSlice = createSlice({
  name: 'theme',
  initialState: persisted,
  reducers: {
    setTheme(state, action: PayloadAction<ThemeMode>) {
      state.mode = action.payload;
      writeJSON(STORAGE_KEYS.theme, state);
    },
    toggleTheme(state) {
      state.mode = state.mode === 'dark' ? 'light' : 'dark';
      writeJSON(STORAGE_KEYS.theme, state);
    },
  },
});

export const { setTheme, toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
