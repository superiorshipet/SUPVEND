import { useState, useEffect } from 'react';
import { DollarSign, CheckCircle } from 'lucide-react';
import { adminDashboardAPI } from '@/api/endpoints';
import DataTable from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/utils/helpers';
import toast from 'react-hot-toast';

export default function Payouts() {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = () => { adminDashboardAPI.getPendingPayouts().then((r) => setPayouts(r.data?.data?.payouts || r.data?.payouts || [])).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(fetch, []);

  const handleApprove = async (id) => {
    try { await adminDashboardAPI.approvePayout(id, {}); toast.success('Payout approved'); fetch(); } catch { toast.error('Failed'); }
  };

  const columns = [
    { key: 'vendor', label: 'Vendor', render: (v) => <span className="font-medium">{v?.name || v?.storeName || '—'}</span> },
    { key: 'amount', label: 'Amount', render: (v) => <span className="font-semibold">{formatCurrency(v)}</span> },
    { key: 'status', label: 'Status', render: (v) => <Badge variant={v === 'approved' ? 'success' : 'warning'} dot>{v}</Badge> },
    { key: 'createdAt', label: 'Requested', render: (v) => formatDate(v) },
    { key: '_id', label: '', render: (v, row) => row.status === 'pending' && (
      <button onClick={() => handleApprove(v)} className="text-xs text-success-600 hover:underline cursor-pointer flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Approve</button>
    )},
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold text-surface-900 dark:text-white mb-6">Payouts</h2>
      <DataTable columns={columns} data={payouts} isLoading={loading} emptyMessage="No pending payouts" emptyIcon={DollarSign} />
    </div>
  );
}
