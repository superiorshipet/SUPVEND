import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, ShoppingBag } from 'lucide-react';
import { authAPI } from '@/api/endpoints';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';

export default function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const verify = async () => {
      try {
        await authAPI.verifyEmail(token);
        setStatus('success');
      } catch {
        setStatus('error');
      }
    };
    verify();
  }, [token]);

  if (status === 'loading') return <PageLoader />;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
      <Link to="/" className="inline-flex items-center gap-2 mb-8">
        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center"><ShoppingBag className="h-5 w-5 text-white" /></div>
        <span className="text-2xl font-display font-bold text-surface-900 dark:text-white">SUPVEND</span>
      </Link>
      <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-8 shadow-card">
        {status === 'success' ? (
          <>
            <div className="w-16 h-16 rounded-full bg-success-50 dark:bg-success-900/30 flex items-center justify-center mx-auto mb-4"><CheckCircle className="h-8 w-8 text-success-500" /></div>
            <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-2">Email Verified!</h2>
            <p className="text-surface-500 dark:text-surface-400 mb-6">Your account has been verified successfully.</p>
            <Link to="/login"><Button variant="gradient">Continue to Login</Button></Link>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-danger-50 dark:bg-danger-900/30 flex items-center justify-center mx-auto mb-4"><XCircle className="h-8 w-8 text-danger-500" /></div>
            <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-2">Verification Failed</h2>
            <p className="text-surface-500 dark:text-surface-400 mb-6">The verification link is invalid or expired.</p>
            <Link to="/login"><Button variant="secondary">Back to Login</Button></Link>
          </>
        )}
      </div>
    </motion.div>
  );
}
