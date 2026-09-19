import { useState, useEffect } from 'react';
import { Users, Package, ShoppingCart, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { adminDashboardAPI } from '@/api/endpoints';
import StatsCard from '@/components/ui/StatsCard';
import Card from '@/components/ui/Card';
import { DashboardCardSkeleton } from '@/components/ui/Skeleton';
import { formatCurrency } from '@/utils/helpers';

const COLORS = ['#3b82f6', '#d946ef', '#22c55e', '#f59e0b', '#ef4444'];

export default function Overview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminDashboardAPI.getOverview().then((r) => setData(r.data?.data || r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const stats = [
    { title: 'Total Users', value: data?.totalUsers || 0, icon: Users, color: 'primary', trend: 'up', trendValue: '+24' },
    { title: 'Total Products', value: data?.totalProducts || 0, icon: Package, color: 'accent', trend: 'up', trendValue: '+12' },
    { title: 'Total Orders', value: data?.totalOrders || 0, icon: ShoppingCart, color: 'success', trend: 'up', trendValue: '+8%' },
    { title: 'Revenue', value: formatCurrency(data?.totalRevenue || 0), icon: DollarSign, color: 'warning', trend: 'up', trendValue: '+15%' },
  ];

  const barData = data?.salesChart || [
    { name: 'Jan', sales: 4000 }, { name: 'Feb', sales: 3000 }, { name: 'Mar', sales: 5000 },
    { name: 'Apr', sales: 4500 }, { name: 'May', sales: 6000 }, { name: 'Jun', sales: 5500 },
  ];
  const pieData = data?.categoryBreakdown || [
    { name: 'Electronics', value: 35 }, { name: 'Fashion', value: 25 }, { name: 'Home', value: 20 },
    { name: 'Sports', value: 12 }, { name: 'Other', value: 8 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? Array.from({ length: 4 }).map((_, i) => <DashboardCardSkeleton key={i} />) : stats.map((s) => <StatsCard key={s.title} {...s} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <h3 className="font-semibold text-surface-900 dark:text-white mb-6">Sales Overview</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <h3 className="font-semibold text-surface-900 dark:text-white mb-6">By Category</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {pieData.map((d, i) => (
              <span key={d.name} className="flex items-center gap-1 text-xs text-surface-600 dark:text-surface-400">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />{d.name}
              </span>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
