import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ShoppingBag, Eye, EyeOff, Store, Phone } from 'lucide-react';
import { registerUser, clearError } from '@/store/slices/authSlice';
import { registerSchema } from '@/utils/validators';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading } = useSelector((s) => s.auth);
  const [showPassword, setShowPassword] = useState(false);

  const { register: reg, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'customer' },
  });

  const role = watch('role');

  const onSubmit = async (data) => {
    dispatch(clearError());
    const result = await dispatch(registerUser(data));
    if (registerUser.fulfilled.match(result)) {
      toast.success('Registration successful! Please check your email to verify your account.');
      navigate('/login');
    } else {
      toast.error(result.payload || 'Registration failed');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="text-center mb-8">
        <Link to="/" className="inline-flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <ShoppingBag className="h-5 w-5 text-white" />
          </div>
          <span className="text-2xl font-display font-bold text-surface-900 dark:text-white">SUPVEND</span>
        </Link>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Create an account</h1>
        <p className="text-surface-500 dark:text-surface-400 mt-1">Join SUPVEND marketplace today</p>
      </div>

      <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6 shadow-card">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Role Selector */}
          <div className="grid grid-cols-2 gap-3">
            {['customer', 'vendor'].map((r) => (
              <label key={r} className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${
                role === r ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400' : 'border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:border-surface-300'
              }`}>
                <input type="radio" value={r} {...reg('role')} className="sr-only" />
                {r === 'customer' ? <User className="h-4 w-4" /> : <Store className="h-4 w-4" />}
                <span className="text-sm font-medium capitalize">{r}</span>
              </label>
            ))}
          </div>

          <Input label="Full Name" icon={User} placeholder="John Doe" error={errors.name?.message} {...reg('name')} />
          <Input label="Email" type="email" icon={Mail} placeholder="you@example.com" error={errors.email?.message} {...reg('email')} />

          {role === 'vendor' && (
            <>
              <Input label="Store Name" icon={Store} placeholder="My Amazing Store" error={errors.storeName?.message} {...reg('storeName')} />
              <Textarea label="Store Description" placeholder="Tell us about your store..." error={errors.storeDescription?.message} {...reg('storeDescription')} rows={3} />
              <Input label="Phone Number" icon={Phone} placeholder="+1 234 567 890" error={errors.phone?.message} {...reg('phone')} />
            </>
          )}

          <div className="relative">
            <Input label="Password" type={showPassword ? 'text' : 'password'} icon={Lock} placeholder="••••••••" error={errors.password?.message} {...reg('password')} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-[38px] text-surface-400 hover:text-surface-600 cursor-pointer">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <Input label="Confirm Password" type="password" icon={Lock} placeholder="••••••••" error={errors.confirmPassword?.message} {...reg('confirmPassword')} />

          <Button type="submit" fullWidth isLoading={isLoading} variant="gradient" size="lg">Create Account</Button>
        </form>
      </div>

      <p className="text-center text-sm text-surface-500 dark:text-surface-400 mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">Sign in</Link>
      </p>
    </motion.div>
  );
}
