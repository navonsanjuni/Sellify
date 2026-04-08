import { useState } from 'react';
import { CreditCard, Search, Wallet, Activity } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/layout/StatCard';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Table, type Column } from '@/components/ui/Table';
import { Badge, statusTone } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { useListPaymentsQuery } from '@/api/paymentsApi';
import { formatCurrency, formatDate } from '@/lib/format';
import type { Payment } from '@/types/payment';

export function PaymentsList() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 12;
  const { data, isLoading } = useListPaymentsQuery({ search, page, limit });

  const totalRevenue = (data?.payments ?? [])
    .filter((p) => p.status === 'completed')
    .reduce((s, p) => s + p.amount, 0);
  const pending = (data?.payments ?? [])
    .filter((p) => p.status === 'pending')
    .reduce((s, p) => s + p.amount, 0);

  const columns: Column<Payment>[] = [
    {
      header: 'Transaction',
      cell: (p) => (
        <span className="font-medium text-text">#{p._id.slice(-6).toUpperCase()}</span>
      ),
    },
    {
      header: 'Order',
      cell: (p) => (typeof p.order === 'object' ? `#${p.order.orderNumber}` : '—'),
    },
    {
      header: 'Method',
      cell: (p) => (
        <div className="inline-flex items-center gap-2 capitalize">
          <CreditCard className="h-4 w-4 text-muted" />
          {p.method}
        </div>
      ),
    },
    {
      header: 'Amount',
      headerClassName: 'text-right',
      className: 'text-right font-semibold',
      cell: (p) => formatCurrency(p.amount),
    },
    { header: 'Status', cell: (p) => <Badge tone={statusTone(p.status)}>{p.status}</Badge> },
    { header: 'Date', cell: (p) => <span className="text-muted">{formatDate(p.createdAt)}</span> },
  ];

  return (
    <div>
      <PageHeader eyebrow="Financial Overview" title="Payments" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Revenue" value={formatCurrency(totalRevenue)} icon={<Wallet className="h-5 w-5" />} />
        <StatCard label="Processing" value={formatCurrency(pending)} icon={<Activity className="h-5 w-5" />} />
        <StatCard label="Transactions" value={String(data?.total ?? 0)} icon={<CreditCard className="h-5 w-5" />} />
      </div>

      <Card className="mt-6">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h3 className="text-base font-semibold text-text">Payment History</h3>
          <div className="w-full max-w-xs">
            <Input
              placeholder="Search transactions..."
              leftIcon={<Search className="h-4 w-4" />}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>
        <Table columns={columns} rows={data?.payments} loading={isLoading} rowKey={(p) => p._id} />
        <div className="flex items-center justify-between border-t border-border p-4 text-xs text-muted">
          <div>Showing {data?.payments?.length ?? 0} of {data?.total ?? 0} transactions</div>
          <Pagination page={page} total={data?.total ?? 0} limit={limit} onChange={setPage} />
        </div>
      </Card>
    </div>
  );
}
