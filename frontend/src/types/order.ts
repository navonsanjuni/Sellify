import type { Customer } from './customer';
import type { OrderStatus, PaymentMethod, PaymentStatus } from '@/lib/constants';

export interface OrderItem {
  product: string;
  name: string;
  sku?: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface ShippingAddress {
  fullName?: string;
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  phone?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customer?: Customer | string | null;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  change: number;
  orderStatus: OrderStatus;
  orderType: 'pos' | 'online';
  shippingAddress?: ShippingAddress;
  stripeSessionId?: string;
  notes?: string;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
}
