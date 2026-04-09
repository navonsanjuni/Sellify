import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight, ShieldCheck, Truck, Award } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { removeFromCart, selectCartTotal, updateQty } from '@/features/cart/cartSlice';
import { formatCurrency } from '@/lib/format';
import { toImageUrl } from '@/lib/utils';

export function Cart() {
  const items = useAppSelector((s) => s.cart.items);
  const subtotal = useAppSelector(selectCartTotal);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <EmptyState
          icon={<ShoppingCart className="h-6 w-6" />}
          title="Your cart is empty"
          description="Browse our catalog and add items to get started."
          action={
            <Link to="/shop">
              <Button>Browse Products</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Review Your Cart</h1>
      <p className="mt-1 text-sm text-muted">You have {items.length} items in your shopping bag.</p>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <Card key={item.productId}>
              <div className="flex items-center gap-4 p-4">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-surface-2">
                  {item.image && <img src={toImageUrl(item.image)} alt={item.name} className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary-600">Product</p>
                  <h3 className="truncate text-base font-semibold text-text">{item.name}</h3>
                  <p className="mt-0.5 text-xs text-muted">{formatCurrency(item.price)} each</p>
                </div>
                <div className="flex items-center gap-1 rounded-full border border-border px-2 py-1">
                  <button onClick={() => dispatch(updateQty({ productId: item.productId, qty: item.qty - 1 }))} className="p-1 text-muted hover:text-text">
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-6 text-center text-sm font-semibold">{item.qty}</span>
                  <button onClick={() => dispatch(updateQty({ productId: item.productId, qty: item.qty + 1 }))} className="p-1 text-muted hover:text-text">
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="w-24 text-right font-bold text-text">{formatCurrency(item.price * item.qty)}</div>
                <button
                  onClick={() => dispatch(removeFromCart(item.productId))}
                  className="rounded-md p-2 text-muted hover:bg-surface-2 hover:text-red-500"
                  aria-label="Remove"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </Card>
          ))}

          <Link
            to="/shop"
            className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-surface-2 p-6 text-sm font-semibold text-muted hover:text-primary-600"
          >
            <ShoppingCart className="h-4 w-4" />
            Forgot something? Keep shopping
          </Link>
        </div>

        <Card className="h-fit">
          <CardBody className="space-y-4">
            <h3 className="text-lg font-bold">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-muted">
                <span>Subtotal</span>
                <span className="text-text">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Shipping</span>
                <span className="font-semibold text-emerald-600">FREE</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Tax</span>
                <span className="text-text">Calculated at checkout</span>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-4">
              <span className="text-base font-bold">Total</span>
              <span className="text-2xl font-bold text-primary-600">{formatCurrency(subtotal)}</span>
            </div>
            <Button fullWidth size="lg" rightIcon={<ArrowRight className="h-4 w-4" />} onClick={() => navigate('/checkout')}>
              Proceed to Checkout
            </Button>
            <div className="grid grid-cols-3 gap-2 pt-2 text-[10px] text-muted">
              <div className="flex items-center gap-1"><ShieldCheck className="h-3 w-3" />PCI-DSS</div>
              <div className="flex items-center gap-1"><Truck className="h-3 w-3" />FREE SHIP</div>
              <div className="flex items-center gap-1"><Award className="h-3 w-3" />TRUSTED</div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
