import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Gavel, Star, TrendingUp, ShoppingBag, ChevronRight } from 'lucide-react';
import { productAPI, flashSaleAPI, auctionAPI, categoryAPI } from '@/api/endpoints';
import ProductCard from '@/components/shared/ProductCard';
import CountdownTimer from '@/components/ui/CountdownTimer';
import Button from '@/components/ui/Button';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { formatCurrency } from '@/utils/helpers';

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [flashSales, setFlashSales] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, flashRes, auctRes, catRes] = await Promise.allSettled([
          productAPI.getAll({ limit: 8, sort: '-createdAt' }),
          flashSaleAPI.getActive({ limit: 4 }),
          auctionAPI.getActive({ limit: 4 }),
          categoryAPI.getAll(),
        ]);
        if (prodRes.status === 'fulfilled') setFeatured(prodRes.value.data?.data?.products || prodRes.value.data?.products || []);
        if (flashRes.status === 'fulfilled') setFlashSales(flashRes.value.data?.data?.flashSales || flashRes.value.data?.flashSales || []);
        if (auctRes.status === 'fulfilled') setAuctions(auctRes.value.data?.data?.auctions || auctRes.value.data?.auctions || []);
        if (catRes.status === 'fulfilled') setCategories(catRes.value.data?.data?.categories || catRes.value.data?.categories || []);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-accent-700">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImciIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCBmaWxsPSJ1cmwoI2cpIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIi8+PC9zdmc+')] opacity-50" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-32 relative">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.6 }} className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-white/90 text-sm mb-6">
              <Zap className="h-4 w-4" /> New arrivals every day
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-white leading-tight mb-6">
              Discover Amazing Products from <span className="text-accent-300">Top Vendors</span>
            </h1>
            <p className="text-lg text-white/80 mb-8 max-w-lg">Shop from thousands of verified vendors. Get the best deals on flash sales and live auctions.</p>
            <div className="flex flex-wrap gap-3">
              <Link to="/shop"><Button variant="secondary" size="lg" icon={ShoppingBag}>Browse Shop</Button></Link>
              <Link to="/flash-sales"><Button size="lg" className="bg-white/10 border border-white/20 text-white hover:bg-white/20 backdrop-blur-sm" icon={Zap}>Flash Sales</Button></Link>
            </div>
          </motion.div>
          {/* Stats */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.3 }} className="grid grid-cols-3 gap-4 mt-16 max-w-lg">
            {[{ label: 'Products', value: '10K+' }, { label: 'Vendors', value: '500+' }, { label: 'Happy Customers', value: '50K+' }].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl md:text-3xl font-bold text-white">{s.value}</p>
                <p className="text-sm text-white/60">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-display font-bold text-surface-900 dark:text-white">Shop by Category</h2>
              <p className="text-surface-500 dark:text-surface-400 mt-1">Browse our curated collections</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.slice(0, 6).map((cat, i) => (
              <motion.div key={cat._id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.05 }}>
                <Link to={`/shop?category=${cat._id}`} className="group flex flex-col items-center gap-3 p-4 rounded-xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 hover:shadow-card-hover hover:border-primary-200 dark:hover:border-primary-800 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ShoppingBag className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <span className="text-sm font-medium text-surface-700 dark:text-surface-300 text-center">{cat.name}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Flash Sales */}
      {flashSales.length > 0 && (
        <section className="bg-gradient-to-r from-danger-50 to-warning-50 dark:from-danger-950/30 dark:to-warning-950/30 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-danger-100 dark:bg-danger-900/50 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-danger-600 dark:text-danger-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-display font-bold text-surface-900 dark:text-white">Flash Sales</h2>
                  <p className="text-surface-500 dark:text-surface-400 text-sm">Limited time deals — grab them fast!</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {flashSales[0]?.endTime && <CountdownTimer targetDate={flashSales[0].endTime} variant="danger" />}
                <Link to="/flash-sales" className="text-sm font-medium text-danger-600 dark:text-danger-400 hover:underline flex items-center gap-1">View All <ChevronRight className="h-4 w-4" /></Link>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {flashSales.map((sale) => (
                <motion.div key={sale._id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                  <Link to={`/flash-sales`} className="block bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 overflow-hidden group hover:shadow-card-hover transition-all">
                    <div className="aspect-square bg-surface-100 dark:bg-surface-800 relative overflow-hidden">
                      {sale.product?.images?.[0] && <img src={sale.product.images[0].url} alt={sale.product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                      <div className="absolute top-3 left-3 px-2 py-1 bg-danger-600 text-white text-xs font-bold rounded-lg">FLASH SALE</div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-surface-900 dark:text-white truncate">{sale.product?.name}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-lg font-bold text-danger-600">{formatCurrency(sale.salePrice)}</span>
                        <span className="text-sm text-surface-400 line-through">{formatCurrency(sale.product?.price)}</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Live Auctions */}
      {auctions.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent-100 dark:bg-accent-900/50 flex items-center justify-center">
                <Gavel className="h-5 w-5 text-accent-600 dark:text-accent-400" />
              </div>
              <div>
                <h2 className="text-2xl font-display font-bold text-surface-900 dark:text-white">Live Auctions</h2>
                <p className="text-surface-500 dark:text-surface-400 text-sm">Bid on exclusive items in real-time</p>
              </div>
            </div>
            <Link to="/auctions" className="text-sm font-medium text-accent-600 dark:text-accent-400 hover:underline flex items-center gap-1">View All <ChevronRight className="h-4 w-4" /></Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {auctions.map((auction) => (
              <motion.div key={auction._id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <Link to={`/auctions/${auction._id}`} className="block bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 overflow-hidden group hover:shadow-card-hover transition-all">
                  <div className="aspect-square bg-surface-100 dark:bg-surface-800 relative overflow-hidden">
                    {auction.product?.images?.[0] && <img src={auction.product.images[0].url} alt={auction.product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                    <div className="absolute top-3 right-3"><div className="w-3 h-3 bg-success-500 rounded-full animate-pulse" /></div>
                    <div className="absolute bottom-3 left-3 right-3"><CountdownTimer targetDate={auction.endTime} variant="accent" size="sm" /></div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-surface-900 dark:text-white truncate">{auction.product?.name}</h3>
                    <div className="flex items-center justify-between mt-2">
                      <div>
                        <p className="text-xs text-surface-500">Current Bid</p>
                        <p className="text-lg font-bold text-accent-600 dark:text-accent-400">{formatCurrency(auction.currentBid || auction.startingPrice)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-surface-500">Bids</p>
                        <p className="text-sm font-semibold text-surface-700 dark:text-surface-300">{auction.bids?.length || 0}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-display font-bold text-surface-900 dark:text-white">Featured Products</h2>
            <p className="text-surface-500 dark:text-surface-400 mt-1">Handpicked for you</p>
          </div>
          <Link to="/shop" className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">Browse All <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : featured.map((product, i) => (
                <motion.div key={product._id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.05 }}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-surface-900 dark:bg-surface-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">Start Selling on SUPVEND</h2>
            <p className="text-surface-400 mb-8 max-w-md mx-auto">Join hundreds of successful vendors and reach millions of customers worldwide.</p>
            <Link to="/register"><Button variant="gradient" size="lg" icon={TrendingUp}>Become a Vendor</Button></Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
