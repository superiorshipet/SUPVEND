import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Package, Heart, Wallet, Gavel, TrendingUp, ShoppingBag, DollarSign } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { useAuthStore } from '../../../store/authStore';
import { ordersApi, walletApi } from '../../../services/api';
import { Button } from '../../components/ui/Button';
import { toast } from 'sonner';

export default function CustomerDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    totalOrders: 0,
    activeOrders: 0,
    walletBalance: 0,
    wishlistCount: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [ordersRes, walletRes] = await Promise.all([
        ordersApi.getMyOrders({ limit: 5 }),
        walletApi.get(),
      ]);

      const orders = ordersRes.data.orders || [];
      setRecentOrders(orders);
      setStats({
        totalOrders: ordersRes.data.total || 0,
        activeOrders: orders.filter((o: any) => 
          o.status === 'pending' || o.status === 'processing'
        ).length,
        walletBalance: walletRes.data.data.wallet.balance || 0,
        wishlistCount: 0, // Implement wishlist API later
      });
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      icon: Package,
      label: 'Total Orders',
      value: stats.totalOrders,
      color: 'text-[#4F46E5]',
      bgColor: 'bg-[#4F46E5]/10',
      link: '/dashboard/orders',
    },
    {
      icon: TrendingUp,
      label: 'Active Orders',
      value: stats.activeOrders,
      color: 'text-[#10B981]',
      bgColor: 'bg-[#10B981]/10',
      link: '/dashboard/orders?status=pending',
    },
    {
      icon: Wallet,
      label: 'Wallet Balance',
      value: `$${stats.walletBalance.toFixed(2)}`,
      color: 'text-[#F59E0B]',
      bgColor: 'bg-[#F59E0B]/10',
      link: '/dashboard/wallet',
    },
    {
      icon: Heart,
      label: 'Wishlist',
      value: stats.wishlistCount,
      color: 'text-[#EF4444]',
      bgColor: 'bg-[#EF4444]/10',
      link: '/dashboard/wishlist',
    },
  ];

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

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full size-12 border-b-2 border-[#4F46E5]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back, {user?.name}!</h1>
        <p className="text-gray-600">Here's what's happening with your account today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link to={stat.link} key={stat.label}>
              <Card variant="bordered" className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={`${stat.bgColor} p-3 rounded-lg`}>
                      <Icon className={`size-6 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="bordered">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Recent Orders</CardTitle>
              <Link to="/dashboard/orders">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No orders yet</p>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <Link to={`/dashboard/orders/${order._id}`} key={order._id}>
                    <div className="flex justify-between items-center pb-4 border-b border-gray-200 last:border-b-0 last:pb-0 hover:bg-gray-50 p-2 rounded-lg transition-colors">
                      <div>
                        <p className="font-medium text-gray-900">{order.orderNumber}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">${order.total.toFixed(2)}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(order.items[0]?.status)}`}>
                          {order.items[0]?.status || 'pending'}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Link to="/products">
                <button className="w-full p-4 border border-gray-200 rounded-lg hover:border-[#4F46E5] hover:bg-[#4F46E5]/5 transition-colors text-center">
                  <ShoppingBag className="size-6 mx-auto mb-2 text-[#4F46E5]" />
                  <p className="text-sm font-medium text-gray-900">Shop Now</p>
                </button>
              </Link>
              <Link to="/dashboard/wallet">
                <button className="w-full p-4 border border-gray-200 rounded-lg hover:border-[#F59E0B] hover:bg-[#F59E0B]/5 transition-colors text-center">
                  <DollarSign className="size-6 mx-auto mb-2 text-[#F59E0B]" />
                  <p className="text-sm font-medium text-gray-900">Add Funds</p>
                </button>
              </Link>
              <Link to="/auctions">
                <button className="w-full p-4 border border-gray-200 rounded-lg hover:border-[#10B981] hover:bg-[#10B981]/5 transition-colors text-center">
                  <Gavel className="size-6 mx-auto mb-2 text-[#10B981]" />
                  <p className="text-sm font-medium text-gray-900">Live Auctions</p>
                </button>
              </Link>
              <Link to="/dashboard/wishlist">
                <button className="w-full p-4 border border-gray-200 rounded-lg hover:border-[#EF4444] hover:bg-[#EF4444]/5 transition-colors text-center">
                  <Heart className="size-6 mx-auto mb-2 text-[#EF4444]" />
                  <p className="text-sm font-medium text-gray-900">Wishlist</p>
                </button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
