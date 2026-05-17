import { Link } from 'react-router';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { cartApi, couponsApi } from '../../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

export default function CartPage() {
  const { items, subtotal, total, discount, updateQuantity, removeItem, clearCart, setCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await cartApi.get();
      const cart = response.data.data.cart;
      if (cart.items && cart.items.length > 0) {
        const cartItems = cart.items.map((item: any) => ({
          id: item._id,
          productId: item.productId._id,
          productName: item.productId.name,
          productPrice: item.price,
          productImage: item.productId.images?.[0]?.url || 'https://placehold.co/200',
          quantity: item.quantity,
        }));
        setCart(cartItems);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    try {
      await cartApi.updateQuantity(itemId, quantity);
      updateQuantity(itemId, quantity);
      toast.success('Cart updated');
    } catch (error) {
      toast.error('Failed to update cart');
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await cartApi.remove(itemId);
      removeItem(itemId);
      toast.success('Item removed');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setApplyingCoupon(true);
    try {
      const response = await couponsApi.validate(couponCode, subtotal);
      if (response.data.data.valid) {
        await cartApi.applyCoupon(couponCode);
        toast.success('Coupon applied!');
        fetchCart();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid coupon');
    } finally {
      setApplyingCoupon(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <ShoppingBag className="size-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Start shopping to add items to your cart</p>
          <Link to="/products">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {items.map((item) => (
              <div key={item.id} className="p-6 border-b border-gray-200 last:border-b-0">
                <div className="flex gap-4">
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="size-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.productName}</h3>
                    <p className="text-lg font-bold text-gray-900 mt-2">
                      ${item.productPrice.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-4">
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-[#EF4444] hover:text-[#DC2626]"
                    >
                      <Trash2 className="size-5" />
                    </button>
                    <div className="flex items-center gap-2 border border-gray-300 rounded-lg">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="p-2 hover:bg-gray-100"
                      >
                        <Minus className="size-4" />
                      </button>
                      <span className="px-4 font-medium">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        className="p-2 hover:bg-gray-100"
                      >
                        <Plus className="size-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
            <h2 className="font-semibold text-gray-900 mb-4">Order Summary</h2>

            <div className="mb-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
                <Button onClick={handleApplyCoupon} disabled={applyingCoupon} variant="outline">
                  Apply
                </Button>
              </div>
            </div>

            <div className="space-y-3 border-t border-gray-200 pt-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-[#10B981]">
                  <span>Discount</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-gray-900 text-lg">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <Link to="/checkout">
              <Button className="w-full mt-6" size="lg">
                Proceed to Checkout
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
