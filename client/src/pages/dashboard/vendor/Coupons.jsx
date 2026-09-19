import { useState, useEffect } from 'react';
import { Plus, Tag } from 'lucide-react';
import { couponAPI } from '@/api/endpoints';
import DataTable from '@/components/ui/DataTable';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { couponSchema } from '@/utils/validators';
import { useDispatch } from 'react-redux';
import { openModal } from '@/store/slices/uiSlice';
import { formatDate } from '@/utils/helpers';
import Badge from '@/components/ui/Badge';
import toast from 'react-hot-toast';

export default function Coupons() {
  const dispatch = useDispatch();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit, formState: { errors }, reset } = useForm({ resolver: zodResolver(couponSchema) });

  const fetchCoupons = () => { couponAPI.getAll().then((r) => setCoupons(r.data?.data?.coupons || r.data?.coupons || [])).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(fetchCoupons, []);

  const onSubmit = async (data) => {
    try { await couponAPI.create(data); toast.success('Coupon created!'); reset(); fetchCoupons(); } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    try { await couponAPI.delete(id); toast.success('Deleted'); fetchCoupons(); } catch { toast.error('Failed'); }
  };

  const columns = [
    { key: 'code', label: 'Code', render: (v) => <span className="font-mono font-semibold">{v}</span> },
    { key: 'discountType', label: 'Type', render: (v) => <Badge variant="primary">{v}</Badge> },
    { key: 'discountValue', label: 'Value', render: (v, row) => row.discountType === 'percentage' ? `${v}%` : `$${v}` },
    { key: 'expiresAt', label: 'Expires', render: (v) => formatDate(v) },
    { key: '_id', label: '', render: (v) => <button onClick={() => handleDelete(v)} className="text-xs text-danger-600 hover:underline cursor-pointer">Delete</button> },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-surface-900 dark:text-white">Coupons</h2>
        <Button icon={Plus} onClick={() => dispatch(openModal({ name: 'create-coupon' }))}>Create Coupon</Button>
      </div>
      <DataTable columns={columns} data={coupons} isLoading={loading} emptyMessage="No coupons" emptyIcon={Tag} />
      <Modal name="create-coupon" title="Create Coupon" size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Coupon Code" error={errors.code?.message} {...register('code')} />
          <Select label="Discount Type" options={[{ value: 'percentage', label: 'Percentage' }, { value: 'fixed', label: 'Fixed Amount' }]} error={errors.discountType?.message} {...register('discountType')} />
          <Input label="Discount Value" type="number" error={errors.discountValue?.message} {...register('discountValue')} />
          <Input label="Min Order Amount" type="number" {...register('minOrderAmount')} />
          <Input label="Max Uses" type="number" {...register('maxUses')} />
          <Input label="Expires At" type="datetime-local" error={errors.expiresAt?.message} {...register('expiresAt')} />
          <Button type="submit" fullWidth variant="gradient">Create Coupon</Button>
        </form>
      </Modal>
    </div>
  );
}
