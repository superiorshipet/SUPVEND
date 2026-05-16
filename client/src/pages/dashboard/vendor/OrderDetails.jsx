import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { orderAPI } from '@/api/endpoints';
import Card from '@/components/ui/Card';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { formatCurrency, formatDate, getStatusColor } from '@/utils/helpers';

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderAPI.getById(id).then((r) => setOrder(r.data?.data?.order || r.data?.data)).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageLoader />;
  if (!order) return <div className="text-center py-20 text-surface-500">Order not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-surface-900 dark:text-white">Order #{order.orderNumber || order._id?.slice(-8)}</h2>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>{order.status}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card><p className="text-xs text-surface-500 mb-1">Customer</p><p className="font-medium text-surface-900 dark:text-white">{order.customer?.name || order.user?.name || '—'}</p></Card>
        <Card><p className="text-xs text-surface-500 mb-1">Total</p><p className="font-medium text-surface-900 dark:text-white">{formatCurrency(order.totalAmount)}</p></Card>
      </div>
      <Card>
        <h3 className="font-semibold text-surface-900 dark:text-white mb-4">Items</h3>
        <div className="space-y-3">
          {(order.items || []).map((item, i) => (
            <div key={i} className="flex justify-between p-3 rounded-lg bg-surface-50 dark:bg-surface-800/50">
              <span className="text-sm">{item.product?.name || 'Product'} × {item.quantity}</span>
              <span className="font-semibold">{formatCurrency(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
