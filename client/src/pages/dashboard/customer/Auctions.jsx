import { Gavel } from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';

export default function Auctions() {
  return (
    <div>
      <h2 className="text-xl font-semibold text-surface-900 dark:text-white mb-6">My Auctions</h2>
      <EmptyState icon={Gavel} title="No auction activity" description="Your auction bids and won items will appear here." actionLabel="Browse Auctions" onAction={() => window.location.href = '/auctions'} />
    </div>
  );
}
