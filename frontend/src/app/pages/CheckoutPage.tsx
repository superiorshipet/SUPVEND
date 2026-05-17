import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { ordersApi, walletApi } from '../../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, total, fetchCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [address, setAddress] = useState({
    fullName: '',
    street: '',
    city: '',
    state: '',
    country: 'Egypt',
    zipCode: '',
    phone: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchCart();
    fetchWalletBalance();
  }, [isAuthenticated]);

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
    
    if (items.length === 0) {
      toast.error('Your cart is empty');
      navigate('/cart');
      return;
    }

    if (total > walletBalance) {
      toast.error(`Insufficient wallet balance. Available: $${walletBalance.toFixed(2)}`);
      return;
    }

    setLoading(true);
    try {
      const response = await ordersApi.create({
        paymentMethod: 'wallet',
        shippingAddress: address,
      });

      toast.success('Order placed successfully!');
      navigate(`/dashboard/orders/${response.data.data.order._id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  // Refresh cart to ensure we have latest items
  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-500">Your cart is empty</p>
        <Button onClick={() => navigate('/cart')} className="mt-4">Back to Cart</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Full Name" 
              required 
              value={address.fullName} 
              onChange={(e) => setAddress({...address, fullName: e.target.value})} 
            />
            <Input 
              label="Phone" 
              required 
              value={address.phone} 
              onChange={(e) => setAddress({...address, phone: e.target.value})} 
            />
            <Input 
              label="Street" 
              required 
              className="md:col-span-2" 
              value={address.street} 
              onChange={(e) => setAddress({...address, street: e.target.value})} 
            />
            <Input 
              label="City" 
              required 
              value={address.city} 
              onChange={(e) => setAddress({...address, city: e.target.value})} 
            />
            <Input 
              label="State" 
              required 
              value={address.state} 
              onChange={(e) => setAddress({...address, state: e.target.value})} 
            />
            <Input 
              label="ZIP Code" 
              required 
              value={address.zipCode} 
              onChange={(e) => setAddress({...address, zipCode: e.target.value})} 
            />
            <Input 
              label="Country" 
              required 
              value={address.country} 
              onChange={(e) => setAddress({...address, country: e.target.value})} 
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span>{item.productName} x{item.quantity}</span>
                <span>${(item.productPrice * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between mb-2">
            <span>Wallet Balance:</span>
            <span className="font-bold">${walletBalance.toFixed(2)}</span>
          </div>
          {total > walletBalance && (
            <p className="text-red-500 text-sm mt-2">Insufficient balance. Please add funds.</p>
          )}
        </div>

        <Button type="submit" loading={loading} className="w-full" size="lg" disabled={total > walletBalance}>
          Place Order (${total.toFixed(2)})
        </Button>
      </form>
    </div>
  );
}
