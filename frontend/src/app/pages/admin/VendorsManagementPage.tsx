import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { adminApi } from '../../../services/api';
import { Button } from '../../components/ui/Button';
import { CheckCircle, XCircle, Eye } from 'lucide-react';
import { toast } from 'sonner';

export default function VendorsManagementPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const response = await adminApi.getVendors();
      setVendors(response.data.data.vendors || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast.error('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveVendor = async (vendorId: string, status: string) => {
    try {
      await adminApi.approveVendor(vendorId, status);
      toast.success(`Vendor ${status}`);
      fetchVendors();
    } catch (error) {
      toast.error('Failed to update vendor');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full size-12 border-b-2 border-[#4F46E5]"></div>
      </div>
    );
  }

  const pendingVendors = vendors.filter(v => v.isApproved === 'pending');
  const approvedVendors = vendors.filter(v => v.isApproved === 'approved');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pending Approvals ({pendingVendors.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingVendors.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No pending vendor approvals</p>
          ) : (
            <div className="space-y-4">
              {pendingVendors.map((vendor) => (
                <div key={vendor._id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{vendor.storeName}</h3>
                      <p className="text-sm text-gray-500">{vendor.userId?.email}</p>
                      <p className="text-sm text-gray-500 mt-1">{vendor.storeDescription}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproveVendor(vendor._id, 'approved')}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center gap-2"
                      >
                        <CheckCircle className="size-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleApproveVendor(vendor._id, 'rejected')}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 flex items-center gap-2"
                      >
                        <XCircle className="size-4" />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Vendors ({approvedVendors.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {approvedVendors.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No vendors yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Store</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Products</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Sales</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {approvedVendors.map((vendor) => (
                    <tr key={vendor._id}>
                      <td className="px-4 py-3 font-medium">{vendor.storeName}</td>
                      <td className="px-4 py-3 text-sm">{vendor.userId?.email}</td>
                      <td className="px-4 py-3 text-sm">{vendor.totalProducts || 0}</td>
                      <td className="px-4 py-3 text-sm">${vendor.totalRevenue?.toFixed(2) || '0.00'}</td>
                      <td className="px-4 py-3">
                        <button className="text-blue-600 hover:bg-blue-50 p-1 rounded">
                          <Eye className="size-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
