import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Zap, Award } from 'lucide-react';
import { useGetFeaturedProductsQuery } from '@/api/productsApi';
import { useListPublicCategoriesQuery } from '@/api/categoriesApi';
import { Button } from '@/components/ui/Button';
import { ProductCard } from './_components/ProductCard';
import { toImageUrl } from '@/lib/utils';
import heroImage from '@/images/heroImage.jpg';

export function Home() {
  const { data: featured } = useGetFeaturedProductsQuery({ limit: 8 });
  const { data: categories } = useListPublicCategoriesQuery();

  return (
    <div className="mx-auto max-w-7xl px-6">
      {/* Hero */}
      <section className="my-10 grid grid-cols-1 items-center gap-8 rounded-2xl border border-border bg-surface p-10 lg:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary-600">
            The Next Generation
          </p>
          <h1 className="mt-2 text-4xl font-bold leading-tight tracking-tight md:text-5xl">
            Build the Future of <br />
            eCommerce with <span className="text-primary-600">Sellify</span>
          </h1>
          <p className="mt-4 max-w-md text-sm text-muted">
            Scale your business with an enterprise-grade platform designed for speed, flexibility,
            and architectural minimalism.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/shop">
              <Button size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Get Started Now
              </Button>
            </Link>
            <Button size="lg" variant="outline">
              View Documentation
            </Button>
          </div>
        </div>
        <div className="relative aspect-video overflow-hidden rounded-xl shadow-xl">
          <img
            src={heroImage}
            alt="Sellify Demo"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute -bottom-3 -left-3 rounded-lg border border-border bg-surface px-3 py-2 shadow-card">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">Conversion</p>
            <p className="text-base font-bold text-emerald-500">+124.5%</p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="my-12">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted">Collections</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight">Explore Categories</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {categories?.categories?.slice(0, 4).map((c) => (
            <Link
              key={c._id}
              to={`/shop?category=${c._id}`}
              className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-surface-2"
            >
              {c.image && (
                <img
                  src={toImageUrl(c.image)}
                  alt={c.name}
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <p className="text-base font-bold text-white">{c.name}</p>
                {c.description && <p className="text-xs text-white/70 line-clamp-1">{c.description}</p>}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="my-12">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">Curated For You</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight">Featured Products</h2>
          </div>
          <Link to="/shop" className="text-sm font-semibold text-primary-600 hover:underline">
            See All →
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {featured?.products?.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="my-12 grid grid-cols-1 gap-6 rounded-2xl border border-border bg-surface p-8 md:grid-cols-3">
        <Feature icon={<Award className="h-5 w-5" />} title="Architectural Quality" description="Engineered for stability and growth, ensuring your business stays ahead of the curve." />
        <Feature icon={<Zap className="h-5 w-5" />} title="Lightning Speed" description="Zero-lag browsing and rapid checkouts that turn visitors into loyal customers instantly." />
        <Feature icon={<ShieldCheck className="h-5 w-5" />} title="Secure Infrastructure" description="Enterprise-grade security protocols protect your data and your customers' trust at every touchpoint." />
      </section>
    </div>
  );
}

function Feature({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div>
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400">
        {icon}
      </div>
      <h3 className="mt-3 text-base font-bold">{title}</h3>
      <p className="mt-1 text-sm text-muted">{description}</p>
    </div>
  );
}
