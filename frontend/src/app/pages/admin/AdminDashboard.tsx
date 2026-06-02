import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { adminApi } from '../../../services/api';
import { Users, Store, Package, ShoppingBag, DollarSign, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await adminApi.getOverview();
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full size-12 border-b-2 border-[#4F46E5]"></div>
      </div>
    );
  }

  const statCards = [
    { icon: Users, label: 'Total Users', value: stats?.users?.total || 0, color: 'text-blue-600', bg: 'bg-blue-100' },
    { icon: Store, label: 'Active Vendors', value: stats?.vendors?.active || 0, color: 'text-green-600', bg: 'bg-green-100' },
    { icon: Package, label: 'Total Products', value: stats?.products?.total || 0, color: 'text-purple-600', bg: 'bg-purple-100' },
    { icon: ShoppingBag, label: 'Total Orders', value: stats?.orders?.total || 0, color: 'text-orange-600', bg: 'bg-orange-100' },
    { icon: DollarSign, label: 'Total Revenue', value: `$${stats?.revenue?.total?.toFixed(2) || '0.00'}`, color: 'text-green-600', bg: 'bg-green-100' },
    { icon: TrendingUp, label: 'Monthly Revenue', value: `$${stats?.revenue?.monthly?.toFixed(2) || '0.00'}`, color: 'text-indigo-600', bg: 'bg-indigo-100' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage your platform, users, vendors, and orders</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`${stat.bg} p-3 rounded-lg`}>
                    <Icon className={`size-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 text-center py-8">Activity feed coming soon</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">• Manage users and vendors</p>
              <p className="text-sm text-gray-600">• Review and moderate products</p>
              <p className="text-sm text-gray-600">• Process vendor payouts</p>
              <p className="text-sm text-gray-600">• Create platform-wide coupons</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
