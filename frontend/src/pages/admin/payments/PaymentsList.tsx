import { useState } from 'react';
import { CreditCard } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Table, type Column } from '@/components/ui/Table';
import { Badge, statusTone } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { useListPaymentsQuery } from '@/api/paymentsApi';
import { formatCurrency, formatDate } from '@/lib/format';
import type { Payment } from '@/types/payment';

const METHODS = ['cash', 'card', 'transfer', 'stripe'] as const;
const STATUSES = ['completed', 'pending', 'failed', 'refunded'] as const;

export function PaymentsList() {
  const [method, setMethod] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const limit = 12;

  const { data, isLoading } = useListPaymentsQuery({
    method: method || undefined,
    status: status || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    page,
    limit,
  });

  const resetPage = () => setPage(1);

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
      <PageHeader
        eyebrow="Financial Overview"
        title="Payments"
        description={`${data?.total ?? 0} transactions on record`}
      />

      <Card>
        <div className="grid grid-cols-1 gap-3 border-b border-border p-4 md:grid-cols-4">
          <Select
            value={method}
            onChange={(e) => {
              setMethod(e.target.value);
              resetPage();
            }}
          >
            <option value="">All methods</option>
            {METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>
          <Select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              resetPage();
            }}
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              resetPage();
            }}
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              resetPage();
            }}
          />
        </div>
        <Table columns={columns} rows={data?.payments} loading={isLoading} rowKey={(p) => p._id} />
        <div className="flex items-center justify-between border-t border-border p-4 text-xs text-muted">
          <div>
            Showing {data?.payments?.length ?? 0} of {data?.total ?? 0} transactions
          </div>
          <Pagination page={page} total={data?.total ?? 0} limit={limit} onChange={setPage} />
        </div>
      </Card>
    </div>
  );
}
