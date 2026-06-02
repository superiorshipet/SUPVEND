import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { api } from '../../../services/api';
import { Button } from '../../components/ui/Button';
import { Eye, CheckCircle, XCircle, Package, Truck } from 'lucide-react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { useAuthStore } from '../../../store/authStore';

export default function AllOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const { token } = useAuthStore();

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const fetchAllOrders = async () => {
    try {
      const response = await api.get('/orders/admin/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data.data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, productId: string, newStatus: string) => {
    setUpdating(orderId);
    try {
      console.log('Updating order:', { orderId, productId, newStatus });
      
      const response = await api.patch(`/orders/admin/orders/${orderId}/status`,
        { productId, status: newStatus, note: `Status updated to ${newStatus} by admin` },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success(`Order status updated to ${newStatus}`);
      fetchAllOrders();
    } catch (error: any) {
      console.error('Error updating order:', error);
      toast.error(error.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdating(null);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getAvailableActions = (currentStatus: string) => {
    const actions = [];
    if (currentStatus === 'pending') {
      actions.push({ label: 'Process', status: 'processing', icon: Package, color: 'blue' });
      actions.push({ label: 'Cancel', status: 'cancelled', icon: XCircle, color: 'red' });
    }
    if (currentStatus === 'processing') {
      actions.push({ label: 'Ship', status: 'shipped', icon: Truck, color: 'purple' });
    }
    if (currentStatus === 'shipped') {
      actions.push({ label: 'Deliver', status: 'delivered', icon: CheckCircle, color: 'green' });
    }
    return actions;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full size-12 border-b-2 border-[#4F46E5]"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Orders ({orders.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No orders yet</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 p-4 flex justify-between items-center flex-wrap gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">{order.orderNumber}</p>
                    <p className="text-sm text-gray-500">
                      {order.userId?.name} • {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.items?.[0]?.status)}`}>
                      {order.items?.[0]?.status || 'pending'}
                    </span>
                    <span className="font-bold text-gray-900">${order.total?.toFixed(2)}</span>
                    <Link to={`/dashboard/orders/${order._id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="size-4" />
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex gap-4 overflow-x-auto">
                    {order.items?.map((item: any) => (
                      <div key={item._id} className="flex items-center gap-3 border-r pr-4 last:border-r-0">
                        <img
                          src={item.productImage || 'https://placehold.co/60'}
                          alt={item.productName}
                          className="size-16 object-cover rounded"
                        />
                        <div>
                          <p className="font-medium text-sm">{item.productName}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                          <p className="text-sm font-medium">${item.total?.toFixed(2)}</p>
                          <div className="flex gap-2 mt-2">
                            {getAvailableActions(item.status).map((action) => {
                              const Icon = action.icon;
                              return (
                                <button
                                  key={action.status}
                                  onClick={() => updateOrderStatus(order._id, item.productId, action.status)}
                                  disabled={updating === order._id}
                                  className={`text-${action.color}-600 hover:bg-${action.color}-50 px-2 py-1 rounded text-xs flex items-center gap-1 transition-colors border`}
                                >
                                  <Icon className="size-3" />
                                  {action.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
