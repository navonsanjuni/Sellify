import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { TrendingDown, TrendingUp } from 'lucide-react';

export function StatCard({
  label,
  value,
  delta,
  icon,
}: {
  label: string;
  value: ReactNode;
  delta?: number;
  icon?: ReactNode;
}) {
  const positive = (delta ?? 0) >= 0;
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400">
          {icon}
        </div>
        {typeof delta === 'number' && (
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
              positive
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300',
            )}
          >
            {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {positive ? '+' : ''}
            {delta.toFixed(1)}%
          </span>
        )}
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-1 text-2xl font-bold text-text">{value}</p>
    </div>
  );
}
