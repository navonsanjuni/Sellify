import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useChangeCustomerPasswordMutation } from '@/api/customerAuthApi';
import { AccountTabs } from './_AccountTabs';

export function AccountPassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [changePassword, { isLoading }] = useChangeCustomerPasswordMutation();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirm) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      await changePassword({ currentPassword, newPassword }).unwrap();
      toast.success('Password updated');
      setCurrentPassword('');
      setNewPassword('');
      setConfirm('');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Update failed');
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-3xl font-bold tracking-tight">My Account</h1>
      <AccountTabs />
      <Card className="mt-6 max-w-md">
        <CardHeader title="Change Password" />
        <CardBody>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted">
                Current Password
              </label>
              <Input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted">
                New Password
              </label>
              <Input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted">
                Confirm New Password
              </label>
              <Input
                type="password"
                required
                minLength={6}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
            <Button type="submit" loading={isLoading}>
              Update Password
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
