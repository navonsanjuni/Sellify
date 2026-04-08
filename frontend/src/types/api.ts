export interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
}

export interface Paginated<T> {
  items?: T[];
  products?: T[];
  orders?: T[];
  customers?: T[];
  categories?: T[];
  users?: T[];
  payments?: T[];
  total: number;
  page: number;
  limit: number;
}
