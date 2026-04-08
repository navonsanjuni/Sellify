import { useEffect, useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useGetMeQuery } from '@/api/authApi';
import { useChangePasswordMutation, useUpdateUserMutation } from '@/api/usersApi';

export function AdminProfile() {
  const { data, isLoading } = useGetMeQuery();
  const [updateUser, { isLoading: updating }] = useUpdateUserMutation();
  const [changePassword, { isLoading: changing }] = useChangePasswordMutation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    if (data?.user) {
      setName(data.user.name);
      setEmail(data.user.email);
    }
  }, [data]);

  if (isLoading) return null;
  const user = data?.user;
  if (!user) return null;

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await updateUser({ id: user._id, body: { name, email } }).unwrap();
      toast.success('Profile updated');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Update failed');
    }
  };

  const savePassword = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await changePassword({ id: user._id, currentPassword, newPassword }).unwrap();
      toast.success('Password changed');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Change failed');
    }
  };

  return (
    <div>
      <PageHeader title="Settings" description="Manage your account profile and security." />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Profile" />
          <CardBody>
            <form onSubmit={saveProfile} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted">Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted">Email</label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <Button type="submit" loading={updating}>
                Save Changes
              </Button>
            </form>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Change Password" />
          <CardBody>
            <form onSubmit={savePassword} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted">Current Password</label>
                <Input type="password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted">New Password</label>
                <Input type="password" required minLength={6} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              </div>
              <Button type="submit" loading={changing}>
                Update Password
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
