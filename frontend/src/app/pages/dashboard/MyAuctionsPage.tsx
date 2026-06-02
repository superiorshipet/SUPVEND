import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { auctionsApi, walletApi } from '../../../services/api';
import { useAuthStore } from '../../../store/authStore';
import { Button } from '../../components/ui/Button';
import { Gavel, Trophy, Clock } from 'lucide-react';

export default function MyAuctionsPage() {
  const { user } = useAuthStore();
  const [activeAuctions, setActiveAuctions] = useState<any[]>([]);
  const [wonAuctions, setWonAuctions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyAuctions();
  }, []);

  const fetchMyAuctions = async () => {
    try {
      const response = await auctionsApi.getActive();
      const allAuctions = response.data.auctions || [];
      
      // Filter auctions user has bid on
      // This requires bids to have userId - we'll simulate for now
      // In a real app, you'd have an endpoint for user's bids
      const userBids = await fetchUserBids();
      
      const userActive = allAuctions.filter(
        (auction: any) => auction.winnerId === user?.id || userBids.includes(auction._id)
      );
      setActiveAuctions(userActive);
      
      // Won auctions are those that ended with user as winner
      // This would come from a different endpoint
      
    } catch (error) {
      console.error('Error fetching auctions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserBids = async () => {
    // This would be an API call to get user's bids
    // For now, return empty array
    return [];
  };

  const formatTimeLeft = (seconds: number) => {
    if (!seconds || seconds <= 0) return 'Ended';
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h left`;
    return `${Math.floor(seconds / 60)}m left`;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full size-12 border-b-2 border-[#4F46E5]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My Active Bids</CardTitle>
        </CardHeader>
        <CardContent>
          {activeAuctions.length === 0 ? (
            <div className="text-center py-8">
              <Gavel className="size-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500">You haven't placed any bids yet</p>
              <Link to="/auctions">
                <Button className="mt-4">Browse Auctions</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {activeAuctions.map((auction) => (
                <div key={auction._id} className="border rounded-lg p-4">
                  <div className="flex gap-4">
                    <img
                      src={auction.productId?.images?.[0]?.url || 'https://placehold.co/80'}
                      alt={auction.productId?.name}
                      className="size-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <Link to={`/auctions/${auction._id}`}>
                        <h3 className="font-semibold hover:text-blue-600">{auction.productId?.name}</h3>
                      </Link>
                      <p className="text-sm text-gray-500">Current bid: ${auction.currentPrice}</p>
                      <div className="flex items-center gap-2 mt-2 text-sm text-orange-500">
                        <Clock className="size-4" />
                        <span>{formatTimeLeft(auction.remainingSeconds)}</span>
                      </div>
                    </div>
                    <div>
                      {auction.winnerId === user?.id && (
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                          <Trophy className="size-4" />
                          Winning
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Auction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500">Coming soon - Track your auction history</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
