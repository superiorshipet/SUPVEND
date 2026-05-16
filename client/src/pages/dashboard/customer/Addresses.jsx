import { MapPin } from 'lucide-react';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';

export default function Addresses() {
  return (
    <div>
      <h2 className="text-xl font-semibold text-surface-900 dark:text-white mb-6">My Addresses</h2>
      <EmptyState icon={MapPin} title="No saved addresses" description="Your shipping addresses will appear here." />
    </div>
  );
}
