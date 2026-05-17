import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useCartStore } from '../../store/cartStore';
import { ordersApi, walletApi } from '../../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    street: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    phone: '',
  });

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
    fetchWalletBalance();
  }, [items.length, navigate]);

  const fetchWalletBalance = async () => {
    try {
      const response = await walletApi.get();
      setWalletBalance(response.data.data.wallet.balance);
    } catch (error) {
      console.error('Error fetching wallet:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (total > walletBalance) {
      toast.error(`Insufficient wallet balance. Available: $${walletBalance.toFixed(2)}`);
      return;
    }

    setLoading(true);
    try {
      const response = await ordersApi.create({
        paymentMethod: 'wallet',
        shippingAddress,
      });

      toast.success('Order placed successfully!');
      clearCart();
      navigate(`/dashboard/orders/${response.data.data.order._id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Shipping Address</h2>
            <div className="space-y-4">
              <Input
                label="Full Name"
                required
                value={shippingAddress.fullName}
                onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
              />
              <Input
                label="Street Address"
                required
                value={shippingAddress.street}
                onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="City"
                  required
                  value={shippingAddress.city}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                />
                <Input
                  label="State"
                  required
                  value={shippingAddress.state}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="ZIP Code"
                  required
                  value={shippingAddress.zipCode}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, zipCode: e.target.value })}
                />
                <Input
                  label="Country"
                  required
                  value={shippingAddress.country}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                />
              </div>
              <Input
                label="Phone"
                required
                value={shippingAddress.phone}
                onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
              />
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between mb-2">
                <span>Wallet Balance:</span>
                <span className="font-bold">${walletBalance.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>Order Total:</span>
                <span className="font-bold">${total.toFixed(2)}</span>
              </div>
              {total > walletBalance && (
                <p className="text-red-500 text-sm mt-2">Insufficient balance. Please add funds.</p>
              )}
            </div>

            <Button 
              type="submit" 
              loading={loading} 
              className="w-full mt-6" 
              size="lg"
              disabled={total > walletBalance}
            >
              Place Order (${total.toFixed(2)})
            </Button>
          </form>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
            <h2 className="font-semibold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.productName} x{item.quantity}</span>
                  <span>${(item.productPrice * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
