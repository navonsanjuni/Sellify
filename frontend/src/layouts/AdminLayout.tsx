import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingBag,
  Users,
  CreditCard,
  Settings,
  LogOut,
  Bell,
  Search,
  UserCog,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { logout } from '@/features/auth/authSlice';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Input } from '@/components/ui/Input';

const navItems = [
  { to: '/admin/overview', label: 'Overview', icon: LayoutDashboard },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/categories', label: 'Categories', icon: Tags },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/payments', label: 'Payments', icon: CreditCard },
];

export function AdminLayout() {
  const user = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-bg text-text">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-surface md:flex">
        <div className="px-6 py-6">
          <div className="text-lg font-bold tracking-tight text-text">Sellify Admin</div>
          <div className="text-xs text-muted">Enterprise Manager</div>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition',
                    isActive
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-300'
                      : 'text-muted hover:bg-surface-2 hover:text-text',
                  )
                }
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            );
          })}
          {user?.role === 'admin' && (
            <NavLink
              to="/admin/users"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition',
                  isActive
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-300'
                    : 'text-muted hover:bg-surface-2 hover:text-text',
                )
              }
            >
              <UserCog className="h-4 w-4" />
              Staff
            </NavLink>
          )}
          <NavLink
            to="/admin/settings"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition',
                isActive
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-300'
                  : 'text-muted hover:bg-surface-2 hover:text-text',
              )
            }
          >
            <Settings className="h-4 w-4" />
            Settings
          </NavLink>
        </nav>

        <div className="m-3 rounded-xl border border-border bg-surface-2 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600 text-sm font-semibold text-white">
              {user?.name?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-text">{user?.name}</div>
              <div className="truncate text-xs capitalize text-muted">{user?.role}</div>
            </div>
            <button
              onClick={handleLogout}
              className="ml-auto rounded-md p-2 text-muted hover:bg-surface hover:text-text"
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-surface/80 px-6 backdrop-blur">
          <div className="text-xs font-semibold uppercase tracking-widest text-muted">Overview</div>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden w-72 lg:block">
              <Input placeholder="Search analytics..." leftIcon={<Search className="h-4 w-4" />} />
            </div>
            <button
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-text hover:bg-surface-2"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
            </button>
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
