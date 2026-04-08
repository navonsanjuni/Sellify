import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  CartesianGrid,
  YAxis,
} from 'recharts';
import { DollarSign, Truck, Users, Wallet, Plus, Eye, ShieldCheck, AlertTriangle } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/layout/StatCard';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, statusTone } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { useGetDashboardStatsQuery } from '@/api/dashboardApi';
import { formatCurrency, formatDate, formatNumber } from '@/lib/format';

export function Overview() {
  const { data, isLoading } = useGetDashboardStatsQuery();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const salesByDay = (data?.salesByDay ?? []).map((d) => ({
    label: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    sales: d.sales,
  }));

  return (
    <div>
      <PageHeader
        eyebrow="Performance Hub"
        title="Executive Dashboard"
        action={
          <>
            <Link to="/admin/products/new">
              <Button leftIcon={<Plus className="h-4 w-4" />}>Add Product</Button>
            </Link>
            <Link to="/admin/orders">
              <Button variant="outline" leftIcon={<Eye className="h-4 w-4" />}>
                View Orders
              </Button>
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Today Sales"
          value={formatCurrency(data?.todaySales.total)}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <StatCard
          label="Today Orders"
          value={formatNumber(data?.todaySales.orders)}
          icon={<Truck className="h-5 w-5" />}
        />
        <StatCard
          label="Total Customers"
          value={formatNumber(data?.totalCustomers)}
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          label="Net Revenue"
          value={formatCurrency(data?.totalRevenue)}
          icon={<Wallet className="h-5 w-5" />}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Revenue Growth"
            subtitle="Daily sales for the last 7 days"
            action={<Badge tone="primary">Last 7 Days</Badge>}
          />
          <CardBody>
            <div className="h-64 w-full">
              <ResponsiveContainer>
                <BarChart data={salesByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="label"
                    stroke="rgb(var(--muted))"
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                  />
                  <YAxis
                    stroke="rgb(var(--muted))"
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'rgb(var(--surface))',
                      border: '1px solid rgb(var(--border))',
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    formatter={(v: number) => formatCurrency(v)}
                  />
                  <Bar dataKey="sales" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Inventory Status" />
          <CardBody className="space-y-4">
            {(data?.lowStockProducts ?? []).slice(0, 3).map((p, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-text">Low Stock Alert</p>
                  <p className="text-xs text-muted">
                    {p.name} ({p.stock} units left)
                  </p>
                </div>
              </div>
            ))}
            {(!data?.lowStockProducts || data.lowStockProducts.length === 0) && (
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text">All Good</p>
                  <p className="text-xs text-muted">No products are below threshold.</p>
                </div>
              </div>
            )}
            <Link to="/admin/products" className="block">
              <Button variant="outline" fullWidth>
                View Full Logs
              </Button>
            </Link>
          </CardBody>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader title="Recent Orders" action={<Link to="/admin/orders" className="text-sm font-semibold text-primary-600 hover:underline">View all →</Link>} />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[11px] font-semibold uppercase tracking-wider text-muted">
                <th className="px-5 py-3">Order ID</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {(data?.recentOrders ?? []).map((o, i) => (
                <tr key={i} className="border-b border-border last:border-b-0">
                  <td className="px-5 py-4 font-medium text-text">#{o.orderNumber}</td>
                  <td className="px-5 py-4 text-text">{o.customer?.name || 'Walk-in'}</td>
                  <td className="px-5 py-4 text-muted">{formatDate(o.createdAt)}</td>
                  <td className="px-5 py-4">
                    <Badge tone={statusTone(o.paymentStatus)}>{o.paymentStatus}</Badge>
                  </td>
                  <td className="px-5 py-4 text-right font-semibold text-text">
                    {formatCurrency(o.total)}
                  </td>
                </tr>
              ))}
              {(!data?.recentOrders || data.recentOrders.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-muted">
                    No recent orders.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
