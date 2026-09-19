import { useState, useEffect } from 'react';
import { FolderTree, Plus, Trash2, Edit } from 'lucide-react';
import { categoryAPI } from '@/api/endpoints';
import DataTable from '@/components/ui/DataTable';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { categorySchema } from '@/utils/validators';
import { useDispatch } from 'react-redux';
import { openModal } from '@/store/slices/uiSlice';
import toast from 'react-hot-toast';

export default function Categories() {
  const dispatch = useDispatch();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit, formState: { errors }, reset } = useForm({ resolver: zodResolver(categorySchema) });

  const fetchCategories = () => { categoryAPI.getAll().then((r) => setCategories(r.data?.data?.categories || r.data?.categories || [])).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(fetchCategories, []);

  const onSubmit = async (data) => {
    try { await categoryAPI.create(data); toast.success('Category created!'); reset(); fetchCategories(); } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    try { await categoryAPI.delete(id); toast.success('Deleted'); fetchCategories(); } catch { toast.error('Failed'); }
  };

  const columns = [
    { key: 'name', label: 'Name', render: (v) => <span className="font-medium">{v}</span> },
    { key: 'description', label: 'Description', render: (v) => <span className="text-surface-500 truncate max-w-[200px] block">{v || '—'}</span> },
    { key: '_id', label: '', render: (v) => <button onClick={() => handleDelete(v)} className="p-1 cursor-pointer"><Trash2 className="h-4 w-4 text-danger-500" /></button> },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-surface-900 dark:text-white">Categories</h2>
        <Button icon={Plus} onClick={() => dispatch(openModal({ name: 'create-category' }))}>Add Category</Button>
      </div>
      <DataTable columns={columns} data={categories} isLoading={loading} emptyMessage="No categories" emptyIcon={FolderTree} />
      <Modal name="create-category" title="Create Category" size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Category Name" error={errors.name?.message} {...register('name')} />
          <Textarea label="Description" {...register('description')} rows={3} />
          <Button type="submit" fullWidth variant="gradient">Create Category</Button>
        </form>
      </Modal>
    </div>
  );
}
