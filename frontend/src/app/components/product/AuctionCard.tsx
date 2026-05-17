import { Link } from 'react-router';
import { Gavel, TrendingUp } from 'lucide-react';
import { Auction } from '../../../types';
import { CountdownTimer } from '../ui/CountdownTimer';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface AuctionCardProps {
  auction: Auction;
}

export function AuctionCard({ auction }: AuctionCardProps) {
  const { product, currentPrice, startingPrice, endTime, status, bids } = auction;
  const bidCount = bids?.length || 0;

  const statusVariant = {
    upcoming: 'gray' as const,
    active: 'success' as const,
    ended: 'danger' as const,
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      <Link to={`/auctions/${auction.id}`} className="block relative">
        <div className="aspect-square overflow-hidden bg-gray-100">
          <img
            src={product.images[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute top-2 left-2">
          <Badge variant={statusVariant[status]}>
            {status === 'upcoming' ? 'Upcoming' : status === 'active' ? 'Live Auction' : 'Ended'}
          </Badge>
        </div>
      </Link>

      <div className="p-4">
        <Link to={`/auctions/${auction.id}`}>
          <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 hover:text-[#4F46E5]">
            {product.name}
          </h3>
        </Link>

        <div className="mb-3">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-sm text-gray-600">Current Bid:</span>
            <span className="text-2xl font-bold text-[#10B981]">${currentPrice.toFixed(2)}</span>
          </div>
          <div className="text-sm text-gray-500">
            Starting: ${startingPrice.toFixed(2)}
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
          <TrendingUp className="size-4" />
          <span>{bidCount} bid{bidCount !== 1 ? 's' : ''}</span>
        </div>

        {status === 'active' && <CountdownTimer endTime={endTime} className="mb-3" />}

        <Link to={`/auctions/${auction.id}`}>
          <Button className="w-full" disabled={status !== 'active'}>
            <Gavel className="size-4" />
            {status === 'active' ? 'Place Bid' : status === 'upcoming' ? 'View Auction' : 'Auction Ended'}
          </Button>
        </Link>
      </div>
    </div>
  );
}
