import { useState } from 'react';
import { Search } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { useListPublicProductsQuery } from '@/api/productsApi';
import { useListPublicCategoriesQuery } from '@/api/categoriesApi';
import { ProductCard } from './_components/ProductCard';
import { cn } from '@/lib/utils';

type SortKey = '' | 'price-low' | 'price-high' | 'newest';

export function Catalog() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState<SortKey>('');
  const [page, setPage] = useState(1);
  const limit = 12;
  const category = params.get('category') || undefined;

  const { data, isLoading } = useListPublicProductsQuery({
    search: search || undefined,
    page,
    limit,
    category,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    sort: sort || undefined,
  });
  const { data: cats } = useListPublicCategoriesQuery();

  const resetPage = () => setPage(1);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Shop</h1>
        <p className="mt-1 text-sm text-muted">Browse our complete catalog.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px,1fr]">
        <aside className="space-y-6">
          <Input
            placeholder="Search..."
            leftIcon={<Search className="h-4 w-4" />}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              resetPage();
            }}
          />

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Sort by</p>
            <Select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as SortKey);
                resetPage();
              }}
            >
              <option value="">Featured</option>
              <option value="newest">Newest</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
            </Select>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Price range</p>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => {
                  setMinPrice(e.target.value);
                  resetPage();
                }}
              />
              <Input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(e.target.value);
                  resetPage();
                }}
              />
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Categories</p>
            <div className="space-y-1">
              <button
                onClick={() => {
                  params.delete('category');
                  setParams(params);
                  resetPage();
                }}
                className={cn(
                  'block w-full rounded-md px-3 py-2 text-left text-sm transition',
                  !category ? 'bg-primary-50 text-primary-700 dark:bg-primary-950/40' : 'hover:bg-surface-2',
                )}
              >
                All Products
              </button>
              {cats?.categories?.map((c) => (
                <button
                  key={c._id}
                  onClick={() => {
                    params.set('category', c._id);
                    setParams(params);
                    resetPage();
                  }}
                  className={cn(
                    'block w-full rounded-md px-3 py-2 text-left text-sm transition',
                    category === c._id ? 'bg-primary-50 text-primary-700 dark:bg-primary-950/40' : 'hover:bg-surface-2',
                  )}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div>
          {isLoading ? (
            <div className="flex justify-center py-20"><Spinner /></div>
          ) : !data?.products || data.products.length === 0 ? (
            <EmptyState title="No products found" description="Try a different search or filter." />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {data.products.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
              <div className="mt-8 flex justify-center">
                <Pagination page={page} total={data.total} limit={limit} onChange={setPage} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
