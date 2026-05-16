import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Mail, ShoppingBag, ArrowLeft } from 'lucide-react';
import { forgotPasswordSchema } from '@/utils/validators';
import { authAPI } from '@/api/endpoints';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { useState } from 'react';

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await authAPI.forgotPassword(data);
      setSent(true);
      toast.success('Reset link sent to your email');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset link');
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
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Forgot password?</h1>
        <p className="text-surface-500 dark:text-surface-400 mt-1">We'll send you a reset link</p>
      </div>
      <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6 shadow-card">
        {sent ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-2xl bg-success-50 dark:bg-success-900/30 flex items-center justify-center mx-auto mb-4"><Mail className="h-8 w-8 text-success-500" /></div>
            <h3 className="font-semibold text-surface-900 dark:text-white mb-2">Check your email</h3>
            <p className="text-sm text-surface-500 dark:text-surface-400">We've sent a password reset link to your email address.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Email" type="email" icon={Mail} placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
            <Button type="submit" fullWidth isLoading={isLoading} variant="gradient" size="lg">Send Reset Link</Button>
          </form>
        )}
      </div>
      <p className="text-center mt-6">
        <Link to="/login" className="text-sm text-surface-500 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 inline-flex items-center gap-1"><ArrowLeft className="h-4 w-4" /> Back to login</Link>
      </p>
    </motion.div>
  );
}
