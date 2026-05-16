import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Store, Star, MapPin, Calendar } from 'lucide-react';
import { productAPI } from '@/api/endpoints';
import ProductCard from '@/components/shared/ProductCard';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { formatDate } from '@/utils/helpers';

export default function VendorProfile() {
  const { id } = useParams();
  const [products, setProducts] = useState([]);
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productAPI.getAll({ vendor: id, limit: 20 }).then((res) => {
      const data = res.data?.data || res.data;
      setProducts(data?.products || []);
      if (data?.products?.[0]?.vendor) setVendor(data.products[0].vendor);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="bg-gradient-to-r from-primary-600 to-accent-600 rounded-2xl p-8 mb-10 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
            <Store className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold">{vendor?.storeName || 'Vendor Store'}</h1>
            <p className="text-white/80 text-sm mt-1">{vendor?.storeDescription || 'Quality products from a trusted vendor'}</p>
          </div>
        </div>
      </div>
      <h2 className="text-xl font-semibold text-surface-900 dark:text-white mb-6">Products ({products.length})</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((p) => <ProductCard key={p._id} product={p} />)}
      </div>
      {products.length === 0 && <p className="text-center py-16 text-surface-500">No products yet</p>}
    </div>
  );
}
