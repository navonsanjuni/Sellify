import { Link, Outlet } from 'react-router-dom';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-bg text-text">
      <header className="flex h-16 items-center justify-between px-6">
        <Link to="/" className="text-xl font-bold tracking-tight">
          Sellify
        </Link>
        <ThemeToggle />
      </header>
      <main className="flex flex-1 items-center justify-center p-6">
        <Outlet />
      </main>
    </div>
  );
}
