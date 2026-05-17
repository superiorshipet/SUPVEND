import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { ordersApi } from '../../../services/api';
import { Button } from '../../components/ui/Button';
import { toast } from 'sonner';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      const params: any = { limit: 50 };
      if (statusFilter) params.status = statusFilter;
      const response = await ordersApi.getMyOrders(params);
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      pending: 'bg-[#F59E0B]/10 text-[#F59E0B]',
      processing: 'bg-[#4F46E5]/10 text-[#4F46E5]',
      shipped: 'bg-[#10B981]/10 text-[#10B981]',
      delivered: 'bg-[#10B981]/10 text-[#10B981]',
      cancelled: 'bg-[#EF4444]/10 text-[#EF4444]',
    };
    return badges[status] || 'bg-gray-100 text-gray-600';
  };

  const statuses = ['', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full size-12 border-b-2 border-[#4F46E5]"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center flex-wrap gap-4">
          <CardTitle>My Orders</CardTitle>
          <div className="flex gap-2">
            {statuses.map((status) => (
              <Button
                key={status || 'all'}
                variant={statusFilter === status ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(status)}
              >
                {status || 'All'}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No orders found</p>
            <Link to="/products">
              <Button>Start Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link to={`/dashboard/orders/${order._id}`} key={order._id}>
                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">{order.orderNumber}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">${order.total.toFixed(2)}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(order.items[0]?.status)}`}>
                        {order.items[0]?.status || 'pending'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    {order.items.slice(0, 3).map((item: any) => (
                      <div key={item._id} className="flex items-center gap-2">
                        <img
                          src={item.productImage || 'https://placehold.co/50'}
                          alt={item.productName}
                          className="size-12 object-cover rounded"
                        />
                        <span className="text-sm text-gray-600">{item.productName}</span>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <span className="text-sm text-gray-500">+{order.items.length - 3} more</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
