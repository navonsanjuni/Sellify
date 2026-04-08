export function formatCurrency(value: number | undefined | null, currency = 'USD') {
  const n = typeof value === 'number' ? value : 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(n);
}

export function formatNumber(value: number | undefined | null) {
  return new Intl.NumberFormat('en-US').format(value ?? 0);
}

export function formatDate(value?: string | Date | null) {
  if (!value) return '—';
  const d = typeof value === 'string' ? new Date(value) : value;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateTime(value?: string | Date | null) {
  if (!value) return '—';
  const d = typeof value === 'string' ? new Date(value) : value;
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
