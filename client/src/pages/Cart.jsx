import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Trash2, Minus, Plus, ShoppingBag, Tag, ArrowRight } from 'lucide-react';
import { fetchCart, updateCartItem, removeCartItem, applyCoupon, removeCoupon, clearCart } from '@/store/slices/cartSlice';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { formatCurrency } from '@/utils/helpers';
import toast from 'react-hot-toast';

export default function Cart() {
  const dispatch = useDispatch();
  const { items, totalAmount, coupon, discount, isLoading } = useSelector((s) => s.cart);
  const [couponCode, setCouponCode] = useState('');

  useEffect(() => { dispatch(fetchCart()); }, [dispatch]);

  const handleUpdateQty = (itemId, qty) => { if (qty >= 1) dispatch(updateCartItem({ itemId, quantity: qty })); };
  const handleRemove = (itemId) => { dispatch(removeCartItem(itemId)); toast.success('Item removed'); };
  const handleApplyCoupon = () => { if (couponCode.trim()) dispatch(applyCoupon({ code: couponCode })).then((r) => { if (r.meta.requestStatus === 'fulfilled') toast.success('Coupon applied!'); else toast.error(r.payload); }); };
  const handleClear = () => { dispatch(clearCart()); toast.success('Cart cleared'); };

  if (!isLoading && items.length === 0) return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <EmptyState icon={ShoppingBag} title="Your cart is empty" description="Looks like you haven't added anything to your cart yet." actionLabel="Start Shopping" onAction={() => window.location.href = '/shop'} />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-display font-bold text-surface-900 dark:text-white mb-8">Shopping Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <motion.div key={item._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex gap-4 p-4 bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800">
              <div className="w-24 h-24 rounded-lg bg-surface-100 dark:bg-surface-800 overflow-hidden shrink-0">
                {item.product?.images?.[0] ? <img src={item.product.images[0].url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="h-8 w-8 text-surface-300" /></div>}
              </div>
              <div className="flex-1 min-w-0">
                <Link to={`/products/${item.product?._id}`} className="font-medium text-surface-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 line-clamp-1">{item.product?.name}</Link>
                <p className="text-sm text-surface-500 mt-1">{item.product?.vendor?.storeName}</p>
                <p className="font-bold text-surface-900 dark:text-white mt-2">{formatCurrency(item.price)}</p>
              </div>
              <div className="flex flex-col items-end justify-between">
                <button onClick={() => handleRemove(item._id)} className="p-1.5 text-surface-400 hover:text-danger-500 cursor-pointer"><Trash2 className="h-4 w-4" /></button>
                <div className="flex items-center border border-surface-300 dark:border-surface-600 rounded-lg">
                  <button onClick={() => handleUpdateQty(item._id, item.quantity - 1)} className="p-1.5 cursor-pointer"><Minus className="h-3 w-3" /></button>
                  <span className="px-3 text-sm font-medium">{item.quantity}</span>
                  <button onClick={() => handleUpdateQty(item._id, item.quantity + 1)} className="p-1.5 cursor-pointer"><Plus className="h-3 w-3" /></button>
                </div>
              </div>
            </motion.div>
          ))}
          <div className="flex justify-end"><Button variant="ghost" size="sm" icon={Trash2} onClick={handleClear}>Clear Cart</Button></div>
        </div>

        {/* Summary */}
        <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 p-6 h-fit sticky top-24 shadow-card">
          <h3 className="font-semibold text-surface-900 dark:text-white mb-4">Order Summary</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-surface-500">Subtotal</span><span className="font-medium">{formatCurrency(totalAmount + discount)}</span></div>
            {discount > 0 && <div className="flex justify-between text-success-600"><span>Discount</span><span>-{formatCurrency(discount)}</span></div>}
            <div className="flex justify-between"><span className="text-surface-500">Shipping</span><span className="text-success-600 font-medium">Free</span></div>
            <div className="border-t border-surface-200 dark:border-surface-800 pt-3 flex justify-between text-base font-bold text-surface-900 dark:text-white"><span>Total</span><span>{formatCurrency(totalAmount)}</span></div>
          </div>
          {/* Coupon */}
          <div className="mt-6">
            {coupon ? (
              <div className="flex items-center justify-between p-3 rounded-lg bg-success-50 dark:bg-success-900/20">
                <div className="flex items-center gap-2"><Tag className="h-4 w-4 text-success-600" /><span className="text-sm font-medium text-success-700 dark:text-success-400">{coupon.code}</span></div>
                <button onClick={() => dispatch(removeCoupon())} className="text-xs text-danger-600 hover:underline cursor-pointer">Remove</button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="Coupon code" className="flex-1 px-3 py-2 text-sm border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-800 text-surface-900 dark:text-white" />
                <Button variant="secondary" size="sm" onClick={handleApplyCoupon}>Apply</Button>
              </div>
            )}
          </div>
          <Link to="/checkout" className="block mt-6"><Button fullWidth variant="gradient" size="lg" icon={ArrowRight} iconPosition="right">Checkout</Button></Link>
        </div>
      </div>
    </div>
  );
}
