import { Heart } from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';

export default function Wishlist() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-display font-bold text-surface-900 dark:text-white mb-8">My Wishlist</h1>
      <EmptyState icon={Heart} title="Your wishlist is empty" description="Save items you love to your wishlist and find them here anytime." actionLabel="Browse Products" onAction={() => window.location.href = '/shop'} />
    </div>
  );
}
