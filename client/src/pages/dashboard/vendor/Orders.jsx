import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Eye } from 'lucide-react';
import { orderAPI } from '@/api/endpoints';
import DataTable from '@/components/ui/DataTable';
import Pagination from '@/components/ui/Pagination';
import Select from '@/components/ui/Select';
import { usePagination } from '@/hooks/usePagination';
import { formatCurrency, formatDate, getStatusColor } from '@/utils/helpers';
import toast from 'react-hot-toast';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { page, totalPages, setPage, updateMeta } = usePagination();

  useEffect(() => {
    setLoading(true);
    orderAPI.getVendorOrders({ page, limit: 10 }).then((r) => {
      const d = r.data?.data || r.data;
      setOrders(d?.orders || []);
      updateMeta({ totalPages: d?.totalPages, total: d?.total });
    }).catch(() => {}).finally(() => setLoading(false));
  }, [page]);

  const handleStatusUpdate = async (orderId, status) => {
    try { await orderAPI.updateStatus(orderId, { status }); toast.success('Status updated'); setOrders((o) => o.map((x) => x._id === orderId ? { ...x, status } : x)); } catch (e) { toast.error('Failed'); }
  };

  const columns = [
    { key: 'orderNumber', label: 'Order #', render: (v) => <span className="font-mono text-xs">{v || '—'}</span> },
    { key: 'customer', label: 'Customer', render: (v) => v?.name || '—' },
    { key: 'totalAmount', label: 'Total', render: (v) => <span className="font-semibold">{formatCurrency(v)}</span> },
    { key: 'status', label: 'Status', render: (v, row) => (
      <select value={v} onChange={(e) => handleStatusUpdate(row._id, e.target.value)} className="text-xs px-2 py-1 rounded-lg border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 cursor-pointer">
        {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
    )},
    { key: 'createdAt', label: 'Date', render: (v) => formatDate(v) },
    { key: '_id', label: '', render: (v) => <Link to={`/vendor/orders/${v}`}><Eye className="h-4 w-4 text-primary-600" /></Link> },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold text-surface-900 dark:text-white mb-6">Orders</h2>
      <DataTable columns={columns} data={orders} isLoading={loading} emptyMessage="No orders" emptyIcon={ShoppingCart} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
