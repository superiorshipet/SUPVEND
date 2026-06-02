import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { vendorApi, api } from '../../../services/api';
import { Button } from '../../components/ui/Button';
import { Eye, Package, Truck, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '../../../store/authStore';

export default function VendorOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuthStore();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await vendorApi.getOrders();
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: string, productId: string, newStatus: string) => {
    try {
      await api.patch(`/orders/vendor/orders/${orderId}/status`,
        { productId, status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update status');
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
        <CardTitle>My Store Orders ({orders.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No orders yet</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 p-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{order.orderNumber}</p>
                    <p className="text-sm text-gray-500">{order.userId?.name} • {new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.items?.[0]?.status)}`}>
                    {order.items?.[0]?.status}
                  </span>
                </div>
                <div className="p-4">
                  {order.items?.map((item: any) => (
                    <div key={item._id} className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <img src={item.productImage || 'https://placehold.co/60'} className="size-16 object-cover rounded" />
                        <div>
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity} • ${item.total}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {item.status === 'pending' && (
                          <button onClick={() => updateStatus(order._id, item.productId, 'processing')} className="bg-blue-500 text-white px-3 py-1 rounded text-sm">
                            <Package className="size-4 inline" /> Process
                          </button>
                        )}
                        {item.status === 'processing' && (
                          <button onClick={() => updateStatus(order._id, item.productId, 'shipped')} className="bg-purple-500 text-white px-3 py-1 rounded text-sm">
                            <Truck className="size-4 inline" /> Ship
                          </button>
                        )}
                        {item.status === 'shipped' && (
                          <button onClick={() => updateStatus(order._id, item.productId, 'delivered')} className="bg-green-500 text-white px-3 py-1 rounded text-sm">
                            <CheckCircle className="size-4 inline" /> Deliver
                          </button>
                        )}
                        <Link to={`/dashboard/orders/${order._id}`}>
                          <button className="border px-3 py-1 rounded text-sm"><Eye className="size-4 inline" /> View</button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
