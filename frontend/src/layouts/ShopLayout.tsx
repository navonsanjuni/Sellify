import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { selectCartCount } from '@/features/cart/cartSlice';
import { customerLogout } from '@/features/customerAuth/customerAuthSlice';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { cn } from '@/lib/utils';

export function ShopLayout() {
  const cartCount = useAppSelector(selectCartCount);
  const customer = useAppSelector((s) => s.customerAuth.customer);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const navLink = ({ isActive }: { isActive: boolean }) =>
    cn(
      'text-sm font-medium transition',
      isActive ? 'text-primary-600' : 'text-text hover:text-primary-600',
    );

  return (
    <div className="flex min-h-screen flex-col bg-bg text-text">
      <header className="sticky top-0 z-20 border-b border-border bg-surface/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-8 px-6">
          <Link to="/" className="text-xl font-bold tracking-tight">
            Sellify
          </Link>
          <nav className="hidden gap-6 md:flex">
            <NavLink to="/shop" className={navLink}>
              Shop
            </NavLink>
            <NavLink to="/shop?featured=1" className={navLink}>
              Featured
            </NavLink>
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <ThemeToggle />
            <Link
              to="/cart"
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface hover:bg-surface-2"
              aria-label="Cart"
            >
              <ShoppingCart className="h-4 w-4" />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-600 px-1 text-[10px] font-semibold text-white">
                  {cartCount}
                </span>
              )}
            </Link>
            {customer ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/account/orders"
                  className="hidden text-sm font-medium text-text hover:text-primary-600 sm:block"
                >
                  {customer.name}
                </Link>
                <button
                  onClick={() => {
                    dispatch(customerLogout());
                    navigate('/');
                  }}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-surface-2"
                  aria-label="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface hover:bg-surface-2"
                aria-label="Sign in"
              >
                <User className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border bg-surface">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-6 text-xs text-muted">
          <div>© {new Date().getFullYear()} Sellify Inc. All rights reserved.</div>
          <div className="flex gap-6">
            <Link to="#" className="hover:text-text">PRIVACY POLICY</Link>
            <Link to="#" className="hover:text-text">TERMS OF SERVICE</Link>
            <Link to="#" className="hover:text-text">HELP CENTER</Link>
            <Link to="#" className="hover:text-text">CONTACT</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
