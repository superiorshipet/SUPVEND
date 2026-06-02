import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { ordersApi } from '../../../services/api';
import { Button } from '../../components/ui/Button';
import { Package, Truck, CheckCircle, XCircle, Clock, MapPin, CreditCard } from 'lucide-react';

export default function OrderDetailsPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await ordersApi.getById(id!);
      setOrder(response.data.data.order);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="size-5 text-yellow-500" />;
      case 'processing': return <Package className="size-5 text-blue-500" />;
      case 'shipped': return <Truck className="size-5 text-purple-500" />;
      case 'delivered': return <CheckCircle className="size-5 text-green-500" />;
      case 'cancelled': return <XCircle className="size-5 text-red-500" />;
      default: return <Package className="size-5 text-gray-500" />;
    }
  };

  const getStatusSteps = () => {
    const steps = ['pending', 'processing', 'shipped', 'delivered'];
    const currentStatus = order?.items?.[0]?.status || 'pending';
    const currentIndex = steps.indexOf(currentStatus);
    
    return steps.map((step, index) => ({
      name: step.charAt(0).toUpperCase() + step.slice(1),
      completed: index <= currentIndex,
      active: index === currentIndex,
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full size-12 border-b-2 border-[#4F46E5]"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-gray-500">Order not found</p>
          <Link to="/dashboard/orders">
            <Button className="mt-4">Back to Orders</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
          <p className="text-gray-500">
            Placed on {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
        <Link to="/dashboard/orders">
          <Button variant="outline">Back to Orders</Button>
        </Link>
      </div>

      {/* Status Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Order Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            {getStatusSteps().map((step, index) => (
              <div key={step.name} className="flex-1 text-center relative">
                <div className={`relative z-10 ${step.completed ? 'text-green-500' : 'text-gray-400'}`}>
                  <div className="flex justify-center mb-2">
                    {getStatusIcon(step.name.toLowerCase())}
                  </div>
                  <p className={`text-sm font-medium ${step.active ? 'text-gray-900' : 'text-gray-500'}`}>
                    {step.name}
                  </p>
                </div>
                {index < 3 && (
                  <div className={`absolute top-3 left-1/2 w-full h-0.5 -z-0 ${
                    step.completed ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items?.map((item: any) => (
                  <div key={item._id} className="flex gap-4 pb-4 border-b last:border-b-0">
                    <img
                      src={item.productImage || 'https://placehold.co/80'}
                      alt={item.productName}
                      className="size-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.productName}</p>
                      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                      <p className="text-sm text-gray-500">Price: ${item.price?.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">${item.total?.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${order.subtotal?.toFixed(2)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-${order.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>${order.shippingCost?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-bold">
                  <span>Total</span>
                  <span>${order.total?.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="size-4" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{order.shippingAddress?.fullName}</p>
              <p className="text-sm text-gray-600">{order.shippingAddress?.street}</p>
              <p className="text-sm text-gray-600">
                {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}
              </p>
              <p className="text-sm text-gray-600">{order.shippingAddress?.country}</p>
              <p className="text-sm text-gray-600 mt-2">Phone: {order.shippingAddress?.phone}</p>
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="size-4" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="capitalize">{order.paymentMethod}</p>
              <p className={`text-sm mt-1 ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                Status: {order.paymentStatus}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
