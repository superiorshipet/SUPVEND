import { useState, useEffect } from 'react';
import { Store } from 'lucide-react';
import { adminDashboardAPI } from '@/api/endpoints';
import DataTable from '@/components/ui/DataTable';
import Pagination from '@/components/ui/Pagination';
import Badge from '@/components/ui/Badge';
import { usePagination } from '@/hooks/usePagination';
import { formatDate } from '@/utils/helpers';
import toast from 'react-hot-toast';

export default function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const { page, totalPages, setPage, updateMeta } = usePagination();

  const fetchVendors = () => {
    setLoading(true);
    adminDashboardAPI.getVendors({ page, limit: 10 }).then((r) => {
      const d = r.data?.data || r.data;
      setVendors(d?.vendors || []);
      updateMeta({ totalPages: d?.totalPages, total: d?.total });
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(fetchVendors, [page]);

  const handleApproval = async (id, status) => {
    try { await adminDashboardAPI.approveVendor(id, { status }); toast.success(`Vendor ${status}`); fetchVendors(); } catch { toast.error('Failed'); }
  };

  const columns = [
    { key: 'name', label: 'Name', render: (v) => <span className="font-medium">{v}</span> },
    { key: 'storeName', label: 'Store' },
    { key: 'email', label: 'Email' },
    { key: 'isApproved', label: 'Status', render: (v) => <Badge variant={v ? 'success' : 'warning'} dot>{v ? 'Approved' : 'Pending'}</Badge> },
    { key: 'createdAt', label: 'Joined', render: (v) => formatDate(v) },
    { key: '_id', label: '', render: (v, row) => !row.isApproved ? (
      <div className="flex gap-2">
        <button onClick={() => handleApproval(v, 'approved')} className="text-xs text-success-600 hover:underline cursor-pointer">Approve</button>
        <button onClick={() => handleApproval(v, 'rejected')} className="text-xs text-danger-600 hover:underline cursor-pointer">Reject</button>
      </div>
    ) : null },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold text-surface-900 dark:text-white mb-6">Vendors Management</h2>
      <DataTable columns={columns} data={vendors} isLoading={loading} emptyMessage="No vendors" emptyIcon={Store} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
