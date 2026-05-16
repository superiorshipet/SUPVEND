import { useState, useEffect } from 'react';
import { Package, Trash2 } from 'lucide-react';
import { adminDashboardAPI } from '@/api/endpoints';
import DataTable from '@/components/ui/DataTable';
import Pagination from '@/components/ui/Pagination';
import SearchBar from '@/components/shared/SearchBar';
import { usePagination } from '@/hooks/usePagination';
import { useDebounce } from '@/hooks/useDebounce';
import { formatCurrency } from '@/utils/helpers';
import toast from 'react-hot-toast';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const { page, totalPages, setPage, updateMeta } = usePagination();

  const fetchProducts = () => {
    setLoading(true);
    const params = { page, limit: 10 };
    if (debouncedSearch) params.search = debouncedSearch;
    adminDashboardAPI.getProducts(params).then((r) => {
      const d = r.data?.data || r.data;
      setProducts(d?.products || []);
      updateMeta({ totalPages: d?.totalPages, total: d?.total });
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(fetchProducts, [page, debouncedSearch]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try { await adminDashboardAPI.deleteProduct(id); toast.success('Deleted'); fetchProducts(); } catch { toast.error('Failed'); }
  };

  const columns = [
    { key: 'name', label: 'Product', render: (v, row) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-surface-100 dark:bg-surface-800 overflow-hidden shrink-0">{row.images?.[0] && <img src={row.images[0].url} className="w-full h-full object-cover" />}</div>
        <span className="font-medium truncate max-w-[180px]">{v}</span>
      </div>
    )},
    { key: 'vendor', label: 'Vendor', render: (v) => v?.storeName || v?.name || '—' },
    { key: 'price', label: 'Price', render: (v) => formatCurrency(v) },
    { key: 'stock', label: 'Stock' },
    { key: '_id', label: '', render: (v) => <button onClick={() => handleDelete(v)} className="p-1 cursor-pointer"><Trash2 className="h-4 w-4 text-danger-500" /></button> },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold text-surface-900 dark:text-white mb-6">Products</h2>
      <SearchBar value={search} onChange={setSearch} placeholder="Search products..." className="mb-4 max-w-sm" />
      <DataTable columns={columns} data={products} isLoading={loading} emptyMessage="No products" emptyIcon={Package} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
