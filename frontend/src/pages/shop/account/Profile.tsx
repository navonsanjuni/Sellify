import { useEffect, useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useGetCustomerMeQuery, useUpdateCustomerProfileMutation } from '@/api/customerAuthApi';
import { AccountTabs } from './_AccountTabs';

export function AccountProfile() {
  const { data } = useGetCustomerMeQuery();
  const [update, { isLoading }] = useUpdateCustomerProfileMutation();

  const [form, setForm] = useState({
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
  });

  useEffect(() => {
    if (data?.customer) {
      const c = data.customer;
      setForm({
        name: c.name || '',
        phone: c.phone || '',
        street: c.address?.street || '',
        city: c.address?.city || '',
        state: c.address?.state || '',
        zipCode: c.address?.zipCode || '',
      });
    }
  }, [data]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await update({
        name: form.name,
        phone: form.phone,
        address: {
          street: form.street,
          city: form.city,
          state: form.state,
          zipCode: form.zipCode,
        },
      }).unwrap();
      toast.success('Profile updated');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Update failed');
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-3xl font-bold tracking-tight">My Account</h1>
      <AccountTabs />
      <Card className="mt-6">
        <CardHeader title="Profile Details" />
        <CardBody>
          <form onSubmit={onSubmit} className="space-y-4">
            <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Input placeholder="Street" value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} />
            <div className="grid grid-cols-3 gap-3">
              <Input placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              <Input placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
              <Input placeholder="ZIP" value={form.zipCode} onChange={(e) => setForm({ ...form, zipCode: e.target.value })} />
            </div>
            <Button type="submit" loading={isLoading}>
              Save Changes
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
