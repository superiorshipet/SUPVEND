import { useState, useEffect } from 'react';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownRight, Plus } from 'lucide-react';
import { walletAPI } from '@/api/endpoints';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { formatCurrency, formatDate } from '@/utils/helpers';
import toast from 'react-hot-toast';

export default function Wallet() {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [depositing, setDepositing] = useState(false);

  useEffect(() => {
    Promise.all([walletAPI.get(), walletAPI.getTransactions()]).then(([w, t]) => {
      setWallet(w.data?.data?.wallet || w.data?.data || w.data?.wallet);
      setTransactions(t.data?.data?.transactions || t.data?.transactions || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleDeposit = async () => {
    if (!amount || amount <= 0) return;
    setDepositing(true);
    try { await walletAPI.deposit({ amount: Number(amount) }); toast.success('Deposit successful!'); setAmount(''); const w = await walletAPI.get(); setWallet(w.data?.data?.wallet || w.data?.data); } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setDepositing(false);
  };

  return (
    <div className="space-y-6">
      <Card className="gradient-primary text-white">
        <div className="flex items-center gap-3 mb-4"><WalletIcon className="h-6 w-6" /><h2 className="text-lg font-semibold">My Wallet</h2></div>
        <p className="text-3xl font-bold">{formatCurrency(wallet?.balance || 0)}</p>
        <p className="text-white/70 text-sm mt-1">Available Balance</p>
      </Card>
      <Card>
        <h3 className="font-semibold text-surface-900 dark:text-white mb-4">Add Funds</h3>
        <div className="flex gap-3 max-w-sm">
          <Input type="number" placeholder="Enter amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <Button onClick={handleDeposit} isLoading={depositing} icon={Plus}>Deposit</Button>
        </div>
      </Card>
      <Card>
        <h3 className="font-semibold text-surface-900 dark:text-white mb-4">Transaction History</h3>
        <div className="space-y-3">
          {transactions.length === 0 ? <p className="text-surface-500 text-sm">No transactions yet</p> : transactions.map((t, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-surface-50 dark:bg-surface-800/50">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${t.type === 'credit' ? 'bg-success-50 dark:bg-success-900/30' : 'bg-danger-50 dark:bg-danger-900/30'}`}>
                  {t.type === 'credit' ? <ArrowDownRight className="h-4 w-4 text-success-600" /> : <ArrowUpRight className="h-4 w-4 text-danger-600" />}
                </div>
                <div><p className="text-sm font-medium text-surface-900 dark:text-white">{t.description || t.type}</p><p className="text-xs text-surface-500">{formatDate(t.createdAt)}</p></div>
              </div>
              <span className={`font-semibold ${t.type === 'credit' ? 'text-success-600' : 'text-danger-600'}`}>{t.type === 'credit' ? '+' : '-'}{formatCurrency(t.amount)}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
