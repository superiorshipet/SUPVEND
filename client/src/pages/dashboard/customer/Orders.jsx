import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Eye } from 'lucide-react';
import { orderAPI } from '@/api/endpoints';
import DataTable from '@/components/ui/DataTable';
import Pagination from '@/components/ui/Pagination';
import Badge from '@/components/ui/Badge';
import { usePagination } from '@/hooks/usePagination';
import { formatCurrency, formatDate, getStatusColor } from '@/utils/helpers';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { page, totalPages, setPage, updateMeta } = usePagination();

  useEffect(() => {
    setLoading(true);
    orderAPI.getMyOrders({ page, limit: 10 }).then((res) => {
      const d = res.data?.data || res.data;
      setOrders(d?.orders || []);
      updateMeta({ totalPages: d?.totalPages, total: d?.total });
    }).catch(() => {}).finally(() => setLoading(false));
  }, [page]);

  const columns = [
    { key: 'orderNumber', label: 'Order #', render: (v) => <span className="font-mono text-xs">{v || '—'}</span> },
    { key: 'totalAmount', label: 'Total', render: (v) => <span className="font-semibold">{formatCurrency(v)}</span> },
    { key: 'status', label: 'Status', render: (v) => <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(v)}`}>{v}</span> },
    { key: 'createdAt', label: 'Date', render: (v) => formatDate(v) },
    { key: '_id', label: '', render: (v) => <Link to={`/dashboard/orders/${v}`} className="text-primary-600 hover:underline"><Eye className="h-4 w-4" /></Link> },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold text-surface-900 dark:text-white mb-6">My Orders</h2>
      <DataTable columns={columns} data={orders} isLoading={loading} emptyMessage="No orders yet" emptyIcon={Package} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
