import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Mail, Lock, User as UserIcon, Phone } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useCustomerRegisterMutation } from '@/api/customerAuthApi';
import { useAppDispatch } from '@/app/hooks';
import { setCustomerCredentials } from '@/features/customerAuth/customerAuthSlice';

export function CustomerSignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [register, { isLoading }] = useCustomerRegisterMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const data = await register({ name, email, password, phone: phone || undefined }).unwrap();
      dispatch(setCustomerCredentials(data));
      toast.success('Account created');
      navigate('/', { replace: true });
    } catch (err: any) {
      toast.error(err?.data?.message || 'Sign up failed');
    }
  };

  return (
    <div className="card w-full max-w-md p-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-primary-600">Sellify</h1>
        <p className="mt-1 text-sm text-muted">Create your shopping account.</p>
      </div>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted">
            Full Name
          </label>
          <Input
            required
            placeholder="Jane Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            leftIcon={<UserIcon className="h-4 w-4" />}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted">
            Email
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
            Phone (optional)
          </label>
          <Input
            placeholder="+1 555 123 4567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            leftIcon={<Phone className="h-4 w-4" />}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted">
            Password
          </label>
          <Input
            type="password"
            required
            minLength={6}
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="h-4 w-4" />}
          />
        </div>
        <Button type="submit" fullWidth size="lg" loading={isLoading}>
          Create Account
        </Button>
      </form>
      <p className="mt-6 text-center text-xs text-muted">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-primary-600 hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
}
