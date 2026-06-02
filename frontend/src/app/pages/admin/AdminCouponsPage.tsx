import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { couponsApi } from '../../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Plus, Trash2, Copy } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    type: 'percentage',
    value: '',
    minOrderValue: '0',
    maxDiscount: '',
    endDate: '',
    usageLimit: '100',
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const response = await couponsApi.getAll();
      setCoupons(response.data.data.coupons || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await couponsApi.create({
        ...formData,
        value: parseFloat(formData.value),
        minOrderValue: parseFloat(formData.minOrderValue),
        maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
        usageLimit: parseInt(formData.usageLimit),
        endDate: new Date(formData.endDate),
      });
      toast.success('Coupon created successfully');
      setFormData({
        code: '', name: '', description: '', type: 'percentage', value: '',
        minOrderValue: '0', maxDiscount: '', endDate: '', usageLimit: '100'
      });
      setShowForm(false);
      fetchCoupons();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create coupon');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this coupon?')) return;
    try {
      await couponsApi.delete(id);
      toast.success('Coupon deleted');
      fetchCoupons();
    } catch (error) {
      toast.error('Failed to delete coupon');
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Coupon code copied!');
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full size-12 border-b-2 border-[#4F46E5]"></div>
      </div>
    );
  }

  const activeCoupons = coupons.filter(c => c.isActive && new Date(c.endDate) > new Date());
  const expiredCoupons = coupons.filter(c => !c.isActive || new Date(c.endDate) <= new Date());

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Coupons Management</CardTitle>
            <Button onClick={() => setShowForm(!showForm)}>
              <Plus className="size-4" />
              Create Coupon
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showForm && (
            <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-lg">
              <h3 className="font-semibold mb-3">Create New Coupon</h3>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Coupon Code" required value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})} />
                <Input label="Name" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                <Input label="Description" className="col-span-2" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select className="w-full border rounded-lg px-3 py-2" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>
                <Input label="Value" type="number" required value={formData.value} onChange={(e) => setFormData({...formData, value: e.target.value})} />
                <Input label="Min Order Value" type="number" value={formData.minOrderValue} onChange={(e) => setFormData({...formData, minOrderValue: e.target.value})} />
                <Input label="Max Discount" type="number" placeholder="Unlimited" value={formData.maxDiscount} onChange={(e) => setFormData({...formData, maxDiscount: e.target.value})} />
                <Input label="End Date" type="date" required value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} />
                <Input label="Usage Limit" type="number" value={formData.usageLimit} onChange={(e) => setFormData({...formData, usageLimit: e.target.value})} />
              </div>
              <div className="flex gap-2 mt-4">
                <Button type="submit">Create Coupon</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          )}

          <h3 className="font-semibold text-lg mb-3">Active Coupons ({activeCoupons.length})</h3>
          {activeCoupons.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No active coupons</p>
          ) : (
            <div className="space-y-3 mb-6">
              {activeCoupons.map((coupon) => (
                <div key={coupon._id} className="border rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg">{coupon.code}</h3>
                      <button onClick={() => copyCode(coupon.code)} className="text-gray-400 hover:text-gray-600">
                        <Copy className="size-4" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-600">{coupon.name}</p>
                    <p className="text-sm text-gray-500">
                      {coupon.type === 'percentage' ? `${coupon.value}% off` : `$${coupon.value} off`}
                      {coupon.minOrderValue > 0 && ` • Min order: $${coupon.minOrderValue}`}
                    </p>
                    <p className="text-xs text-gray-400">Expires: {new Date(coupon.endDate).toLocaleDateString()}</p>
                  </div>
                  <button onClick={() => handleDelete(coupon._id)} className="text-red-500 hover:text-red-700 p-1">
                    <Trash2 className="size-5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {expiredCoupons.length > 0 && (
            <>
              <h3 className="font-semibold text-lg mb-3">Expired Coupons ({expiredCoupons.length})</h3>
              <div className="space-y-3">
                {expiredCoupons.map((coupon) => (
                  <div key={coupon._id} className="border rounded-lg p-4 bg-gray-50 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-gray-500">{coupon.code}</h3>
                      <p className="text-sm text-gray-500">{coupon.name}</p>
                    </div>
                    <button onClick={() => handleDelete(coupon._id)} className="text-red-400 hover:text-red-600 p-1">
                      <Trash2 className="size-5" />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
