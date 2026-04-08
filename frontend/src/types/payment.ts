import type { Order } from './order';

export interface Payment {
  _id: string;
  order: Order | string;
  amount: number;
  method: 'cash' | 'card' | 'online';
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  transactionId?: string;
  notes?: string;
  processedBy?: string;
  createdAt: string;
  updatedAt: string;
}
