import { useState, useEffect } from 'react';
import { FileText, Download } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { adminDashboardAPI } from '@/api/endpoints';
import Card from '@/components/ui/Card';
import StatsCard from '@/components/ui/StatsCard';
import { DashboardCardSkeleton } from '@/components/ui/Skeleton';
import { formatCurrency } from '@/utils/helpers';

export default function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminDashboardAPI.getSalesReports().then((r) => setData(r.data?.data || r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const chartData = data?.chart || [
    { name: 'Week 1', sales: 12000 }, { name: 'Week 2', sales: 15000 },
    { name: 'Week 3', sales: 13000 }, { name: 'Week 4', sales: 18000 },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-surface-900 dark:text-white">Sales Reports</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {loading ? Array.from({ length: 3 }).map((_, i) => <DashboardCardSkeleton key={i} />) : (
          <>
            <StatsCard title="Total Sales" value={formatCurrency(data?.totalSales || 0)} color="success" />
            <StatsCard title="Total Orders" value={data?.totalOrders || 0} color="primary" />
            <StatsCard title="Avg Order Value" value={formatCurrency(data?.avgOrderValue || 0)} color="accent" />
          </>
        )}
      </div>
      <Card>
        <h3 className="font-semibold text-surface-900 dark:text-white mb-6">Sales Trend</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
