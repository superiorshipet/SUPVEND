import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Package, MapPin, CreditCard, Clock } from 'lucide-react';
import { orderAPI } from '@/api/endpoints';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { formatCurrency, formatDate, getStatusColor } from '@/utils/helpers';
import toast from 'react-hot-toast';

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderAPI.getById(id).then((res) => setOrder(res.data?.data?.order || res.data?.data || res.data?.order)).catch(() => toast.error('Order not found')).finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    try { await orderAPI.cancel(id); toast.success('Order cancelled'); setOrder((o) => ({ ...o, status: 'cancelled' })); } catch (err) { toast.error(err.response?.data?.message || 'Cannot cancel'); }
  };

  if (loading) return <PageLoader />;
  if (!order) return <div className="text-center py-20 text-surface-500">Order not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-surface-900 dark:text-white">Order #{order.orderNumber || order._id?.slice(-8)}</h2>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>{order.status}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><div className="flex items-center gap-3"><Clock className="h-5 w-5 text-primary-500" /><div><p className="text-xs text-surface-500">Date</p><p className="font-medium text-surface-900 dark:text-white">{formatDate(order.createdAt)}</p></div></div></Card>
        <Card><div className="flex items-center gap-3"><CreditCard className="h-5 w-5 text-success-500" /><div><p className="text-xs text-surface-500">Total</p><p className="font-medium text-surface-900 dark:text-white">{formatCurrency(order.totalAmount)}</p></div></div></Card>
        <Card><div className="flex items-center gap-3"><MapPin className="h-5 w-5 text-accent-500" /><div><p className="text-xs text-surface-500">Shipping</p><p className="font-medium text-surface-900 dark:text-white text-sm">{order.shippingAddress?.city}, {order.shippingAddress?.country}</p></div></div></Card>
      </div>
      <Card>
        <h3 className="font-semibold text-surface-900 dark:text-white mb-4">Items</h3>
        <div className="space-y-3">
          {(order.items || []).map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-surface-50 dark:bg-surface-800/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-surface-200 dark:bg-surface-700 overflow-hidden">{item.product?.images?.[0] && <img src={item.product.images[0].url} className="w-full h-full object-cover" />}</div>
                <div><p className="font-medium text-surface-900 dark:text-white text-sm">{item.product?.name || 'Product'}</p><p className="text-xs text-surface-500">Qty: {item.quantity}</p></div>
              </div>
              <span className="font-semibold">{formatCurrency(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
      </Card>
      {order.status === 'pending' && <Button variant="danger" onClick={handleCancel}>Cancel Order</Button>}
    </div>
  );
}
