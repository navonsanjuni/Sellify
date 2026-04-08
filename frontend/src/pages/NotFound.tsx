import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-6 text-text">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary-600">404</p>
        <h1 className="mt-2 text-3xl font-bold">Page not found</h1>
        <p className="mt-2 text-muted">The page you are looking for doesn't exist.</p>
        <Link to="/" className="mt-6 inline-block">
          <Button>Go home</Button>
        </Link>
      </div>
    </div>
  );
}
