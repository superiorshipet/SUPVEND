import { useState, useEffect } from 'react';
import { DollarSign, Package, ShoppingCart, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { vendorDashboardAPI } from '@/api/endpoints';
import StatsCard from '@/components/ui/StatsCard';
import Card from '@/components/ui/Card';
import { DashboardCardSkeleton } from '@/components/ui/Skeleton';
import { formatCurrency } from '@/utils/helpers';

export default function Overview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    vendorDashboardAPI.getOverview().then((res) => setData(res.data?.data || res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const stats = [
    { title: 'Total Revenue', value: formatCurrency(data?.totalRevenue || 0), icon: DollarSign, color: 'success', trend: 'up', trendValue: '+12%' },
    { title: 'Total Products', value: data?.totalProducts || 0, icon: Package, color: 'primary', trend: 'up', trendValue: '+5' },
    { title: 'Total Orders', value: data?.totalOrders || 0, icon: ShoppingCart, color: 'accent', trend: 'up', trendValue: '+18%' },
    { title: 'Conversion Rate', value: `${data?.conversionRate || 3.2}%`, icon: TrendingUp, color: 'warning', trend: 'up', trendValue: '+0.5%' },
  ];

  const chartData = data?.revenueChart || [
    { name: 'Jan', revenue: 4000 }, { name: 'Feb', revenue: 3000 }, { name: 'Mar', revenue: 5000 },
    { name: 'Apr', revenue: 4500 }, { name: 'May', revenue: 6000 }, { name: 'Jun', revenue: 5500 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? Array.from({ length: 4 }).map((_, i) => <DashboardCardSkeleton key={i} />) : stats.map((s) => <StatsCard key={s.title} {...s} />)}
      </div>
      <Card>
        <h3 className="font-semibold text-surface-900 dark:text-white mb-6">Revenue Overview</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
