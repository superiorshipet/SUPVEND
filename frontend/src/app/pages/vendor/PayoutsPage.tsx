import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { vendorApi } from '../../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { DollarSign, History } from 'lucide-react';
import { toast } from 'sonner';

export default function PayoutsPage() {
  const [balance, setBalance] = useState(0);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [overview, payoutsRes] = await Promise.all([
        vendorApi.getOverview(),
        vendorApi.getPayouts()
      ]);
      setBalance(overview.data.data.stats.availableBalance || 0);
      setPayouts(payoutsRes.data.payouts || []);
    } catch (error) {
      console.error('Error fetching payouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const requestPayout = async () => {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      toast.error('Enter valid amount');
      return;
    }
    if (amt > balance) {
      toast.error('Insufficient balance');
      return;
    }
    try {
      await vendorApi.requestPayout({ amount: amt, paymentMethod: 'bank_transfer' });
      toast.success('Payout request submitted');
      setAmount('');
      fetchData();
    } catch (error) {
      toast.error('Failed to request payout');
    }
  };

  if (loading) return <div className="text-center py-20">Loading...</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Available Balance</CardTitle></CardHeader>
        <CardContent>
          <p className="text-4xl font-bold text-green-600">${balance.toFixed(2)}</p>
          <div className="flex gap-3 mt-4">
            <Input type="number" placeholder="Enter amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <Button onClick={requestPayout} disabled={balance <= 0}>Request Payout</Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><History /> Payout History</CardTitle></CardHeader>
        <CardContent>
          {payouts.length === 0 ? <p className="text-gray-500 text-center py-4">No payouts yet</p> : (
            <table className="w-full">
              <thead><tr><th>Date</th><th>Amount</th><th>Status</th></tr></thead>
              <tbody>
                {payouts.map(p => (<tr key={p._id}><td>{new Date(p.createdAt).toLocaleDateString()}</td><td>${p.amount}</td><td>{p.status}</td></tr>))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
