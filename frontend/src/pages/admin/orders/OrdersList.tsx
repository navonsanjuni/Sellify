import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Table, type Column } from '@/components/ui/Table';
import { Badge, statusTone } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { useListOrdersQuery } from '@/api/ordersApi';
import { formatCurrency, formatDate } from '@/lib/format';
import {
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  type PaymentMethod,
  type PaymentStatus,
} from '@/lib/constants';
import type { Order } from '@/types/order';

export function OrdersList() {
  const [search, setSearch] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | ''>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const limit = 12;

  const { data, isLoading } = useListOrdersQuery({
    search: search || undefined,
    paymentStatus: paymentStatus || undefined,
    paymentMethod: paymentMethod || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    page,
    limit,
  });
  const navigate = useNavigate();

  const columns: Column<Order>[] = [
    { header: 'Order ID', cell: (o) => <span className="font-medium text-text">#{o.orderNumber}</span> },
    {
      header: 'Customer',
      cell: (o) => (typeof o.customer === 'object' && o.customer ? o.customer.name : 'Walk-in'),
    },
    { header: 'Date', cell: (o) => <span className="text-muted">{formatDate(o.createdAt)}</span> },
    {
      header: 'Status',
      cell: (o) => <Badge tone={statusTone(o.orderStatus)}>{o.orderStatus}</Badge>,
    },
    {
      header: 'Payment',
      cell: (o) => <Badge tone={statusTone(o.paymentStatus)}>{o.paymentStatus}</Badge>,
    },
    {
      header: 'Total',
      headerClassName: 'text-right',
      className: 'text-right font-semibold',
      cell: (o) => formatCurrency(o.total),
    },
  ];

  const resetPage = () => setPage(1);

  return (
    <div>
      <PageHeader
        title="Orders"
        action={
          <Link to="/admin/orders/new">
            <Button leftIcon={<Plus className="h-4 w-4" />}>New POS Order</Button>
          </Link>
        }
      />
      <Card>
        <div className="grid grid-cols-1 gap-3 border-b border-border p-4 md:grid-cols-5">
          <Input
            placeholder="Search #order..."
            leftIcon={<Search className="h-4 w-4" />}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              resetPage();
            }}
          />
          <Select
            value={paymentStatus}
            onChange={(e) => {
              setPaymentStatus(e.target.value as PaymentStatus | '');
              resetPage();
            }}
          >
            <option value="">All payment status</option>
            {PAYMENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
          <Select
            value={paymentMethod}
            onChange={(e) => {
              setPaymentMethod(e.target.value as PaymentMethod | '');
              resetPage();
            }}
          >
            <option value="">All methods</option>
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
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
        <Table
          columns={columns}
          rows={data?.orders}
          loading={isLoading}
          rowKey={(o) => o._id}
          onRowClick={(o) => navigate(`/admin/orders/${o._id}`)}
        />
        <div className="flex items-center justify-between border-t border-border p-4 text-xs text-muted">
          <div>
            Showing {data?.orders?.length ?? 0} of {data?.total ?? 0} orders
          </div>
          <Pagination page={page} total={data?.total ?? 0} limit={limit} onChange={setPage} />
        </div>
      </Card>
    </div>
  );
}
