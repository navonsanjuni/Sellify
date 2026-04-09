import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, statusTone } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import {
  useGetOrderQuery,
  useUpdateOrderStatusMutation,
} from '@/api/ordersApi';
import {
  useListPaymentsForOrderQuery,
  useRecordPaymentMutation,
} from '@/api/paymentsApi';
import { nextOrderStatuses, type OrderStatus } from '@/lib/constants';
import { formatCurrency, formatDateTime } from '@/lib/format';

export function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useGetOrderQuery(id!);
  const { data: paymentsData } = useListPaymentsForOrderQuery(id!, { skip: !id });
  const [updateStatus] = useUpdateOrderStatusMutation();
  const [recordPayment, { isLoading: recording }] = useRecordPaymentMutation();

  const [payOpen, setPayOpen] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState<'cash' | 'card' | 'transfer' | 'stripe'>('cash');
  const [payNotes, setPayNotes] = useState('');

  if (isLoading || !data?.order) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const order = data.order;
  const customer = typeof order.customer === 'object' ? order.customer : null;
  const remaining = Math.max(0, order.total - (order.amountPaid || 0));
  const allowedStatuses = nextOrderStatuses(order.orderStatus);

  const submitRecordPayment = async () => {
    const amt = Number(payAmount);
    if (!amt || amt <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    try {
      await recordPayment({
        orderId: order._id,
        amount: amt,
        method: payMethod,
        notes: payNotes || undefined,
      }).unwrap();
      toast.success('Payment recorded');
      setPayOpen(false);
      setPayAmount('');
      setPayNotes('');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to record payment');
    }
  };

  return (
    <div>
      <PageHeader
        title={`Order #${order.orderNumber}`}
        description={formatDateTime(order.createdAt)}
        action={
          <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate(-1)}>
            Back
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Items" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] font-semibold uppercase tracking-wider text-muted">
                  <th className="px-5 py-3">Item</th>
                  <th className="px-5 py-3">Qty</th>
                  <th className="px-5 py-3 text-right">Price</th>
                  <th className="px-5 py-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((it, i) => (
                  <tr key={i} className="border-b border-border last:border-b-0">
                    <td className="px-5 py-4">
                      <div className="font-medium text-text">{it.name}</div>
                      {it.sku && <div className="text-xs text-muted">SKU-{it.sku}</div>}
                    </td>
                    <td className="px-5 py-4">{it.quantity}</td>
                    <td className="px-5 py-4 text-right">{formatCurrency(it.price)}</td>
                    <td className="px-5 py-4 text-right font-semibold">{formatCurrency(it.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <CardBody className="space-y-2 border-t border-border">
            <div className="flex justify-between text-sm">
              <span className="text-muted">Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Discount</span>
              <span>-{formatCurrency(order.discount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Tax</span>
              <span>{formatCurrency(order.tax)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-3 text-base font-bold">
              <span>Total</span>
              <span className="text-primary-600">{formatCurrency(order.total)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Paid</span>
              <span>{formatCurrency(order.amountPaid)}</span>
            </div>
            <div className="flex justify-between text-sm font-semibold">
              <span className="text-muted">Balance</span>
              <span className={remaining > 0 ? 'text-amber-600' : 'text-emerald-600'}>
                {formatCurrency(remaining)}
              </span>
            </div>
          </CardBody>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Customer" />
            <CardBody>
              {customer ? (
                <>
                  <p className="font-semibold text-text">{customer.name}</p>
                  <p className="text-sm text-muted">{customer.email}</p>
                  <p className="text-sm text-muted">{customer.phone}</p>
                </>
              ) : (
                <p className="text-sm text-muted">Walk-in customer</p>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Status" />
            <CardBody className="space-y-4">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted">Order Status</p>
                <div className="mb-2"><Badge tone={statusTone(order.orderStatus)}>{order.orderStatus}</Badge></div>
                <Select
                  value={order.orderStatus}
                  onChange={async (e) => {
                    const next = e.target.value as OrderStatus;
                    if (next === order.orderStatus) return;
                    try {
                      await updateStatus({ id: order._id, orderStatus: next }).unwrap();
                      toast.success('Status updated');
                    } catch (err: any) {
                      toast.error(err?.data?.message || 'Update failed');
                    }
                  }}
                  disabled={allowedStatuses.length <= 1}
                >
                  {allowedStatuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted">Payment</p>
                <div className="mb-2"><Badge tone={statusTone(order.paymentStatus)}>{order.paymentStatus}</Badge></div>
                <Button
                  fullWidth
                  size="sm"
                  leftIcon={<Plus className="h-4 w-4" />}
                  onClick={() => {
                    setPayAmount(remaining > 0 ? String(remaining) : '');
                    setPayOpen(true);
                  }}
                  disabled={remaining <= 0}
                >
                  Record payment
                </Button>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Payment History" />
            <CardBody className="space-y-3">
              {(paymentsData?.payments ?? []).length === 0 && (
                <p className="text-sm text-muted">No payments recorded.</p>
              )}
              {paymentsData?.payments?.map((p) => (
                <div
                  key={p._id}
                  className="flex items-center justify-between border-b border-border pb-2 last:border-b-0"
                >
                  <div>
                    <p className="text-sm font-semibold capitalize text-text">{p.method}</p>
                    <p className="text-xs text-muted">{formatDateTime(p.createdAt)}</p>
                  </div>
                  <p className="text-sm font-bold text-text">{formatCurrency(p.amount)}</p>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>

      <Modal open={payOpen} onClose={() => setPayOpen(false)} title="Record Payment">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted">
              Amount
            </label>
            <Input
              type="number"
              step="0.01"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
            />
            <p className="mt-1 text-xs text-muted">
              Outstanding: {formatCurrency(remaining)}
            </p>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted">
              Method
            </label>
            <Select value={payMethod} onChange={(e) => setPayMethod(e.target.value as typeof payMethod)}>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="transfer">Transfer</option>
              <option value="stripe">Stripe</option>
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted">
              Notes
            </label>
            <Input value={payNotes} onChange={(e) => setPayNotes(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setPayOpen(false)}>
              Cancel
            </Button>
            <Button loading={recording} onClick={submitRecordPayment}>
              Record
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
