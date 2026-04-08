import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Badge, statusTone } from '@/components/ui/Badge';
import { useGetMyOrderQuery } from '@/api/ordersApi';
import { formatCurrency, formatDateTime } from '@/lib/format';

export function AccountOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useGetMyOrderQuery(id!);

  if (isLoading || !data?.order) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const order = data.order;

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate(-1)}>
        Back
      </Button>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Order #{order.orderNumber}</h1>
        <Badge tone={statusTone(order.orderStatus)}>{order.orderStatus}</Badge>
      </div>
      <p className="text-sm text-muted">{formatDateTime(order.createdAt)}</p>

      <Card className="mt-6">
        <CardHeader title="Items" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <tbody>
              {order.items.map((it, i) => (
                <tr key={i} className="border-b border-border last:border-b-0">
                  <td className="px-5 py-4">
                    <div className="font-medium text-text">{it.name}</div>
                    <div className="text-xs text-muted">Qty {it.quantity}</div>
                  </td>
                  <td className="px-5 py-4 text-right font-semibold">{formatCurrency(it.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <CardBody className="space-y-2 border-t border-border">
          <div className="flex justify-between text-sm text-muted">
            <span>Subtotal</span>
            <span className="text-text">{formatCurrency(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-muted">
            <span>Tax</span>
            <span className="text-text">{formatCurrency(order.tax)}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-3 text-base font-bold">
            <span>Total</span>
            <span className="text-primary-600">{formatCurrency(order.total)}</span>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
