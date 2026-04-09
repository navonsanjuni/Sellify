import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAppSelector } from '@/app/hooks';
import { selectCartTotal } from '@/features/cart/cartSlice';
import { useCreateCheckoutSessionMutation } from '@/api/checkoutApi';
import { formatCurrency } from '@/lib/format';

export function Checkout() {
  const items = useAppSelector((s) => s.cart.items);
  const subtotal = useAppSelector(selectCartTotal);
  const customer = useAppSelector((s) => s.customerAuth.customer);
  const [createSession, { isLoading }] = useCreateCheckoutSessionMutation();

  const [form, setForm] = useState({
    fullName: customer?.name || '',
    street: customer?.address?.street || '',
    city: customer?.address?.city || '',
    state: customer?.address?.state || '',
    zipCode: customer?.address?.zipCode || '',
    phone: customer?.phone || '',
  });

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    try {
      const data = await createSession({
        items: items.map((i) => ({ productId: i.productId, quantity: i.qty })),
        shippingAddress: {
          street: form.street,
          city: form.city,
          state: form.state,
          zipCode: form.zipCode,
        },
      }).unwrap();
      window.location.href = data.url;
    } catch (err: any) {
      toast.error(
        err?.data?.message ||
          err?.data?.errors?.[0] ||
          'Checkout failed. Please try again.',
      );
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
      <p className="mt-1 text-sm text-muted">Complete your shipping details to continue.</p>

      <form onSubmit={onSubmit} className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Shipping Address" />
          <CardBody className="space-y-4">
            <Input placeholder="Full Name" required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            <Input placeholder="Street Address" required value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="City" required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              <Input placeholder="State" required value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="ZIP Code" required value={form.zipCode} onChange={(e) => setForm({ ...form, zipCode: e.target.value })} />
              <Input placeholder="Phone" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          </CardBody>
        </Card>

        <Card className="h-fit">
          <CardHeader title="Order Summary" />
          <CardBody className="space-y-3">
            {items.map((i) => (
              <div key={i.productId} className="flex justify-between text-sm">
                <span className="truncate text-muted">
                  {i.name} × {i.qty}
                </span>
                <span className="font-semibold text-text">{formatCurrency(i.price * i.qty)}</span>
              </div>
            ))}
            <div className="border-t border-border pt-3">
              <div className="flex justify-between text-base font-bold">
                <span>Total</span>
                <span className="text-primary-600">{formatCurrency(subtotal)}</span>
              </div>
            </div>
            <Button type="submit" fullWidth size="lg" loading={isLoading}>
              Pay with Stripe
            </Button>
          </CardBody>
        </Card>
      </form>
    </div>
  );
}
