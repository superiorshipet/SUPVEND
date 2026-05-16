import { useState, useEffect } from 'react';
import { Tag } from 'lucide-react';
import { couponAPI } from '@/api/endpoints';
import DataTable from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import { formatDate } from '@/utils/helpers';
import toast from 'react-hot-toast';

export default function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = () => { couponAPI.getAll().then((r) => setCoupons(r.data?.data?.coupons || r.data?.coupons || [])).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(fetch, []);

  const handleDelete = async (id) => { try { await couponAPI.delete(id); toast.success('Deleted'); fetch(); } catch { toast.error('Failed'); } };

  const columns = [
    { key: 'code', label: 'Code', render: (v) => <span className="font-mono font-semibold">{v}</span> },
    { key: 'discountType', label: 'Type', render: (v) => <Badge variant="primary">{v}</Badge> },
    { key: 'discountValue', label: 'Value', render: (v, row) => row.discountType === 'percentage' ? `${v}%` : `$${v}` },
    { key: 'expiresAt', label: 'Expires', render: (v) => formatDate(v) },
    { key: '_id', label: '', render: (v) => <button onClick={() => handleDelete(v)} className="text-xs text-danger-600 hover:underline cursor-pointer">Delete</button> },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold text-surface-900 dark:text-white mb-6">Coupons</h2>
      <DataTable columns={columns} data={coupons} isLoading={loading} emptyMessage="No coupons" emptyIcon={Tag} />
    </div>
  );
}
