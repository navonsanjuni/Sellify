import { useState, type FormEvent } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Modal } from '@/components/ui/Modal';
import { Table, type Column } from '@/components/ui/Table';
import {
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useListCategoriesQuery,
  useUpdateCategoryMutation,
} from '@/api/categoriesApi';
import { toImageUrl } from '@/lib/utils';
import type { Category } from '@/types/category';

export function CategoriesList() {
  const { data, isLoading } = useListCategoriesQuery({ limit: 100 });
  const [createCategory, { isLoading: creating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: updating }] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const openNew = () => {
    setEditing(null);
    setName('');
    setDescription('');
    setFile(null);
    setOpen(true);
  };

  const openEdit = (c: Category) => {
    setEditing(c);
    setName(c.name);
    setDescription(c.description || '');
    setFile(null);
    setOpen(true);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('name', name);
    fd.append('description', description);
    if (file) fd.append('image', file);
    try {
      if (editing) {
        await updateCategory({ id: editing._id, body: fd }).unwrap();
        toast.success('Category updated');
      } else {
        await createCategory(fd).unwrap();
        toast.success('Category created');
      }
      setOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Save failed');
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm('Deactivate this category?')) return;
    try {
      await deleteCategory(id).unwrap();
      toast.success('Category deactivated');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Delete failed');
    }
  };

  const columns: Column<Category>[] = [
    {
      header: 'Category',
      cell: (c) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 overflow-hidden rounded-md bg-surface-2">
            {c.image && <img src={toImageUrl(c.image)} alt="" className="h-full w-full object-cover" />}
          </div>
          <div>
            <div className="font-semibold text-text">{c.name}</div>
            {c.description && <div className="text-xs text-muted line-clamp-1">{c.description}</div>}
          </div>
        </div>
      ),
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
        title="Categories"
        action={
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={openNew}>
            Add Category
          </Button>
        }
      />
      <Card>
        <Table
          columns={columns}
          rows={data?.categories}
          loading={isLoading}
          rowKey={(c) => c._id}
          emptyTitle="No categories"
          emptyDescription="Create your first category to organize products."
        />
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Category' : 'New Category'}>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted">Name</label>
            <Input required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted">Description</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted">Image</label>
            <Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </div>
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
