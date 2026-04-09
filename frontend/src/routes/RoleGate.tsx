import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import type { UserRole } from '@/lib/constants';

export function RoleGate({ allow }: { allow: UserRole[] }) {
  const user = useAppSelector((s) => s.auth.user);
  if (!user || !allow.includes(user.role)) {
    return <Navigate to="/admin/overview" replace />;
  }
  return <Outlet />;
}
