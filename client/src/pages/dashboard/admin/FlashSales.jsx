import { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';
import { flashSaleAPI } from '@/api/endpoints';
import DataTable from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/utils/helpers';
import toast from 'react-hot-toast';

export default function FlashSales() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = () => { flashSaleAPI.adminGetAll().then((r) => setSales(r.data?.data?.flashSales || r.data?.flashSales || [])).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(fetch, []);

  const handleCancel = async (id) => { try { await flashSaleAPI.cancel(id); toast.success('Cancelled'); fetch(); } catch { toast.error('Failed'); } };

  const columns = [
    { key: 'product', label: 'Product', render: (v) => <span className="font-medium">{v?.name || '—'}</span> },
    { key: 'salePrice', label: 'Price', render: (v) => formatCurrency(v) },
    { key: 'stock', label: 'Stock' },
    { key: 'endTime', label: 'Ends', render: (v) => formatDate(v) },
    { key: 'status', label: 'Status', render: (v) => <Badge variant={v === 'active' ? 'success' : 'default'} dot>{v || 'active'}</Badge> },
    { key: '_id', label: '', render: (v) => <button onClick={() => handleCancel(v)} className="text-xs text-danger-600 hover:underline cursor-pointer">Cancel</button> },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold text-surface-900 dark:text-white mb-6">Flash Sales</h2>
      <DataTable columns={columns} data={sales} isLoading={loading} emptyMessage="No flash sales" emptyIcon={Zap} />
    </div>
  );
}
