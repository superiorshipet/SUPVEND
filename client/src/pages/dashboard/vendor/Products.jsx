import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Package, Edit, Trash2, Eye } from 'lucide-react';
import { productAPI } from '@/api/endpoints';
import DataTable from '@/components/ui/DataTable';
import Pagination from '@/components/ui/Pagination';
import Button from '@/components/ui/Button';
import SearchBar from '@/components/shared/SearchBar';
import Badge from '@/components/ui/Badge';
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
    productAPI.getVendorProducts(params).then((res) => {
      const d = res.data?.data || res.data;
      setProducts(d?.products || []);
      updateMeta({ totalPages: d?.totalPages, total: d?.total });
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(fetchProducts, [page, debouncedSearch]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try { await productAPI.delete(id); toast.success('Product deleted'); fetchProducts(); } catch { toast.error('Failed to delete'); }
  };

  const columns = [
    { key: 'name', label: 'Product', render: (v, row) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-surface-100 dark:bg-surface-800 overflow-hidden shrink-0">{row.images?.[0] && <img src={row.images[0].url} className="w-full h-full object-cover" />}</div>
        <span className="font-medium text-surface-900 dark:text-white truncate max-w-[200px]">{v}</span>
      </div>
    )},
    { key: 'price', label: 'Price', render: (v) => <span className="font-semibold">{formatCurrency(v)}</span> },
    { key: 'stock', label: 'Stock', render: (v) => <Badge variant={v > 10 ? 'success' : v > 0 ? 'warning' : 'danger'}>{v}</Badge> },
    { key: 'status', label: 'Status', render: (v) => <Badge variant={v === 'active' ? 'success' : 'default'} dot>{v || 'active'}</Badge> },
    { key: '_id', label: 'Actions', render: (v) => (
      <div className="flex items-center gap-1">
        <Link to={`/vendor/products/${v}/edit`} className="p-1.5 rounded hover:bg-surface-100 dark:hover:bg-surface-800"><Edit className="h-4 w-4 text-surface-500" /></Link>
        <button onClick={() => handleDelete(v)} className="p-1.5 rounded hover:bg-surface-100 dark:hover:bg-surface-800 cursor-pointer"><Trash2 className="h-4 w-4 text-danger-500" /></button>
      </div>
    )},
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-surface-900 dark:text-white">Products</h2>
        <Link to="/vendor/products/new"><Button icon={Plus}>Add Product</Button></Link>
      </div>
      <SearchBar value={search} onChange={setSearch} placeholder="Search products..." className="mb-4 max-w-sm" />
      <DataTable columns={columns} data={products} isLoading={loading} emptyMessage="No products yet" emptyIcon={Package} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
