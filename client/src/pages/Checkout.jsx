import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MapPin, CreditCard } from 'lucide-react';
import { addressSchema } from '@/utils/validators';
import { orderAPI } from '@/api/endpoints';
import { resetCart } from '@/store/slices/cartSlice';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { formatCurrency } from '@/utils/helpers';
import toast from 'react-hot-toast';

export default function Checkout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items, totalAmount, discount } = useSelector((s) => s.cart);
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(addressSchema) });

  const onSubmit = async (address) => {
    setIsLoading(true);
    try {
      await orderAPI.create({ shippingAddress: address });
      dispatch(resetCart());
      toast.success('Order placed successfully!');
      navigate('/order-success');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    }
    setIsLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-display font-bold text-surface-900 dark:text-white mb-8">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 p-6">
            <div className="flex items-center gap-2 mb-6"><MapPin className="h-5 w-5 text-primary-600" /><h2 className="text-lg font-semibold text-surface-900 dark:text-white">Shipping Address</h2></div>
            <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Full Name" error={errors.fullName?.message} {...register('fullName')} />
              <Input label="Phone" error={errors.phone?.message} {...register('phone')} />
              <div className="sm:col-span-2"><Input label="Street Address" error={errors.street?.message} {...register('street')} /></div>
              <Input label="City" error={errors.city?.message} {...register('city')} />
              <Input label="State" error={errors.state?.message} {...register('state')} />
              <Input label="Zip Code" error={errors.zipCode?.message} {...register('zipCode')} />
              <Input label="Country" error={errors.country?.message} {...register('country')} />
            </form>
          </div>
        </div>
        <div>
          <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 p-6 sticky top-24 shadow-card">
            <h3 className="font-semibold text-surface-900 dark:text-white mb-4">Order Summary</h3>
            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
              {items.map((item) => (
                <div key={item._id} className="flex justify-between text-sm">
                  <span className="text-surface-600 dark:text-surface-400 truncate mr-2">{item.product?.name} × {item.quantity}</span>
                  <span className="font-medium shrink-0">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-surface-200 dark:border-surface-800 pt-3 space-y-2 text-sm">
              {discount > 0 && <div className="flex justify-between text-success-600"><span>Discount</span><span>-{formatCurrency(discount)}</span></div>}
              <div className="flex justify-between"><span className="text-surface-500">Shipping</span><span className="text-success-600">Free</span></div>
              <div className="flex justify-between text-base font-bold text-surface-900 dark:text-white pt-2 border-t border-surface-200 dark:border-surface-800"><span>Total</span><span>{formatCurrency(totalAmount)}</span></div>
            </div>
            <Button form="checkout-form" type="submit" fullWidth variant="gradient" size="lg" icon={CreditCard} isLoading={isLoading} className="mt-6">Place Order</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
