import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { adminApi } from '../../../services/api';
import { Button } from '../../components/ui/Button';
import { Download, TrendingUp, DollarSign, Package, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

export default function ReportsPage() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      const params: any = {};
      if (dateRange.start) params.startDate = dateRange.start;
      if (dateRange.end) params.endDate = dateRange.end;
      const response = await adminApi.getSalesReport(params);
      setReport(response.data.data);
    } catch (error) {
      console.error('Error fetching report:', error);
      toast.error('Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (!report?.dailyReport) return;
    
    const headers = ['Date', 'Sales', 'Orders'];
    const rows = report.dailyReport.map((day: any) => [day._id, day.totalSales, day.orderCount]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report exported');
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full size-12 border-b-2 border-[#4F46E5]"></div>
      </div>
    );
  }

  const summary = report?.summary || { totalRevenue: 0, totalOrders: 0, averageOrderValue: 0 };
  const dailyReport = report?.dailyReport || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center flex-wrap gap-3">
            <CardTitle>Sales Reports</CardTitle>
            <div className="flex gap-3">
              <input
                type="date"
                className="border rounded-lg px-3 py-2"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              />
              <input
                type="date"
                className="border rounded-lg px-3 py-2"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              />
              <Button onClick={fetchReport}>Apply</Button>
              <Button variant="outline" onClick={exportCSV}>
                <Download className="size-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <DollarSign className="size-8 mx-auto text-blue-600 mb-2" />
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-blue-600">${summary.totalRevenue.toFixed(2)}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <ShoppingBag className="size-8 mx-auto text-green-600 mb-2" />
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-green-600">{summary.totalOrders}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <TrendingUp className="size-8 mx-auto text-purple-600 mb-2" />
              <p className="text-sm text-gray-600">Average Order Value</p>
              <p className="text-2xl font-bold text-purple-600">${summary.averageOrderValue.toFixed(2)}</p>
            </div>
          </div>

          <h3 className="font-semibold text-lg mb-3">Daily Breakdown</h3>
          {dailyReport.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No sales data for selected period</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Sales ($)</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Orders</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Avg Order</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {dailyReport.map((day: any) => (
                    <tr key={day._id}>
                      <td className="px-4 py-3">{day._id}</td>
                      <td className="px-4 py-3 font-medium text-green-600">${day.totalSales.toFixed(2)}</td>
                      <td className="px-4 py-3">{day.orderCount}</td>
                      <td className="px-4 py-3">${(day.totalSales / day.orderCount).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
