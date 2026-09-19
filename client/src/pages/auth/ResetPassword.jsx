import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Lock, ShoppingBag } from 'lucide-react';
import { resetPasswordSchema } from '@/utils/validators';
import { authAPI } from '@/api/endpoints';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { useState } from 'react';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(resetPasswordSchema) });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await authAPI.resetPassword(token, data);
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="text-center mb-8">
        <Link to="/" className="inline-flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center"><ShoppingBag className="h-5 w-5 text-white" /></div>
          <span className="text-2xl font-display font-bold text-surface-900 dark:text-white">SUPVEND</span>
        </Link>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Reset password</h1>
        <p className="text-surface-500 dark:text-surface-400 mt-1">Enter your new password</p>
      </div>
      <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6 shadow-card">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="New Password" type="password" icon={Lock} placeholder="••••••••" error={errors.password?.message} {...register('password')} />
          <Input label="Confirm Password" type="password" icon={Lock} placeholder="••••••••" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
          <Button type="submit" fullWidth isLoading={isLoading} variant="gradient" size="lg">Reset Password</Button>
        </form>
      </div>
    </motion.div>
  );
}
