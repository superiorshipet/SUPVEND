import { useState, useEffect } from 'react';
import { Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCard } from '../components/product/ProductCard';
import { productsApi, categoriesApi } from '../../services/api';
import { Button } from '../components/ui/Button';
import { toast } from 'sonner';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    search: '',
    sort: '-createdAt'
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page, filters]);

  const fetchCategories = async () => {
    try {
      const response = await categoriesApi.getAll();
      setCategories(response.data.data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        limit: 12,
        sort: filters.sort,
      };
      if (filters.category) params.category = filters.category;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.search) params.search = filters.search;

      const response = await productsApi.getAll(params);
      const fetchedProducts = response.data.data.products || [];
      
      // Transform product data to expected format
      const transformedProducts = fetchedProducts.map((p: any) => ({
        id: p._id,
        name: p.name,
        description: p.description,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        stock: p.stock,
        images: p.images?.map((img: any) => img.url) || [],
        rating: p.rating,
        totalReviews: p.totalReviews,
        categoryId: p.categoryId,
        vendorId: p.vendorId,
      }));
      
      setProducts(transformedProducts);
      setTotalPages(response.data.pages || 1);
      setTotalProducts(response.data.total || 0);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = () => {
    setPage(1);
    fetchProducts();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">All Products</h1>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden"
        >
          <Filter className="size-5" />
          Filters
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className={`lg:block ${showFilters ? 'block' : 'hidden'} lg:col-span-1`}>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
            <h2 className="font-semibold text-gray-900 mb-4">Filters</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Categories</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      checked={filters.category === ''}
                      onChange={() => setFilters({ ...filters, category: '' })}
                      className="rounded-full text-[#4F46E5]"
                    />
                    <span className="text-gray-700 text-sm">All Categories</span>
                  </label>
                  {categories.map((category) => (
                    <label key={category._id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        checked={filters.category === category._id}
                        onChange={() => setFilters({ ...filters, category: category._id })}
                        className="rounded-full text-[#4F46E5]"
                      />
                      <span className="text-gray-700 text-sm">{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-3">Price Range</h3>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-gray-300 text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-gray-300 text-sm"
                  />
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-3">Sort By</h3>
                <select
                  value={filters.sort}
                  onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                  className="w-full px-3 py-2 rounded border border-gray-300 text-sm"
                >
                  <option value="-createdAt">Newest First</option>
                  <option value="price">Price: Low to High</option>
                  <option value="-price">Price: High to Low</option>
                  <option value="-rating">Rating: High to Low</option>
                </select>
              </div>

              <Button onClick={handleFilterChange} className="w-full">
                Apply Filters
              </Button>
            </div>
          </div>
        </aside>

        <main className="lg:col-span-3">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full size-12 border-b-2 border-[#4F46E5]"></div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <p className="text-gray-600">{totalProducts} products found</p>
              </div>

              {products.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                  <p className="text-gray-500">No products found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}

              {totalPages > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    <ChevronLeft className="size-4" />
                    Previous
                  </Button>
                  <span className="px-4 py-2 text-gray-600">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
