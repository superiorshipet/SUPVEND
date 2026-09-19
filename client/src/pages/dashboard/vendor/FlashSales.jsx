import { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';
import { flashSaleAPI } from '@/api/endpoints';
import DataTable from '@/components/ui/DataTable';
import { formatCurrency, formatDate } from '@/utils/helpers';
import Badge from '@/components/ui/Badge';

export default function FlashSales() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    flashSaleAPI.getVendorSales().then((r) => setSales(r.data?.data?.flashSales || r.data?.flashSales || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const columns = [
    { key: 'product', label: 'Product', render: (v) => <span className="font-medium">{v?.name || '—'}</span> },
    { key: 'salePrice', label: 'Sale Price', render: (v) => formatCurrency(v) },
    { key: 'stock', label: 'Stock', render: (v) => v },
    { key: 'endTime', label: 'Ends', render: (v) => formatDate(v) },
    { key: 'status', label: 'Status', render: (v) => <Badge variant={v === 'active' ? 'success' : 'default'} dot>{v || 'active'}</Badge> },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold text-surface-900 dark:text-white mb-6">Flash Sales</h2>
      <DataTable columns={columns} data={sales} isLoading={loading} emptyMessage="No flash sales" emptyIcon={Zap} />
    </div>
  );
}
