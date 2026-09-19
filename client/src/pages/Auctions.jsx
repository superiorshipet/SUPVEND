import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gavel } from 'lucide-react';
import { auctionAPI } from '@/api/endpoints';
import CountdownTimer from '@/components/ui/CountdownTimer';
import { formatCurrency } from '@/utils/helpers';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';

export default function Auctions() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    auctionAPI.getActive().then((res) => {
      setAuctions(res.data?.data?.auctions || res.data?.auctions || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-accent-100 dark:bg-accent-900/50 flex items-center justify-center"><Gavel className="h-6 w-6 text-accent-600" /></div>
        <div>
          <h1 className="text-3xl font-display font-bold text-surface-900 dark:text-white">Live Auctions</h1>
          <p className="text-surface-500 dark:text-surface-400">Bid on exclusive items in real-time</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />) : auctions.map((a) => (
          <motion.div key={a._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Link to={`/auctions/${a._id}`} className="block bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 overflow-hidden group hover:shadow-card-hover transition-all">
              <div className="aspect-video bg-surface-100 dark:bg-surface-800 relative overflow-hidden">
                {a.product?.images?.[0] && <img src={a.product.images[0].url} alt={a.product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded-full bg-success-500/90 text-white text-xs font-medium"><div className="w-2 h-2 bg-white rounded-full animate-pulse" /> Live</div>
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-surface-900 dark:text-white mb-3">{a.product?.name}</h3>
                <div className="flex justify-between items-end mb-4">
                  <div><p className="text-xs text-surface-500 mb-0.5">Current Bid</p><p className="text-xl font-bold text-accent-600 dark:text-accent-400">{formatCurrency(a.currentBid || a.startingPrice)}</p></div>
                  <div className="text-right"><p className="text-xs text-surface-500 mb-0.5">Total Bids</p><p className="text-lg font-semibold text-surface-700 dark:text-surface-300">{a.bids?.length || 0}</p></div>
                </div>
                <CountdownTimer targetDate={a.endTime} variant="accent" size="sm" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
      {!loading && auctions.length === 0 && <div className="text-center py-20"><Gavel className="h-16 w-16 text-surface-300 mx-auto mb-4" /><p className="text-lg text-surface-500">No active auctions</p></div>}
    </div>
  );
}
