import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Mail, Lock } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useCustomerLoginMutation } from '@/api/customerAuthApi';
import { useAppDispatch } from '@/app/hooks';
import { setCustomerCredentials } from '@/features/customerAuth/customerAuthSlice';

export function CustomerSignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [login, { isLoading }] = useCustomerLoginMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const next = search.get('next') || '/';

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const data = await login({ email, password }).unwrap();
      dispatch(setCustomerCredentials(data));
      toast.success('Signed in');
      navigate(next, { replace: true });
    } catch (err: any) {
      toast.error(err?.data?.message || 'Sign in failed');
    }
  };

  return (
    <div className="card w-full max-w-md p-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-primary-600">Sellify</h1>
        <p className="mt-1 text-sm text-muted">Welcome back to the platform.</p>
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
          <div className="mb-1 flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted">
              Password
            </label>
            <Link to="#" className="text-xs font-semibold text-primary-600 hover:underline">
              Forgot?
            </Link>
          </div>
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
        Don't have an account?{' '}
        <Link to="/register" className="font-semibold text-primary-600 hover:underline">
          Create Account
        </Link>
      </p>
    </div>
  );
}
