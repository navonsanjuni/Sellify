import { useState, type FormEvent } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Table, type Column } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import {
  useDeleteUserMutation,
  useListUsersQuery,
  useUpdateUserMutation,
} from '@/api/usersApi';
import { useAdminRegisterMutation } from '@/api/authApi';
import { formatDateTime } from '@/lib/format';
import type { User } from '@/types/user';

type UserRole = 'admin' | 'staff';
type Mode = 'create' | 'edit';

interface UserForm {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

const emptyForm: UserForm = { name: '', email: '', password: '', role: 'staff' };

export function UsersList() {
  const { data, isLoading } = useListUsersQuery({ limit: 100 });
  const [register, { isLoading: creating }] = useAdminRegisterMutation();
  const [updateUser, { isLoading: updating }] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<UserForm>(emptyForm);

  const openCreate = () => {
    setMode('create');
    setEditingId(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (u: User) => {
    setMode('edit');
    setEditingId(u._id);
    setForm({ name: u.name, email: u.email, password: '', role: u.role });
    setOpen(true);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (mode === 'create') {
        await register(form).unwrap();
        toast.success('Staff member created');
      } else if (editingId) {
        await updateUser({
          id: editingId,
          body: { name: form.name, email: form.email, role: form.role },
        }).unwrap();
        toast.success('Staff member updated');
      }
      setOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Save failed');
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm('Deactivate this user?')) return;
    try {
      await deleteUser(id).unwrap();
      toast.success('User deactivated');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Delete failed');
    }
  };

  const columns: Column<User>[] = [
    { header: 'Name', cell: (u) => <span className="font-semibold text-text">{u.name}</span> },
    { header: 'Email', accessor: 'email' },
    { header: 'Role', cell: (u) => <Badge tone={u.role === 'admin' ? 'primary' : 'neutral'}>{u.role}</Badge> },
    { header: 'Last Login', cell: (u) => <span className="text-muted">{formatDateTime(u.lastLogin)}</span> },
    {
      header: 'Actions',
      headerClassName: 'text-right',
      className: 'text-right',
      cell: (u) => (
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="ghost" onClick={() => openEdit(u)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => onDelete(u._id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Staff"
        description="Manage admin and staff accounts."
        action={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            Add Staff
          </Button>
        }
      />
      <Card>
        <Table columns={columns} rows={data?.users} loading={isLoading} rowKey={(u) => u._id} />
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={mode === 'create' ? 'New Staff Member' : 'Edit Staff Member'}
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            placeholder="Name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            type="email"
            placeholder="Email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          {mode === 'create' && (
            <Input
              type="password"
              placeholder="Password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          )}
          <Select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
          >
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </Select>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={creating || updating}>
              {mode === 'create' ? 'Create' : 'Save'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
