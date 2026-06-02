import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { adminApi } from '../../../services/api';
import { Button } from '../../components/ui/Button';
import { CheckCircle, DollarSign, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function PayoutsManagementPage() {
  const [pendingPayouts, setPendingPayouts] = useState<any[]>([]);
  const [completedPayouts, setCompletedPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayouts();
  }, []);

  const fetchPayouts = async () => {
    try {
      const response = await adminApi.getPendingPayouts();
      setPendingPayouts(response.data.data.payouts || []);
      // For completed payouts, we'd need another endpoint
      setCompletedPayouts([]);
    } catch (error) {
      console.error('Error fetching payouts:', error);
      toast.error('Failed to load payouts');
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePayout = async (payoutId: string) => {
    try {
      await adminApi.approvePayout(payoutId);
      toast.success('Payout approved successfully');
      fetchPayouts();
    } catch (error) {
      toast.error('Failed to approve payout');
    }
  };

  const totalPendingAmount = pendingPayouts.reduce((sum, p) => sum + p.amount, 0);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full size-12 border-b-2 border-[#4F46E5]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Clock className="size-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending Payouts</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingPayouts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <DollarSign className="size-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Pending Amount</p>
                <p className="text-2xl font-bold text-green-600">${totalPendingAmount.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Payout Requests ({pendingPayouts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingPayouts.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="size-12 mx-auto text-green-400 mb-3" />
              <p className="text-gray-500">No pending payout requests</p>
              <p className="text-sm text-gray-400 mt-1">All vendor payouts have been processed</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingPayouts.map((payout) => (
                <div key={payout._id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start flex-wrap gap-3">
                    <div>
                      <h3 className="font-semibold text-lg">{payout.vendorId?.storeName}</h3>
                      <p className="text-sm text-gray-500">{payout.vendorId?.userId?.email}</p>
                      <p className="text-sm text-gray-500 mt-1">Payment Method: {payout.paymentMethod}</p>
                      <p className="text-xs text-gray-400 mt-1">Requested: {new Date(payout.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-green-600">${payout.amount.toFixed(2)}</p>
                      <button
                        onClick={() => handleApprovePayout(payout._id)}
                        className="mt-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center gap-2"
                      >
                        <CheckCircle className="size-4" />
                        Approve Payout
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {completedPayouts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Completed Payouts ({completedPayouts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completedPayouts.map((payout) => (
                <div key={payout._id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{payout.vendorId?.storeName}</p>
                      <p className="text-sm text-gray-500">{new Date(payout.completedAt).toLocaleDateString()}</p>
                    </div>
                    <p className="text-xl font-bold text-green-600">${payout.amount.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
