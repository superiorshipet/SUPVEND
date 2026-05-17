import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { ArrowRight, Zap, Gavel, TrendingUp, ShoppingBag } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { ProductCard } from '../components/product/ProductCard';
import { productsApi, flashSalesApi, auctionsApi } from '../../services/api';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [flashSales, setFlashSales] = useState<any[]>([]);
  const [activeAuctions, setActiveAuctions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      const [productsRes, flashRes, auctionsRes] = await Promise.all([
        productsApi.getAll({ limit: 8, sort: '-createdAt' }),
        flashSalesApi.getActive(),
        auctionsApi.getActive(),
      ]);

      // Transform products
      const products = (productsRes.data.data.products || []).map((p: any) => ({
        id: p._id,
        name: p.name,
        description: p.description,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        stock: p.stock,
        images: p.images?.map((img: any) => img.url) || [],
        rating: p.rating,
        totalReviews: p.totalReviews,
      }));
      setFeaturedProducts(products);

      setFlashSales(flashRes.data.flashSales || []);
      setActiveAuctions(auctionsRes.data.auctions || []);
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full size-12 border-b-2 border-[#4F46E5]"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold mb-6">Shop Smart, Save Big</h1>
              <p className="text-xl mb-8 text-white/90">
                Discover amazing deals, flash sales, and exciting auctions all in one place.
              </p>
              <div className="flex gap-4">
                <Link to="/products">
                  <Button variant="secondary" size="lg">
                    <ShoppingBag className="size-5" />
                    Shop Now
                  </Button>
                </Link>
                <Link to="/auctions">
                  <Button variant="outline" size="lg" className="bg-transparent border-white text-white hover:bg-white hover:text-[#4F46E5]">
                    <Gavel className="size-5" />
                    View Auctions
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <img
                src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800"
                alt="Shopping"
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-[#F9FAFB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-6 text-center shadow-sm border border-gray-200">
              <div className="bg-[#4F46E5]/10 size-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="size-8 text-[#4F46E5]" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Best Prices</h3>
              <p className="text-gray-600 text-sm">Competitive prices on all products</p>
            </div>
            <div className="bg-white rounded-lg p-6 text-center shadow-sm border border-gray-200">
              <div className="bg-[#F59E0B]/10 size-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="size-8 text-[#F59E0B]" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Flash Sales</h3>
              <p className="text-gray-600 text-sm">Limited time deals every day</p>
            </div>
            <div className="bg-white rounded-lg p-6 text-center shadow-sm border border-gray-200">
              <div className="bg-[#10B981]/10 size-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gavel className="size-8 text-[#10B981]" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Live Auctions</h3>
              <p className="text-gray-600 text-sm">Bid on exclusive items</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Products</h2>
              <p className="text-gray-600">Check out our top-rated products</p>
            </div>
            <Link to="/products">
              <Button variant="outline">
                View All
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
