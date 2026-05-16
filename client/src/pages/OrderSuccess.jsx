import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function OrderSuccess() {
  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
        <div className="w-24 h-24 rounded-full bg-success-50 dark:bg-success-900/30 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-12 w-12 text-success-500" />
        </div>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h1 className="text-3xl font-display font-bold text-surface-900 dark:text-white mb-3">Order Placed Successfully!</h1>
        <p className="text-surface-500 dark:text-surface-400 mb-8">Thank you for your purchase. You'll receive a confirmation email shortly.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/dashboard/orders"><Button variant="gradient" icon={Package}>View Orders</Button></Link>
          <Link to="/shop"><Button variant="secondary" icon={ArrowRight} iconPosition="right">Continue Shopping</Button></Link>
        </div>
      </motion.div>
    </div>
  );
}
