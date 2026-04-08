import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Spinner } from './Spinner';
import { EmptyState } from './EmptyState';

export interface Column<T> {
  header: ReactNode;
  accessor?: keyof T;
  cell?: (row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  rows: T[] | undefined;
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
}

export function Table<T>({
  columns,
  rows,
  loading,
  emptyTitle = 'No records',
  emptyDescription = 'There is nothing to show here yet.',
  rowKey,
  onRowClick,
}: TableProps<T>) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (!rows || rows.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {columns.map((c, i) => (
              <th
                key={i}
                className={cn(
                  'px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted',
                  c.headerClassName,
                )}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              onClick={() => onRowClick?.(row)}
              className={cn(
                'border-b border-border last:border-b-0 transition-colors',
                onRowClick && 'cursor-pointer hover:bg-surface-2',
              )}
            >
              {columns.map((c, i) => (
                <td key={i} className={cn('px-5 py-4 text-text', c.className)}>
                  {c.cell
                    ? c.cell(row)
                    : c.accessor
                      ? String(row[c.accessor] ?? '—')
                      : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
