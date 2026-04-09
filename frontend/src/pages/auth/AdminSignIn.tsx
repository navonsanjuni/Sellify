import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Mail, Lock } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAdminLoginMutation } from '@/api/authApi';
import { useAppDispatch } from '@/app/hooks';
import { setCredentials } from '@/features/auth/authSlice';

export function AdminSignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [login, { isLoading }] = useAdminLoginMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: { pathname?: string } } };
  const from = location.state?.from?.pathname || '/admin/overview';

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const data = await login({ email, password }).unwrap();
      dispatch(setCredentials(data));
      toast.success('Welcome back');
      navigate(from, { replace: true });
    } catch (err: any) {
      toast.error(err?.data?.message || 'Sign in failed');
    }
  };

  return (
    <div className="card w-full max-w-md p-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-primary-600">Sellify</h1>
        <p className="mt-1 text-sm text-muted">Admin sign in to manage your store.</p>
      </div>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted">
            Email Address
          </label>
          <Input
            type="email"
            required
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="h-4 w-4" />}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted">
            Password
          </label>
          <Input
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="h-4 w-4" />}
          />
        </div>
        <Button type="submit" fullWidth size="lg" loading={isLoading}>
          Sign In
        </Button>
      </form>
      <p className="mt-6 text-center text-xs text-muted">
        Customer?{' '}
        <Link to="/login" className="font-semibold text-primary-600 hover:underline">
          Shop sign in
        </Link>
      </p>
    </div>
  );
}
