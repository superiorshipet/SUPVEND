import { useState, useEffect } from 'react';
import { Users, Ban, CheckCircle } from 'lucide-react';
import { adminDashboardAPI } from '@/api/endpoints';
import DataTable from '@/components/ui/DataTable';
import Pagination from '@/components/ui/Pagination';
import SearchBar from '@/components/shared/SearchBar';
import Badge from '@/components/ui/Badge';
import { usePagination } from '@/hooks/usePagination';
import { useDebounce } from '@/hooks/useDebounce';
import { formatDate } from '@/utils/helpers';
import toast from 'react-hot-toast';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const { page, totalPages, setPage, updateMeta } = usePagination();

  const fetchUsers = () => {
    setLoading(true);
    const params = { page, limit: 10 };
    if (debouncedSearch) params.search = debouncedSearch;
    adminDashboardAPI.getUsers(params).then((r) => {
      const d = r.data?.data || r.data;
      setUsers(d?.users || []);
      updateMeta({ totalPages: d?.totalPages, total: d?.total });
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(fetchUsers, [page, debouncedSearch]);

  const handleBan = async (id, isBanned) => {
    try { await adminDashboardAPI.banUser(id, { banned: !isBanned }); toast.success(isBanned ? 'User unbanned' : 'User banned'); fetchUsers(); } catch { toast.error('Failed'); }
  };

  const columns = [
    { key: 'name', label: 'Name', render: (v) => <span className="font-medium">{v}</span> },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (v) => <Badge variant={v === 'admin' ? 'accent' : v === 'vendor' ? 'primary' : 'default'}>{v}</Badge> },
    { key: 'isBanned', label: 'Status', render: (v) => <Badge variant={v ? 'danger' : 'success'} dot>{v ? 'Banned' : 'Active'}</Badge> },
    { key: 'createdAt', label: 'Joined', render: (v) => formatDate(v) },
    { key: '_id', label: '', render: (v, row) => (
      <button onClick={() => handleBan(v, row.isBanned)} className={`text-xs font-medium cursor-pointer ${row.isBanned ? 'text-success-600 hover:underline' : 'text-danger-600 hover:underline'}`}>
        {row.isBanned ? 'Unban' : 'Ban'}
      </button>
    )},
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold text-surface-900 dark:text-white mb-6">Users Management</h2>
      <SearchBar value={search} onChange={setSearch} placeholder="Search users..." className="mb-4 max-w-sm" />
      <DataTable columns={columns} data={users} isLoading={loading} emptyMessage="No users" emptyIcon={Users} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
