export const STORAGE_KEYS = {
  adminAuth: 'sellify_admin_auth',
  customerAuth: 'sellify_customer_auth',
  cart: 'sellify_cart',
  theme: 'sellify_theme',
} as const;

export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

/** Mirrors the backend state machine. Used to limit the status dropdown. */
const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

export function nextOrderStatuses(current: OrderStatus): OrderStatus[] {
  return [current, ...ORDER_STATUS_TRANSITIONS[current]];
}

export const PAYMENT_STATUSES = ['paid', 'unpaid', 'partial'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_METHODS = ['cash', 'card', 'online', 'none'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const USER_ROLES = ['admin', 'staff'] as const;
export type UserRole = (typeof USER_ROLES)[number];
