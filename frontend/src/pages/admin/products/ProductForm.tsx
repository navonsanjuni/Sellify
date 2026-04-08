import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardBody } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import {
  useCreateProductMutation,
  useGetProductQuery,
  useUpdateProductMutation,
} from '@/api/productsApi';
import { useListCategoriesQuery } from '@/api/categoriesApi';
import { toImageUrl } from '@/lib/utils';

export function ProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const { data: existing } = useGetProductQuery(id!, { skip: !isEdit });
  const { data: cats } = useListCategoriesQuery({ limit: 100 });
  const [createProduct, { isLoading: creating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: updating }] = useUpdateProductMutation();

  const [form, setForm] = useState({
    name: '',
    description: '',
    sku: '',
    price: '',
    costPrice: '',
    category: '',
    stock: '',
    lowStockThreshold: '5',
    unit: 'pcs',
  });
  const [files, setFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  useEffect(() => {
    if (existing?.product) {
      const p = existing.product;
      setForm({
        name: p.name || '',
        description: p.description || '',
        sku: p.sku || '',
        price: String(p.price ?? ''),
        costPrice: String(p.costPrice ?? ''),
        category: typeof p.category === 'object' ? p.category?._id ?? '' : p.category ?? '',
        stock: String(p.stock ?? ''),
        lowStockThreshold: String(p.lowStockThreshold ?? 5),
        unit: p.unit || 'pcs',
      });
      setExistingImages(p.images ?? []);
    }
  }, [existing]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => v !== '' && fd.append(k, v));
    files.forEach((f) => fd.append('images', f));
    try {
      if (isEdit && id) {
        await updateProduct({ id, body: fd }).unwrap();
        toast.success('Product updated');
      } else {
        await createProduct(fd).unwrap();
        toast.success('Product created');
      }
      navigate('/admin/products');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Save failed');
    }
  };

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Edit Product' : 'New Product'}
        action={
          <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate(-1)}>
            Back
          </Button>
        }
      />
      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardBody className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted">Name</label>
                <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted">Description</label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted">SKU</label>
                  <Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted">Category</label>
                  <Select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    <option value="">Select category</option>
                    {cats?.categories?.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted">Price</label>
                  <Input type="number" step="0.01" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted">Cost Price</label>
                  <Input type="number" step="0.01" value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: e.target.value })} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted">Unit</label>
                  <Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted">Stock</label>
                  <Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted">Low Stock Threshold</label>
                  <Input type="number" value={form.lowStockThreshold} onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })} />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted">Images</label>
              <label className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-surface-2 text-muted hover:bg-surface">
                <Upload className="h-6 w-6" />
                <span className="mt-1 text-xs">Click to upload</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => setFiles(Array.from(e.target.files || []))}
                />
              </label>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {existingImages.map((img, i) => (
                  <div key={i} className="relative aspect-square overflow-hidden rounded-md">
                    <img src={toImageUrl(img)} className="h-full w-full object-cover" alt="" />
                    <button
                      type="button"
                      onClick={() => setExistingImages(existingImages.filter((_, j) => j !== i))}
                      className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {files.map((f, i) => (
                  <div key={i} className="relative aspect-square overflow-hidden rounded-md">
                    <img src={URL.createObjectURL(f)} className="h-full w-full object-cover" alt="" />
                  </div>
                ))}
              </div>
              <Button type="submit" fullWidth size="lg" loading={creating || updating} className="mt-6">
                {isEdit ? 'Update Product' : 'Create Product'}
              </Button>
            </CardBody>
          </Card>
        </div>
      </form>
    </div>
  );
}
