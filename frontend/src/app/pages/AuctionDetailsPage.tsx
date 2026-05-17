import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { auctionsApi, walletApi } from '../../services/api';
import { socketService } from '../../services/socket';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { toast } from 'sonner';
import { Gavel, Users, Clock, Trophy, Wallet as WalletIcon } from 'lucide-react';

export default function AuctionDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, isAuthenticated, user } = useAuthStore();
  const [auction, setAuction] = useState<any>(null);
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [placingBid, setPlacingBid] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    fetchAuctionDetails();
    fetchWalletBalance();
    
    if (isAuthenticated && token) {
      socketService.connect(token);
    }

    socketService.joinAuction(id!);
    socketService.onNewBid(handleNewBid);
    socketService.onAuctionEnded(handleAuctionEnded);
    socketService.onOutbid(handleOutbid);

    return () => {
      socketService.leaveAuction(id!);
      socketService.offEvent('new-bid');
      socketService.offEvent('auction-ended');
      socketService.offEvent('outbid');
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

  const fetchWalletBalance = async () => {
    if (!isAuthenticated) return;
    try {
      const response = await walletApi.get();
      setWalletBalance(response.data.data.wallet.balance);
    } catch (error) {
      console.error('Error fetching wallet:', error);
    }
  };

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
    toast.info(`New bid: $${data.amount}`, { duration: 3000 });
    fetchAuctionDetails();
  };

  const handleAuctionEnded = (data: any) => {
    toast.success(data.message || 'Auction has ended!');
    fetchAuctionDetails();
  };

  const handleOutbid = (data: any) => {
    toast.warning(`You've been outbid! New bid: $${data.newBid}`);
    fetchAuctionDetails();
    fetchWalletBalance();
  };

  const handlePlaceBid = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to place a bid');
      navigate('/login');
      return;
    }

    const amount = parseFloat(bidAmount);
    const minBid = (auction?.currentPrice || 0) + (auction?.minBidIncrement || 0);
    
    if (isNaN(amount) || amount < minBid) {
      toast.error(`Minimum bid is $${minBid.toFixed(2)}`);
      return;
    }

    if (amount > walletBalance) {
      toast.error(`Insufficient balance. Your balance: $${walletBalance.toFixed(2)}`);
      return;
    }

    setPlacingBid(true);
    try {
      await auctionsApi.placeBid(id!, amount);
      toast.success('Bid placed successfully!');
      setBidAmount('');
      fetchAuctionDetails();
      fetchWalletBalance();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to place bid');
    } finally {
      setPlacingBid(false);
    }
  };

  const formatTimeLeft = (seconds: number) => {
    if (seconds <= 0) return 'Auction Ended';
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full size-12 border-b-2 border-[#4F46E5]"></div>
      </div>
    );
  }

  if (!auction || !auction.productId) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Auction not found</p>
        <Button onClick={() => navigate('/auctions')} className="mt-4">Back to Auctions</Button>
      </div>
    );
  }

  const isActive = auction.status === 'active' && timeLeft > 0;
  const isHighestBidder = auction.winnerId === user?.id;
  const nextMinBid = auction.currentPrice + auction.minBidIncrement;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <img
            src={auction.productId?.images?.[0]?.url || 'https://placehold.co/600x600/4F46E5/white?text=No+Image'}
            alt={auction.productId?.name}
            className="w-full rounded-lg shadow-lg"
          />
        </div>

        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{auction.productId?.name}</h1>
          <p className="text-gray-600 mb-6">{auction.productId?.description}</p>

          <div className="bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] rounded-lg p-6 mb-6 text-white">
            <div className="flex justify-between items-center mb-4">
              <span className="text-white/80">Current Highest Bid</span>
              {isHighestBidder && (
                <span className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-sm font-bold">
                  You're winning! 🏆
                </span>
              )}
            </div>
            <div className="text-5xl font-bold mb-4">${auction.currentPrice?.toFixed(2)}</div>
            <div className="flex justify-between text-sm text-white/80">
              <span>Started: ${auction.startingPrice?.toFixed(2)}</span>
              <span>Min increment: ${auction.minBidIncrement?.toFixed(2)}</span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Clock className="size-5 text-[#EF4444]" />
                <span className="text-gray-600">Time Left:</span>
              </div>
              <span className={`text-xl font-bold ${timeLeft < 300 ? 'text-[#EF4444]' : 'text-gray-900'}`}>
                {formatTimeLeft(timeLeft)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Users className="size-5 text-[#4F46E5]" />
                <span className="text-gray-600">Total Bids:</span>
              </div>
              <span className="font-semibold text-gray-900">{auction.totalBids || bids.length}</span>
            </div>
            {isAuthenticated && (
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <WalletIcon className="size-5 text-[#10B981]" />
                  <span className="text-gray-600">Your Balance:</span>
                </div>
                <span className="font-semibold text-[#10B981]">${walletBalance.toFixed(2)}</span>
              </div>
            )}
          </div>

          {isActive ? (
            <div className="mb-6">
              <div className="flex gap-3">
                <Input
                  type="number"
                  placeholder={`Min bid: $${nextMinBid.toFixed(2)}`}
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handlePlaceBid} disabled={placingBid || !isAuthenticated}>
                  <Gavel className="size-4" />
                  {placingBid ? 'Placing...' : 'Place Bid'}
                </Button>
              </div>
              {!isAuthenticated && (
                <p className="text-sm text-gray-500 mt-2">
                  Please <a href="/login" className="text-[#4F46E5]">login</a> to place a bid
                </p>
              )}
            </div>
          ) : auction.status === 'ended' ? (
            <div className="bg-yellow-50 rounded-lg p-4 mb-6">
              <p className="text-yellow-800 text-center font-semibold">
                Auction has ended!
                {auction.winnerId === user?.id && (
                  <span className="block text-green-600 mt-1">Congratulations! You won!</span>
                )}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="size-6" />
          Bid History ({bids.length} bids)
        </h2>
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Bidder</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {bids.map((bid, index) => (
                  <tr key={bid._id} className={index === 0 ? 'bg-green-50' : ''}>
                    <td className="px-6 py-4 text-sm">
                      {bid.userId?.name || 'Anonymous'}
                      {index === 0 && <span className="ml-2 text-xs text-green-600">(Highest)</span>}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-green-600">${bid.amount?.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(bid.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
                {bids.length === 0 && (
                  <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-500">No bids yet. Be the first to bid!</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
