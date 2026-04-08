import type { Category } from './category';

export interface Product {
  _id: string;
  name: string;
  description?: string;
  sku?: string;
  price: number;
  costPrice?: number;
  category?: Category | string;
  stock: number;
  lowStockThreshold?: number;
  unit?: string;
  images?: string[];
  isActive: boolean;
  isLowStock?: boolean;
  profitMargin?: number;
  createdAt?: string;
  updatedAt?: string;
}
