import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Gavel, Clock } from 'lucide-react';

interface Auction {
  _id: string;
  currentPrice: number;
  startingPrice: number;
  minBidIncrement: number;
  endTime: string;
  remainingSeconds: number;
  status: string;
  productId: {
    _id: string;
    name: string;
    description: string;
    images: Array<{ url: string }>;
  };
}

export default function AuctionsPage() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuctions();
  }, []);

  const fetchAuctions = async () => {
    try {
      const response = await fetch('/api/v1/auctions/active');
      const data = await response.json();
      console.log('API Response:', data);
      
      // Get auctions from the response
      const allAuctions = data.data?.auctions || [];
      console.log('All auctions:', allAuctions.length);
      
      // Filter to only show auctions with valid product data
      const validAuctions = allAuctions.filter(
        (auction: any) => auction.productId !== null && auction.productId?._id
      );
      console.log('Valid auctions with products:', validAuctions.length);
      
      setAuctions(validAuctions);
    } catch (error) {
      console.error('Error fetching auctions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeLeft = (seconds: number) => {
    if (!seconds || seconds <= 0) return 'Ending soon';
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h left`;
    return `${Math.floor(seconds / 60)}m left`;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full size-12 border-b-2 border-[#4F46E5]"></div>
      </div>
    );
  }

  if (auctions.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-500">No active auctions at the moment</p>
        <p className="text-sm text-gray-400 mt-2">Check back later!</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Live Auctions</h1>
        <p className="text-gray-600">Bid on exclusive items before time runs out!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {auctions.map((auction) => (
          <div key={auction._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
            <Link to={`/auctions/${auction._id}`}>
              <img
                src={auction.productId?.images?.[0]?.url || 'https://placehold.co/400x300/4F46E5/white?text=No+Image'}
                alt={auction.productId?.name}
                className="w-full h-48 object-cover"
              />
            </Link>
            <div className="p-4">
              <Link to={`/auctions/${auction._id}`}>
                <h3 className="font-semibold text-gray-900 mb-2 hover:text-[#4F46E5] line-clamp-2">
                  {auction.productId?.name}
                </h3>
              </Link>
              <div className="mb-3">
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">Current Bid:</span>
                  <span className="text-xl font-bold text-[#10B981]">${auction.currentPrice?.toFixed(2)}</span>
                </div>
                <div className="text-sm text-gray-500">
                  Starting: ${auction.startingPrice?.toFixed(2)}
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                <Clock className="size-4" />
                <span>{formatTimeLeft(auction.remainingSeconds)}</span>
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
    </div>
  );
}
