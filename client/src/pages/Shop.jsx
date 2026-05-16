import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SlidersHorizontal, X, Grid3X3, List } from 'lucide-react';
import { productAPI, categoryAPI } from '@/api/endpoints';
import ProductCard from '@/components/shared/ProductCard';
import SearchBar from '@/components/shared/SearchBar';
import Pagination from '@/components/ui/Pagination';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { useDebounce } from '@/hooks/useDebounce';
import { usePagination } from '@/hooks/usePagination';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { page, totalPages, setPage, updateMeta } = usePagination();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || '-createdAt');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });

  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    categoryAPI.getAll().then((res) => setCategories(res.data?.data?.categories || res.data?.categories || [])).catch(() => {});
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = { page, limit: 12, sort };
        if (debouncedSearch) params.search = debouncedSearch;
        if (category) params.category = category;
        if (priceRange.min) params.minPrice = priceRange.min;
        if (priceRange.max) params.maxPrice = priceRange.max;
        const { data } = await productAPI.getAll(params);
        const result = data?.data || data;
        setProducts(result?.products || []);
        updateMeta({ totalPages: result?.totalPages || 1, total: result?.total });
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetchProducts();
  }, [page, debouncedSearch, category, sort, priceRange.min, priceRange.max]);

  const clearFilters = () => { setCategory(''); setSort('-createdAt'); setPriceRange({ min: '', max: '' }); setSearch(''); setPage(1); };

  const sortOptions = [
    { value: '-createdAt', label: 'Newest' },
    { value: 'createdAt', label: 'Oldest' },
    { value: 'price', label: 'Price: Low to High' },
    { value: '-price', label: 'Price: High to Low' },
    { value: '-rating', label: 'Top Rated' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-surface-900 dark:text-white">Shop</h1>
        <p className="text-surface-500 dark:text-surface-400 mt-1">Discover products from verified vendors</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <SearchBar value={search} onChange={setSearch} placeholder="Search products..." className="w-full sm:w-80" />
        <div className="flex items-center gap-3">
          <Select value={sort} onChange={(e) => setSort(e.target.value)} options={sortOptions} className="text-sm" />
          <Button variant="secondary" size="sm" icon={SlidersHorizontal} onClick={() => setFiltersOpen(!filtersOpen)} className="lg:hidden">Filters</Button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Filters */}
        <aside className={`${filtersOpen ? 'fixed inset-0 z-50 bg-black/50 lg:relative lg:bg-transparent' : 'hidden'} lg:block lg:w-64 shrink-0`}>
          <div className={`${filtersOpen ? 'absolute right-0 top-0 bottom-0 w-72 bg-white dark:bg-surface-900 p-6 shadow-xl overflow-y-auto' : ''} lg:static lg:bg-transparent lg:p-0 lg:shadow-none space-y-6`}>
            {filtersOpen && <div className="flex items-center justify-between lg:hidden mb-4"><h3 className="font-semibold">Filters</h3><button onClick={() => setFiltersOpen(false)} className="cursor-pointer"><X className="h-5 w-5" /></button></div>}
            {/* Category */}
            <div>
              <h4 className="text-sm font-semibold text-surface-900 dark:text-white mb-3">Category</h4>
              <div className="space-y-1.5">
                <button onClick={() => { setCategory(''); setPage(1); }} className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${!category ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400' : 'text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800'}`}>All Categories</button>
                {categories.map((cat) => (
                  <button key={cat._id} onClick={() => { setCategory(cat._id); setPage(1); }} className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${category === cat._id ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400' : 'text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800'}`}>{cat.name}</button>
                ))}
              </div>
            </div>
            {/* Price Range */}
            <div>
              <h4 className="text-sm font-semibold text-surface-900 dark:text-white mb-3">Price Range</h4>
              <div className="flex items-center gap-2">
                <input type="number" placeholder="Min" value={priceRange.min} onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })} className="w-full px-3 py-2 text-sm border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-800 text-surface-900 dark:text-white" />
                <span className="text-surface-400">—</span>
                <input type="number" placeholder="Max" value={priceRange.max} onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })} className="w-full px-3 py-2 text-sm border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-800 text-surface-900 dark:text-white" />
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={clearFilters} fullWidth>Clear All Filters</Button>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} />) : products.map((p) => (
              <motion.div key={p._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <ProductCard product={p} />
              </motion.div>
            ))}
          </div>
          {!loading && products.length === 0 && (
            <div className="text-center py-20">
              <p className="text-lg font-medium text-surface-500 dark:text-surface-400">No products found</p>
              <p className="text-sm text-surface-400 mt-1">Try adjusting your filters or search query</p>
            </div>
          )}
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>
    </div>
  );
}
