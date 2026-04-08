import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function AccountTabs() {
  const link = ({ isActive }: { isActive: boolean }) =>
    cn(
      'border-b-2 px-4 py-3 text-sm font-semibold transition',
      isActive
        ? 'border-primary-600 text-primary-600'
        : 'border-transparent text-muted hover:text-text',
    );

  return (
    <div className="mt-6 flex gap-2 border-b border-border">
      <NavLink to="/account/orders" className={link}>
        Orders
      </NavLink>
      <NavLink to="/account/profile" className={link}>
        Profile
      </NavLink>
      <NavLink to="/account/password" className={link}>
        Password
      </NavLink>
    </div>
  );
}
