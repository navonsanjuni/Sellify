import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export function toImageUrl(path?: string | null): string {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  const clean = path.replace(/^\/+/, '');
  return `${API_BASE}/${clean}`;
}

export function getApiBase() {
  return API_BASE;
}
