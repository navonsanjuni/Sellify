import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { useAppDispatch } from '@/app/hooks';
import { addToCart } from '@/features/cart/cartSlice';
import { formatCurrency } from '@/lib/format';
import { toImageUrl } from '@/lib/utils';
import type { Product } from '@/types/product';

export function ProductCard({ product }: { product: Product }) {
  const dispatch = useAppDispatch();

  const handleAdd = () => {
    dispatch(
      addToCart({
        productId: product._id,
        name: product.name,
        price: product.price,
        qty: 1,
        image: product.images?.[0],
        stock: product.stock,
      }),
    );
    toast.success('Added to cart');
  };

  return (
    <div className="group overflow-hidden rounded-xl border border-border bg-surface transition hover:shadow-card">
      <Link to={`/shop/products/${product._id}`} className="block">
        <div className="aspect-square overflow-hidden bg-surface-2">
          {product.images?.[0] ? (
            <img
              src={toImageUrl(product.images[0])}
              alt={product.name}
              className="h-full w-full object-cover transition group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-muted">
              No image
            </div>
          )}
        </div>
      </Link>
      <div className="p-4">
        <Link to={`/shop/products/${product._id}`}>
          <h3 className="line-clamp-1 text-sm font-semibold text-text hover:text-primary-600">
            {product.name}
          </h3>
        </Link>
        <p className="mt-0.5 text-xs text-muted line-clamp-1">
          {typeof product.category === 'object' ? product.category?.name : 'Featured'}
        </p>
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="text-base font-bold text-text">{formatCurrency(product.price)}</span>
          <Button size="sm" onClick={handleAdd} disabled={product.stock === 0}>
            {product.stock === 0 ? 'Sold Out' : 'Add to Cart'}
          </Button>
        </div>
      </div>
    </div>
  );
}
