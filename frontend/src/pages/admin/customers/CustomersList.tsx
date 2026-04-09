import { useState, type FormEvent } from 'react';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Table, type Column } from '@/components/ui/Table';
import { Pagination } from '@/components/ui/Pagination';
import {
  useCreateCustomerMutation,
  useDeleteCustomerMutation,
  useListCustomersQuery,
  useUpdateCustomerMutation,
} from '@/api/customersApi';
import { formatCurrency, formatNumber } from '@/lib/format';
import type { Customer } from '@/types/customer';

export function CustomersList() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 12;
  const { data, isLoading } = useListCustomersQuery({ search, page, limit });
  const [createCustomer, { isLoading: creating }] = useCreateCustomerMutation();
  const [updateCustomer, { isLoading: updating }] = useUpdateCustomerMutation();
  const [deleteCustomer] = useDeleteCustomerMutation();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', notes: '' });

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', email: '', phone: '', notes: '' });
    setOpen(true);
  };
  const openEdit = (c: Customer) => {
    setEditing(c);
    setForm({ name: c.name, email: c.email || '', phone: c.phone || '', notes: c.notes || '' });
    setOpen(true);
  };
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateCustomer({ id: editing._id, body: form }).unwrap();
        toast.success('Customer updated');
      } else {
        await createCustomer(form).unwrap();
        toast.success('Customer created');
      }
      setOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Save failed');
    }
  };
  const onDelete = async (id: string) => {
    if (!confirm('Deactivate this customer?')) return;
    try {
      await deleteCustomer(id).unwrap();
      toast.success('Customer deactivated');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Delete failed');
    }
  };

  const columns: Column<Customer>[] = [
    {
      header: 'Customer',
      cell: (c) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600 text-xs font-semibold text-white">
            {c.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-text">{c.name}</div>
            <div className="text-xs text-muted">{c.email || '—'}</div>
          </div>
        </div>
      ),
    },
    { header: 'Phone', cell: (c) => c.phone || '—' },
    { header: 'Orders', cell: (c) => formatNumber(c.totalOrders) },
    {
      header: 'Spent',
      headerClassName: 'text-right',
      className: 'text-right font-semibold',
      cell: (c) => formatCurrency(c.totalSpent),
    },
    {
      header: 'Actions',
      headerClassName: 'text-right',
      className: 'text-right',
      cell: (c) => (
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="ghost" onClick={() => openEdit(c)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => onDelete(c._id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Customers"
        action={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openNew}>
            Add Customer
          </Button>
        }
      />
      <Card>
        <div className="border-b border-border p-4">
          <div className="w-full max-w-sm">
            <Input
              placeholder="Search customers..."
              leftIcon={<Search className="h-4 w-4" />}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>
        <Table columns={columns} rows={data?.customers} loading={isLoading} rowKey={(c) => c._id} />
        <div className="flex items-center justify-between border-t border-border p-4 text-xs text-muted">
          <div>Showing {data?.customers?.length ?? 0} of {data?.total ?? 0} customers</div>
          <Pagination page={page} total={data?.total ?? 0} limit={limit} onChange={setPage} />
        </div>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Customer' : 'New Customer'}>
        <form onSubmit={onSubmit} className="space-y-4">
          <Input placeholder="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={creating || updating}>
              {editing ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
