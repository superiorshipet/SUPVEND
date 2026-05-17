import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { flashSalesApi } from '../../services/api';
import { Button } from '../components/ui/Button';
import { toast } from 'sonner';
import { Zap } from 'lucide-react';

export default function FlashSalesPage() {
  const [flashSales, setFlashSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFlashSales();
  }, []);

  const fetchFlashSales = async () => {
    try {
      const response = await flashSalesApi.getActive();
      setFlashSales(response.data.flashSales || []);
    } catch (error) {
      console.error('Error fetching flash sales:', error);
      toast.error('Failed to load flash sales');
    } finally {
      setLoading(false);
    }
  };

  const getTimeLeft = (endTime: string) => {
    const diff = new Date(endTime).getTime() - Date.now();
    if (diff <= 0) return 'Ended';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m left`;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full size-12 border-b-2 border-[#4F46E5]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Flash Sales</h1>
        <p className="text-gray-600">Limited time offers - grab them before they're gone!</p>
      </div>

      {flashSales.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Zap className="size-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">No active flash sales at the moment</p>
          <Link to="/products">
            <Button className="mt-4">Browse Products</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flashSales.map((sale: any) => (
            <div key={sale._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <Link to={`/products/${sale.productId._id}`}>
                <img
                  src={sale.productId.images?.[0]?.url || 'https://placehold.co/400'}
                  alt={sale.productId.name}
                  className="w-full h-48 object-cover"
                />
              </Link>
              <div className="p-4">
                <Link to={`/products/${sale.productId._id}`}>
                  <h3 className="font-semibold text-gray-900 mb-2 hover:text-[#4F46E5]">
                    {sale.productId.name}
                  </h3>
                </Link>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-2xl font-bold text-[#EF4444]">${sale.discountedPrice}</span>
                  <span className="text-sm text-gray-500 line-through">${sale.originalPrice}</span>
                  <span className="text-sm text-[#10B981]">-{sale.discountPercentage}%</span>
                </div>
                <div className="mb-3">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Sold: {sale.soldQuantity}</span>
                    <span>Left: {sale.availableQuantity}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#F59E0B] h-2 rounded-full"
                      style={{ width: `${(sale.soldQuantity / (sale.soldQuantity + sale.availableQuantity)) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="text-sm text-[#EF4444] font-medium mb-3">
                  {getTimeLeft(sale.endTime)}
                </div>
                <Link to={`/products/${sale.productId._id}`}>
                  <Button className="w-full" disabled={sale.availableQuantity === 0}>
                    {sale.availableQuantity === 0 ? 'Sold Out' : 'Shop Now'}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
