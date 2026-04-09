import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ShoppingCart, Minus, Plus, ShieldCheck, Truck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useGetPublicProductQuery } from '@/api/productsApi';
import { useAppDispatch } from '@/app/hooks';
import { addToCart } from '@/features/cart/cartSlice';
import { formatCurrency } from '@/lib/format';
import { toImageUrl } from '@/lib/utils';

export function ProductPage() {
  const { id } = useParams();
  const { data, isLoading } = useGetPublicProductQuery(id!);
  const dispatch = useAppDispatch();
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);

  if (isLoading || !data?.product) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const p = data.product;
  const images = p.images && p.images.length > 0 ? p.images : [];

  const handleAdd = () => {
    dispatch(
      addToCart({
        productId: p._id,
        name: p.name,
        price: p.price,
        qty,
        image: p.images?.[0],
        stock: p.stock,
      }),
    );
    toast.success('Added to cart');
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div>
          <div className="aspect-square overflow-hidden rounded-2xl bg-surface-2">
            {images[activeImg] ? (
              <img src={toImageUrl(images[activeImg])} alt={p.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted">No image</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-4 grid grid-cols-5 gap-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`aspect-square overflow-hidden rounded-lg border-2 ${i === activeImg ? 'border-primary-600' : 'border-border'}`}
                >
                  <img src={toImageUrl(img)} className="h-full w-full object-cover" alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary-600">
            {typeof p.category === 'object' ? p.category?.name : 'Product'}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">{p.name}</h1>
          <p className="mt-4 text-3xl font-bold text-primary-600">{formatCurrency(p.price)}</p>
          {p.description && <p className="mt-4 text-sm leading-relaxed text-muted">{p.description}</p>}

          <div className="mt-6 flex items-center gap-3">
            <div className="inline-flex items-center rounded-full border border-border bg-surface px-2 py-1">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-1 text-muted hover:text-text">
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center text-sm font-semibold">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="p-1 text-muted hover:text-text">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <Button size="lg" leftIcon={<ShoppingCart className="h-4 w-4" />} onClick={handleAdd} disabled={p.stock === 0}>
              {p.stock === 0 ? 'Sold Out' : 'Add to Cart'}
            </Button>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 rounded-xl border border-border bg-surface p-4">
            <div className="flex items-center gap-2 text-sm">
              <ShieldCheck className="h-4 w-4 text-primary-600" />
              Secure payment
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Truck className="h-4 w-4 text-primary-600" />
              Free delivery
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
