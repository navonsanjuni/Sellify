import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Minus, Trash2, Search } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useListProductsQuery } from '@/api/productsApi';
import { useListCustomersQuery } from '@/api/customersApi';
import { useCreateOrderMutation } from '@/api/ordersApi';
import { formatCurrency } from '@/lib/format';
import type { PaymentMethod } from '@/lib/constants';

interface CartLine {
  product: string;
  name: string;
  price: number;
  quantity: number;
}

export function PosNewOrder() {
  const [search, setSearch] = useState('');
  const { data: products } = useListProductsQuery({ search, limit: 20 });
  const { data: customers } = useListCustomersQuery({ limit: 100 });
  const [createOrder, { isLoading }] = useCreateOrderMutation();
  const navigate = useNavigate();

  const [cart, setCart] = useState<CartLine[]>([]);
  const [customerId, setCustomerId] = useState('');
  const [discount, setDiscount] = useState('0');
  const [tax, setTax] = useState('0');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [amountPaid, setAmountPaid] = useState('0');
  const [notes, setNotes] = useState('');

  const subtotal = cart.reduce((s, l) => s + l.price * l.quantity, 0);
  const total = Math.max(0, subtotal - Number(discount || 0) + Number(tax || 0));

  const addToCart = (p: { _id: string; name: string; price: number }) => {
    setCart((prev) => {
      const existing = prev.find((l) => l.product === p._id);
      if (existing) {
        return prev.map((l) => (l.product === p._id ? { ...l, quantity: l.quantity + 1 } : l));
      }
      return [...prev, { product: p._id, name: p.name, price: p.price, quantity: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((l) => (l.product === id ? { ...l, quantity: Math.max(0, l.quantity + delta) } : l))
        .filter((l) => l.quantity > 0),
    );
  };

  const onSubmit = async () => {
    if (cart.length === 0) {
      toast.error('Add at least one product');
      return;
    }
    try {
      await createOrder({
        customerId: customerId || undefined,
        items: cart.map((l) => ({ productId: l.product, quantity: l.quantity })),
        discount: Number(discount || 0),
        tax: Number(tax || 0),
        paymentMethod,
        amountPaid: Number(amountPaid || 0),
        notes: notes || undefined,
      }).unwrap();
      toast.success('Order created');
      navigate('/admin/orders');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to create order');
    }
  };

  return (
    <div>
      <PageHeader
        title="New POS Order"
        action={
          <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate(-1)}>
            Back
          </Button>
        }
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Products" />
          <CardBody>
            <Input
              placeholder="Search products..."
              leftIcon={<Search className="h-4 w-4" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {products?.products?.map((p) => (
                <button
                  key={p._id}
                  onClick={() => addToCart(p)}
                  className="rounded-lg border border-border bg-surface p-3 text-left transition hover:border-primary-500 hover:shadow-sm"
                >
                  <div className="line-clamp-2 text-sm font-semibold text-text">{p.name}</div>
                  <div className="mt-1 text-xs text-muted">Stock: {p.stock}</div>
                  <div className="mt-2 text-base font-bold text-primary-600">{formatCurrency(p.price)}</div>
                </button>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Cart" />
          <CardBody className="space-y-4">
            {cart.length === 0 && <p className="text-sm text-muted">No items added.</p>}
            {cart.map((l) => (
              <div key={l.product} className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-text">{l.name}</p>
                  <p className="text-xs text-muted">{formatCurrency(l.price)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="outline" onClick={() => updateQty(l.product, -1)}>
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-6 text-center text-sm">{l.quantity}</span>
                  <Button size="sm" variant="outline" onClick={() => updateQty(l.product, +1)}>
                    <Plus className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => updateQty(l.product, -l.quantity)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}

            <div className="space-y-3 border-t border-border pt-4">
              <Select value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                <option value="">Walk-in customer</option>
                {customers?.customers?.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </Select>
              <div className="grid grid-cols-2 gap-2">
                <Input type="number" placeholder="Discount" value={discount} onChange={(e) => setDiscount(e.target.value)} />
                <Input type="number" placeholder="Tax" value={tax} onChange={(e) => setTax(e.target.value)} />
              </div>
              <Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="online">Online</option>
                <option value="none">None</option>
              </Select>
              <Input type="number" placeholder="Amount paid" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} />
              <Input placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />

              <div className="space-y-1 border-t border-border pt-3 text-sm">
                <div className="flex justify-between text-muted">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between font-bold text-text">
                  <span>Total</span>
                  <span className="text-primary-600">{formatCurrency(total)}</span>
                </div>
              </div>

              <Button fullWidth size="lg" loading={isLoading} onClick={onSubmit}>
                Complete Sale
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
