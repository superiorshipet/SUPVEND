import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { walletApi } from '../../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { toast } from 'sonner';
import { DollarSign, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';

export default function WalletPage() {
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositing, setDepositing] = useState(false);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      const [walletRes, txRes] = await Promise.all([
        walletApi.get(),
        walletApi.getTransactions({ limit: 20 }),
      ]);
      setWallet(walletRes.data.data.wallet);
      setTransactions(txRes.data.data.transactions || []);
    } catch (error) {
      console.error('Error fetching wallet:', error);
      toast.error('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setDepositing(true);
    try {
      const response = await walletApi.deposit(amount);
      // In production, redirect to Stripe checkout
      toast.success('Deposit initiated! Check console for payment intent.');
      console.log('Payment intent:', response.data.data);
      setDepositAmount('');
      fetchWalletData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Deposit failed');
    } finally {
      setDepositing(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <TrendingUp className="size-5 text-[#10B981]" />;
      case 'payment':
        return <TrendingDown className="size-5 text-[#EF4444]" />;
      case 'refund':
        return <RefreshCw className="size-5 text-[#F59E0B]" />;
      default:
        return <DollarSign className="size-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full size-12 border-b-2 border-[#4F46E5]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Wallet Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <p className="text-5xl font-bold text-gray-900 mb-2">
              ${wallet?.balance?.toFixed(2) || '0.00'}
            </p>
            <p className="text-gray-500">Available Balance</p>
          </div>

          <div className="flex gap-3 mt-4">
            <Input
              type="number"
              placeholder="Enter amount"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleDeposit} disabled={depositing}>
              {depositing ? 'Processing...' : 'Add Funds'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div key={tx._id} className="flex justify-between items-center p-3 border-b border-gray-200 last:border-b-0">
                  <div className="flex items-center gap-3">
                    {getTransactionIcon(tx.type)}
                    <div>
                      <p className="font-medium text-gray-900 capitalize">{tx.type}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(tx.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      tx.type === 'deposit' || tx.type === 'refund' 
                        ? 'text-[#10B981]' 
                        : 'text-[#EF4444]'
                    }`}>
                      {tx.type === 'deposit' || tx.type === 'refund' ? '+' : '-'}
                      ${Math.abs(tx.amount).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">Balance: ${tx.balanceAfter?.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
