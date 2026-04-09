import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Table, type Column } from '@/components/ui/Table';
import { Badge, statusTone } from '@/components/ui/Badge';
import { useListMyOrdersQuery } from '@/api/ordersApi';
import { formatCurrency, formatDate } from '@/lib/format';
import { AccountTabs } from './_AccountTabs';
import type { Order } from '@/types/order';

export function AccountOrders() {
  const { data, isLoading } = useListMyOrdersQuery({ limit: 50 });
  const navigate = useNavigate();

  const columns: Column<Order>[] = [
    { header: 'Order', cell: (o) => <span className="font-medium text-text">#{o.orderNumber}</span> },
    { header: 'Date', cell: (o) => <span className="text-muted">{formatDate(o.createdAt)}</span> },
    {
      header: 'Status',
      cell: (o) => <Badge tone={statusTone(o.orderStatus)}>{o.orderStatus}</Badge>,
    },
    {
      header: 'Total',
      headerClassName: 'text-right',
      className: 'text-right font-semibold',
      cell: (o) => formatCurrency(o.total),
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-3xl font-bold tracking-tight">My Account</h1>
      <AccountTabs />
      <Card className="mt-6">
        <Table
          columns={columns}
          rows={data?.orders}
          loading={isLoading}
          rowKey={(o) => o._id}
          onRowClick={(o) => navigate(`/account/orders/${o._id}`)}
          emptyTitle="No orders yet"
          emptyDescription="When you place an order it will appear here."
        />
      </Card>
    </div>
  );
}
