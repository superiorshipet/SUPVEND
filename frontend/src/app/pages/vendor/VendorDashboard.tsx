import { Link } from 'react-router';
import { DollarSign, Package, ShoppingBag, TrendingUp, Plus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export default function VendorDashboard() {
  const stats = [
    {
      icon: DollarSign,
      label: 'Total Revenue',
      value: '$12,450',
      change: '+15%',
      color: 'text-[#10B981]',
      bgColor: 'bg-[#10B981]/10',
    },
    {
      icon: ShoppingBag,
      label: 'Total Orders',
      value: '156',
      change: '+8%',
      color: 'text-[#4F46E5]',
      bgColor: 'bg-[#4F46E5]/10',
    },
    {
      icon: Package,
      label: 'Products',
      value: '42',
      change: '+3',
      color: 'text-[#F59E0B]',
      bgColor: 'bg-[#F59E0B]/10',
    },
    {
      icon: TrendingUp,
      label: 'Available Balance',
      value: '$3,240',
      change: '',
      color: 'text-[#EF4444]',
      bgColor: 'bg-[#EF4444]/10',
    },
  ];

  const recentOrders = [
    { id: '1', orderNumber: 'ORD-501', customer: 'John Doe', total: 149.99, status: 'Processing' },
    { id: '2', orderNumber: 'ORD-502', customer: 'Jane Smith', total: 89.99, status: 'Shipped' },
    { id: '3', orderNumber: 'ORD-503', customer: 'Bob Wilson', total: 299.99, status: 'Pending' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Vendor Dashboard</h1>
          <p className="text-gray-600">Monitor your store performance and manage your business</p>
        </div>
        <Link to="/vendor/products/add">
          <Button>
            <Plus className="size-5" />
            Add Product
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} variant="bordered">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className={`${stat.bgColor} p-3 rounded-lg`}>
                    <Icon className={`size-6 ${stat.color}`} />
                  </div>
                  {stat.change && (
                    <span className="text-sm font-medium text-[#10B981]">{stat.change}</span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card variant="bordered" className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Recent Orders</CardTitle>
              <Link to="/vendor/orders">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex justify-between items-center pb-4 border-b border-gray-200 last:border-b-0 last:pb-0">
                  <div>
                    <p className="font-medium text-gray-900">{order.orderNumber}</p>
                    <p className="text-sm text-gray-500">{order.customer}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">${order.total.toFixed(2)}</p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        order.status === 'Shipped'
                          ? 'bg-[#10B981]/10 text-[#10B981]'
                          : order.status === 'Processing'
                          ? 'bg-[#4F46E5]/10 text-[#4F46E5]'
                          : 'bg-[#F59E0B]/10 text-[#F59E0B]'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link to="/vendor/products/add">
                <Button variant="outline" className="w-full justify-start">
                  <Package className="size-5" />
                  Add New Product
                </Button>
              </Link>
              <Link to="/vendor/flash-sales">
                <Button variant="outline" className="w-full justify-start">
                  Create Flash Sale
                </Button>
              </Link>
              <Link to="/vendor/auctions">
                <Button variant="outline" className="w-full justify-start">
                  Create Auction
                </Button>
              </Link>
              <Link to="/vendor/payouts">
                <Button variant="outline" className="w-full justify-start">
                  <DollarSign className="size-5" />
                  Request Payout
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
