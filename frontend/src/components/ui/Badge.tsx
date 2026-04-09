import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Tone =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

const toneClasses: Record<Tone, string> = {
  default: 'bg-surface-2 text-text border-border',
  primary: 'bg-primary-50 text-primary-700 border-primary-200 dark:bg-primary-950/40 dark:text-primary-300 dark:border-primary-900',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900',
  warning: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900',
  danger: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900',
  info: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-900',
  neutral: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700',
};

export function Badge({
  children,
  tone = 'default',
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide',
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Map order/payment status strings to a tone. */
export function statusTone(status: string): Tone {
  const s = status?.toLowerCase();
  if (['paid', 'completed', 'delivered', 'in stock', 'active'].includes(s)) return 'success';
  if (['pending', 'processing', 'partial', 'unpaid', 'low stock'].includes(s)) return 'warning';
  if (['failed', 'cancelled', 'out of stock', 'refunded', 'inactive'].includes(s)) return 'danger';
  if (['shipped', 'confirmed'].includes(s)) return 'info';
  return 'neutral';
}
