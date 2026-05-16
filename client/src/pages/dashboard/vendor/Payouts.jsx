import { useState, useEffect } from 'react';
import { DollarSign } from 'lucide-react';
import { vendorDashboardAPI } from '@/api/endpoints';
import DataTable from '@/components/ui/DataTable';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/utils/helpers';
import toast from 'react-hot-toast';

export default function Payouts() {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [requesting, setRequesting] = useState(false);

  const fetchPayouts = () => { vendorDashboardAPI.getPayouts().then((r) => setPayouts(r.data?.data?.payouts || r.data?.payouts || [])).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(fetchPayouts, []);

  const handleRequest = async () => {
    if (!amount || amount <= 0) return;
    setRequesting(true);
    try { await vendorDashboardAPI.requestPayout({ amount: Number(amount) }); toast.success('Payout requested!'); setAmount(''); fetchPayouts(); } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    setRequesting(false);
  };

  const columns = [
    { key: 'amount', label: 'Amount', render: (v) => <span className="font-semibold">{formatCurrency(v)}</span> },
    { key: 'status', label: 'Status', render: (v) => <Badge variant={v === 'approved' ? 'success' : v === 'pending' ? 'warning' : 'danger'} dot>{v}</Badge> },
    { key: 'createdAt', label: 'Requested', render: (v) => formatDate(v) },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="font-semibold text-surface-900 dark:text-white mb-4">Request Payout</h3>
        <div className="flex gap-3 max-w-sm">
          <Input type="number" placeholder="Enter amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <Button onClick={handleRequest} isLoading={requesting} icon={DollarSign}>Request</Button>
        </div>
      </Card>
      <div>
        <h2 className="text-xl font-semibold text-surface-900 dark:text-white mb-4">Payout History</h2>
        <DataTable columns={columns} data={payouts} isLoading={loading} emptyMessage="No payouts" emptyIcon={DollarSign} />
      </div>
    </div>
  );
}
