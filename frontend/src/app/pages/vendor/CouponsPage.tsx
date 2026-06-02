import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { couponsApi } from '../../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: '', type: 'percentage', value: '', minOrderValue: '0', endDate: '' });

  useEffect(() => { fetchCoupons(); }, []);

  const fetchCoupons = async () => {
    try {
      const res = await couponsApi.getAll();
      setCoupons(res.data.data.coupons || []);
    } catch (error) { console.error(error); }
  };

  const createCoupon = async () => {
    try {
      await couponsApi.create({ ...form, value: parseFloat(form.value), minOrderValue: parseFloat(form.minOrderValue), endDate: new Date(form.endDate) });
      toast.success('Coupon created');
      setShowForm(false);
      fetchCoupons();
    } catch (error) { toast.error('Failed to create coupon'); }
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm('Delete this coupon?')) return;
    try {
      await couponsApi.delete(id);
      toast.success('Coupon deleted');
      fetchCoupons();
    } catch (error) { toast.error('Failed to delete'); }
  };

  return (
    <Card>
      <CardHeader><div className="flex justify-between"><CardTitle>My Coupons</CardTitle><Button onClick={() => setShowForm(!showForm)}><Plus /> New Coupon</Button></div></CardHeader>
      <CardContent>
        {showForm && (
          <form onSubmit={(e) => { e.preventDefault(); createCoupon(); }} className="mb-6 p-4 border rounded grid grid-cols-2 gap-3">
            <Input placeholder="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} required />
            <select className="border rounded p-2" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option value="percentage">%</option><option value="fixed">$</option></select>
            <Input type="number" placeholder="Value" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} required />
            <Input type="number" placeholder="Min Order" value={form.minOrderValue} onChange={(e) => setForm({ ...form, minOrderValue: e.target.value })} />
            <Input type="date" placeholder="End Date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required className="col-span-2" />
            <Button type="submit">Create</Button>
          </form>
        )}
        {coupons.length === 0 ? <p className="text-gray-500 text-center py-4">No coupons yet</p> : coupons.map(c => (
          <div key={c._id} className="flex justify-between items-center border-b py-3">
            <div><span className="font-bold">{c.code}</span> - {c.type === 'percentage' ? `${c.value}% off` : `$${c.value} off`}</div>
            <button onClick={() => deleteCoupon(c._id)} className="text-red-500"><Trash2 /></button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
