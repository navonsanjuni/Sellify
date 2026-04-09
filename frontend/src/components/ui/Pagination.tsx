import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Pagination({
  page,
  total,
  limit,
  onChange,
}: {
  page: number;
  total: number;
  limit: number;
  onChange: (page: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  if (totalPages <= 1) return null;

  const pages: number[] = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, start + 4);
  for (let i = start; i <= end; i++) pages.push(i);

  const btn =
    'inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-sm transition hover:bg-surface-2';

  return (
    <div className="flex items-center gap-1.5">
      <button
        className={cn(btn, 'disabled:opacity-50 disabled:hover:bg-transparent')}
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={cn(
            btn,
            p === page && 'bg-primary-600 border-primary-600 text-white hover:bg-primary-700',
          )}
        >
          {p}
        </button>
      ))}
      <button
        className={cn(btn, 'disabled:opacity-50 disabled:hover:bg-transparent')}
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
