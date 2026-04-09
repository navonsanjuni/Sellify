import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Pencil, Trash2, Package } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Table, type Column } from '@/components/ui/Table';
import { Badge, statusTone } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import {
  useAdjustStockMutation,
  useDeleteProductMutation,
  useListProductsQuery,
} from '@/api/productsApi';
import { formatCurrency } from '@/lib/format';
import { toImageUrl } from '@/lib/utils';
import type { Product } from '@/types/product';

export function ProductsList() {
  const [search, setSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading } = useListProductsQuery({
    search: search || undefined,
    lowStock: lowStockOnly ? 'true' : undefined,
    page,
    limit,
  });
  const [deleteProduct] = useDeleteProductMutation();
  const [adjustStock, { isLoading: adjusting }] = useAdjustStockMutation();
  const navigate = useNavigate();

  const [stockTarget, setStockTarget] = useState<Product | null>(null);
  const [stockDelta, setStockDelta] = useState('0');

  const handleDelete = async (id: string) => {
    if (!confirm('Deactivate this product?')) return;
    try {
      await deleteProduct(id).unwrap();
      toast.success('Product deactivated');
    } catch (e: any) {
      toast.error(e?.data?.message || 'Failed to delete');
    }
  };

  const submitStockAdjust = async () => {
    if (!stockTarget) return;
    const qty = Number(stockDelta);
    if (!qty) {
      toast.error('Enter a non-zero quantity');
      return;
    }
    try {
      await adjustStock({ id: stockTarget._id, quantity: qty }).unwrap();
      toast.success('Stock adjusted');
      setStockTarget(null);
      setStockDelta('0');
    } catch (e: any) {
      toast.error(e?.data?.message || 'Failed to adjust stock');
    }
  };

  const columns: Column<Product>[] = [
    {
      header: 'Product',
      cell: (p) => (
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 overflow-hidden rounded-lg bg-surface-2">
            {p.images?.[0] && (
              <img src={toImageUrl(p.images[0])} alt={p.name} className="h-full w-full object-cover" />
            )}
          </div>
          <div>
            <div className="font-semibold text-text">{p.name}</div>
            <div className="text-xs text-muted">
              {(typeof p.category === 'object' ? p.category?.name : '—')} • SKU-{p.sku || '—'}
            </div>
          </div>
        </div>
      ),
    },
    { header: 'Price', cell: (p) => <span className="font-semibold">{formatCurrency(p.price)}</span> },
    { header: 'Stock', cell: (p) => `${p.stock} ${p.unit || 'pcs'}` },
    {
      header: 'Status',
      cell: (p) => {
        const label = p.stock === 0 ? 'Out of stock' : p.isLowStock ? 'Low stock' : 'In stock';
        return <Badge tone={statusTone(label)}>{label}</Badge>;
      },
    },
    {
      header: 'Actions',
      headerClassName: 'text-right',
      className: 'text-right',
      cell: (p) => (
        <div className="flex justify-end gap-2">
          <Button
            size="sm"
            variant="ghost"
            title="Adjust stock"
            onClick={(e) => {
              e.stopPropagation();
              setStockTarget(p);
              setStockDelta('0');
            }}
          >
            <Package className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            title="Edit"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/products/${p._id}`);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            title="Deactivate"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(p._id);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Products"
        action={
          <Link to="/admin/products/new">
            <Button leftIcon={<Plus className="h-4 w-4" />}>Add New Product</Button>
          </Link>
        }
      />
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
          <div className="w-full max-w-sm">
            <Input
              placeholder="Search inventory..."
              leftIcon={<Search className="h-4 w-4" />}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <label className="inline-flex items-center gap-2 text-sm text-text">
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(e) => {
                setLowStockOnly(e.target.checked);
                setPage(1);
              }}
              className="h-4 w-4 rounded border-border text-primary-600 focus:ring-primary-500"
            />
            Low stock only
          </label>
        </div>
        <Table
          columns={columns}
          rows={data?.products}
          loading={isLoading}
          rowKey={(p) => p._id}
          emptyTitle="No products yet"
          emptyDescription="Add your first product to get started."
        />
        <div className="flex items-center justify-between border-t border-border p-4 text-xs text-muted">
          <div>
            Showing {data?.products?.length ?? 0} of {data?.total ?? 0} entries
          </div>
          <Pagination page={page} total={data?.total ?? 0} limit={limit} onChange={setPage} />
        </div>
      </Card>

      <Modal
        open={Boolean(stockTarget)}
        onClose={() => setStockTarget(null)}
        title={`Adjust stock — ${stockTarget?.name ?? ''}`}
      >
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Current stock: <span className="font-semibold text-text">{stockTarget?.stock ?? 0}</span>
            . Use a positive number to add, negative to remove.
          </p>
          <Input
            type="number"
            placeholder="e.g. 10 or -3"
            value={stockDelta}
            onChange={(e) => setStockDelta(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setStockTarget(null)}>
              Cancel
            </Button>
            <Button loading={adjusting} onClick={submitStockAdjust}>
              Apply
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
