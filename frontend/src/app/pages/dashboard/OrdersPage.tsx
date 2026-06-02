import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { ordersApi } from '../../../services/api';
import { Button } from '../../components/ui/Button';
import { Package } from 'lucide-react';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await ordersApi.getMyOrders();
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
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
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full size-12 border-b-2 border-[#4F46E5]"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Orders</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Package className="size-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">No orders yet</p>
          <Link to="/products">
            <Button className="mt-4">Start Shopping</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Orders ({orders.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.map((order) => (
            <Link to={`/dashboard/orders/${order._id}`} key={order._id}>
              <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-900">{order.orderNumber}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">${order.total?.toFixed(2)}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.items?.[0]?.status)}`}>
                      {order.items?.[0]?.status || 'pending'}
                    </span>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  {order.items?.slice(0, 3).map((item: any) => (
                    <div key={item._id} className="flex items-center gap-2">
                      <img src={item.productImage || 'https://placehold.co/40'} className="size-10 object-cover rounded" />
                      <span className="text-sm text-gray-600">{item.productName}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
