import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { STORAGE_KEYS } from '@/lib/constants';
import { readJSON, removeKey, writeJSON } from '@/lib/storage';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
  image?: string;
  stock?: number;
}

interface CartState {
  items: CartItem[];
}

const persisted = readJSON<CartState>(STORAGE_KEYS.cart, { items: [] });

const cartSlice = createSlice({
  name: 'cart',
  initialState: persisted,
  reducers: {
    addToCart(state, action: PayloadAction<CartItem>) {
      const existing = state.items.find((i) => i.productId === action.payload.productId);
      const max = action.payload.stock ?? Infinity;
      if (existing) {
        existing.qty = Math.min(max, existing.qty + action.payload.qty);
      } else {
        state.items.push({
          ...action.payload,
          qty: Math.min(max, action.payload.qty),
        });
      }
      writeJSON(STORAGE_KEYS.cart, state);
    },
    updateQty(state, action: PayloadAction<{ productId: string; qty: number }>) {
      const item = state.items.find((i) => i.productId === action.payload.productId);
      if (item) {
        const max = item.stock ?? Infinity;
        item.qty = Math.max(1, Math.min(max, action.payload.qty));
        writeJSON(STORAGE_KEYS.cart, state);
      }
    },
    removeFromCart(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.productId !== action.payload);
      writeJSON(STORAGE_KEYS.cart, state);
    },
    clearCart(state) {
      state.items = [];
      removeKey(STORAGE_KEYS.cart);
    },
  },
});

export const { addToCart, updateQty, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;

export const selectCartCount = (state: { cart: CartState }) =>
  state.cart.items.reduce((sum, i) => sum + i.qty, 0);
export const selectCartTotal = (state: { cart: CartState }) =>
  state.cart.items.reduce((sum, i) => sum + i.qty * i.price, 0);
