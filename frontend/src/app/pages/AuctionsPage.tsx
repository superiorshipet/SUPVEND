import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { auctionsApi } from '../../services/api';
import { Button } from '../components/ui/Button';
import { toast } from 'sonner';
import { Gavel } from 'lucide-react';

export default function AuctionsPage() {
  const [auctions, setAuctions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuctions();
  }, []);

  const fetchAuctions = async () => {
    try {
      const response = await auctionsApi.getActive();
      setAuctions(response.data.auctions || []);
    } catch (error) {
      console.error('Error fetching auctions:', error);
      toast.error('Failed to load auctions');
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Live Auctions</h1>
        <p className="text-gray-600">Bid on exclusive items before time runs out!</p>
      </div>

      {auctions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Gavel className="size-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">No active auctions at the moment</p>
          <Link to="/products">
            <Button className="mt-4">Browse Products</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {auctions.map((auction: any) => (
            <div key={auction._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <Link to={`/auctions/${auction._id}`}>
                <img
                  src={auction.productId?.images?.[0]?.url || 'https://placehold.co/400'}
                  alt={auction.productId?.name}
                  className="w-full h-48 object-cover"
                />
              </Link>
              <div className="p-4">
                <Link to={`/auctions/${auction._id}`}>
                  <h3 className="font-semibold text-gray-900 mb-2 hover:text-[#4F46E5]">
                    {auction.productId?.name}
                  </h3>
                </Link>
                <div className="mb-3">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Current Bid:</span>
                    <span className="text-xl font-bold text-[#10B981]">${auction.currentPrice}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Starting: ${auction.startingPrice}
                  </div>
                </div>
                <div className="text-sm text-[#EF4444] font-medium mb-3">
                  {getTimeLeft(auction.endTime)}
                </div>
                <Link to={`/auctions/${auction._id}`}>
                  <Button className="w-full">
                    <Gavel className="size-4" />
                    Place Bid
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
