import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { auctionsApi, walletApi } from '../../services/api';
import { socketService } from '../../services/socket';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { toast } from 'sonner';
import { Gavel, Users, Clock } from 'lucide-react';

export default function AuctionDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuthStore();
  const [auction, setAuction] = useState<any>(null);
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [placingBid, setPlacingBid] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    fetchAuctionDetails();
    
    if (isAuthenticated && token) {
      socketService.connect(token);
    }

    socketService.joinAuction(id!);
    socketService.onNewBid(handleNewBid);
    socketService.onAuctionEnded(handleAuctionEnded);

    return () => {
      socketService.leaveAuction(id!);
      socketService.offEvent('new-bid');
      socketService.offEvent('auction-ended');
    };
  }, [id, isAuthenticated, token]);

  useEffect(() => {
    if (auction?.endTime) {
      const timer = setInterval(() => {
        const remaining = new Date(auction.endTime).getTime() - Date.now();
        setTimeLeft(Math.max(0, Math.floor(remaining / 1000)));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [auction?.endTime]);

  const fetchAuctionDetails = async () => {
    try {
      const response = await auctionsApi.getById(id!);
      setAuction(response.data.data.auction);
      setBids(response.data.data.bids || []);
      setTimeLeft(response.data.data.timeLeft);
    } catch (error) {
      console.error('Error fetching auction:', error);
      toast.error('Failed to load auction details');
    } finally {
      setLoading(false);
    }
  };

  const handleNewBid = (data: any) => {
    toast.info(`New bid: $${data.amount}`, {
      duration: 3000,
    });
    fetchAuctionDetails();
  };

  const handleAuctionEnded = (data: any) => {
    toast.success(data.message || 'Auction has ended!');
    fetchAuctionDetails();
  };

  const handlePlaceBid = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to place a bid');
      navigate('/login');
      return;
    }

    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= (auction?.currentPrice || 0)) {
      toast.error(`Bid must be greater than current price $${auction?.currentPrice}`);
      return;
    }

    setPlacingBid(true);
    try {
      await auctionsApi.placeBid(id!, amount);
      toast.success('Bid placed successfully!');
      setBidAmount('');
      fetchAuctionDetails();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to place bid');
    } finally {
      setPlacingBid(false);
    }
  };

  const formatTimeLeft = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full size-12 border-b-2 border-[#4F46E5]"></div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Auction not found</p>
        <Button onClick={() => navigate('/auctions')} className="mt-4">Back to Auctions</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Image */}
        <div>
          <img
            src={auction.productId?.images?.[0]?.url || 'https://placehold.co/600'}
            alt={auction.productId?.name}
            className="w-full rounded-lg shadow-lg"
          />
        </div>

        {/* Auction Info */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{auction.productId?.name}</h1>
          <p className="text-gray-600 mb-6">{auction.productId?.description}</p>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">Current Bid:</span>
              <span className="text-3xl font-bold text-[#10B981]">${auction.currentPrice}</span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">Starting Price:</span>
              <span>${auction.startingPrice}</span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">Minimum Increment:</span>
              <span>${auction.minBidIncrement}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Clock className="size-5 text-[#EF4444]" />
                <span className="text-gray-600">Time Left:</span>
              </div>
              <span className="text-xl font-bold text-[#EF4444]">{formatTimeLeft(timeLeft)}</span>
            </div>
          </div>

          {auction.status === 'active' && timeLeft > 0 && (
            <div className="mb-6">
              <div className="flex gap-3">
                <Input
                  type="number"
                  placeholder={`Min: $${(auction.currentPrice + auction.minBidIncrement).toFixed(2)}`}
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handlePlaceBid} disabled={placingBid}>
                  <Gavel className="size-4" />
                  {placingBid ? 'Placing...' : 'Place Bid'}
                </Button>
              </div>
            </div>
          )}

          {auction.status === 'ended' && (
            <div className="bg-yellow-50 rounded-lg p-4 mb-6">
              <p className="text-yellow-800 text-center">This auction has ended</p>
            </div>
          )}
        </div>
      </div>

      {/* Bids History */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="size-6" />
          Bid History ({bids.length} bids)
        </h2>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">User</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Bid Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {bids.map((bid: any, index: number) => (
                  <tr key={bid._id} className={index === 0 ? 'bg-green-50' : ''}>
                    <td className="px-6 py-4 text-sm text-gray-900">{bid.userId?.name || 'User'}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-[#10B981]">${bid.amount}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(bid.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {bids.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                      No bids yet. Be the first to bid!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
