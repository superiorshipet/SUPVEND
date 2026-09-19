import { useState, useEffect } from 'react';
import { Gavel } from 'lucide-react';
import { auctionAPI } from '@/api/endpoints';
import DataTable from '@/components/ui/DataTable';
import { formatCurrency, formatDate } from '@/utils/helpers';
import Badge from '@/components/ui/Badge';

export default function Auctions() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    auctionAPI.getVendorAuctions().then((r) => setAuctions(r.data?.data?.auctions || r.data?.auctions || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const columns = [
    { key: 'product', label: 'Product', render: (v) => <span className="font-medium">{v?.name || '—'}</span> },
    { key: 'startingPrice', label: 'Starting', render: (v) => formatCurrency(v) },
    { key: 'currentBid', label: 'Current Bid', render: (v) => formatCurrency(v || 0) },
    { key: 'endTime', label: 'Ends', render: (v) => formatDate(v) },
    { key: 'status', label: 'Status', render: (v) => <Badge variant={v === 'active' ? 'success' : 'default'} dot>{v || 'active'}</Badge> },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold text-surface-900 dark:text-white mb-6">Auctions</h2>
      <DataTable columns={columns} data={auctions} isLoading={loading} emptyMessage="No auctions" emptyIcon={Gavel} />
    </div>
  );
}
