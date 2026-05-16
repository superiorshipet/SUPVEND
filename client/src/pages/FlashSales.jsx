import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { flashSaleAPI } from '@/api/endpoints';
import ProductCard from '@/components/shared/ProductCard';
import CountdownTimer from '@/components/ui/CountdownTimer';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';

export default function FlashSales() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    flashSaleAPI.getActive().then((res) => {
      setSales(res.data?.data?.flashSales || res.data?.flashSales || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-danger-100 dark:bg-danger-900/50 flex items-center justify-center"><Zap className="h-6 w-6 text-danger-600" /></div>
          <div>
            <h1 className="text-3xl font-display font-bold text-surface-900 dark:text-white">Flash Sales</h1>
            <p className="text-surface-500 dark:text-surface-400">Grab these deals before they're gone!</p>
          </div>
        </div>
        {sales[0]?.endTime && <CountdownTimer targetDate={sales[0].endTime} variant="danger" size="lg" label="Ends in" />}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />) : sales.map((sale) => (
          <motion.div key={sale._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <ProductCard product={{ ...sale.product, price: sale.salePrice, comparePrice: sale.product?.price }} flashSale={sale} />
          </motion.div>
        ))}
      </div>
      {!loading && sales.length === 0 && (
        <div className="text-center py-20">
          <Zap className="h-16 w-16 text-surface-300 mx-auto mb-4" />
          <p className="text-lg font-medium text-surface-500">No active flash sales right now</p>
          <p className="text-sm text-surface-400 mt-1">Check back later for amazing deals!</p>
        </div>
      )}
    </div>
  );
}
