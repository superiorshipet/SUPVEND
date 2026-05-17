import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Button } from '../components/ui/Button';
import { Zap, Clock } from 'lucide-react';

interface FlashSale {
  _id: string;
  discountedPrice: number;
  originalPrice: number;
  discountPercentage: number;
  endTime: string;
  remainingSeconds: number;
  availableQuantity: number;
  soldQuantity: number;
  productId: {
    _id: string;
    name: string;
    description: string;
    images: Array<{ url: string }>;
  };
}

export default function FlashSalesPage() {
  const [flashSales, setFlashSales] = useState<FlashSale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFlashSales();
  }, []);

  const fetchFlashSales = async () => {
    try {
      const response = await fetch('/api/v1/flash-sales/active');
      const data = await response.json();
      console.log('Flash Sales API Response:', data);
      
      const allSales = data.data?.flashSales || [];
      console.log('All flash sales:', allSales.length);
      
      // Filter to only show sales with valid product data
      const validSales = allSales.filter(
        (sale: any) => sale.productId !== null && sale.productId?._id
      );
      console.log('Valid flash sales with products:', validSales.length);
      
      setFlashSales(validSales);
    } catch (error) {
      console.error('Error fetching flash sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeLeft = (seconds: number) => {
    if (!seconds || seconds <= 0) return 'Ended';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full size-12 border-b-2 border-[#4F46E5]"></div>
      </div>
    );
  }

  if (flashSales.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <Zap className="size-16 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500">No active flash sales at the moment</p>
        <p className="text-sm text-gray-400 mt-2">Check back later for amazing deals!</p>
        <Link to="/products">
          <Button className="mt-4">Browse Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Flash Sales</h1>
        <p className="text-gray-600">Limited time offers - grab them before they're gone!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {flashSales.map((sale) => (
          <div key={sale._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
              <Link to={`/products/${sale.productId?._id}`}>
                <img
                  src={sale.productId?.images?.[0]?.url || 'https://placehold.co/400x300/4F46E5/white?text=No+Image'}
                  alt={sale.productId?.name}
                  className="w-full h-48 object-cover"
                />
              </Link>
              <div className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1 rounded-full flex items-center gap-1 text-sm font-bold">
                <Zap className="size-4 fill-current" />
                -{sale.discountPercentage}%
              </div>
            </div>
            <div className="p-4">
              <Link to={`/products/${sale.productId?._id}`}>
                <h3 className="font-semibold text-gray-900 mb-2 hover:text-[#4F46E5] line-clamp-2">
                  {sale.productId?.name}
                </h3>
              </Link>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-2xl font-bold text-red-500">${sale.discountedPrice?.toFixed(2)}</span>
                <span className="text-sm text-gray-500 line-through">${sale.originalPrice?.toFixed(2)}</span>
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Sold: {sale.soldQuantity || 0}</span>
                  <span>Left: {sale.availableQuantity || 0}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full"
                    style={{ width: `${((sale.soldQuantity || 0) / ((sale.soldQuantity || 0) + (sale.availableQuantity || 1))) * 100}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-red-500 font-medium mb-3">
                <Clock className="size-4" />
                <span>{formatTimeLeft(sale.remainingSeconds)}</span>
              </div>
              <Link to={`/products/${sale.productId?._id}`}>
                <Button className="w-full" disabled={sale.availableQuantity === 0}>
                  {sale.availableQuantity === 0 ? 'Sold Out' : 'Shop Now'}
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
