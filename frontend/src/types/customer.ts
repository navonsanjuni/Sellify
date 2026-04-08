export interface CustomerAddress {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export interface Customer {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: CustomerAddress;
  totalOrders?: number;
  totalSpent?: number;
  notes?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
