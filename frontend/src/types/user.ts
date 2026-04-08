export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff';
  isActive: boolean;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}
