import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Gavel, TrendingUp, Clock, Users, Trophy } from 'lucide-react';
import { auctionAPI } from '@/api/endpoints';
import { bidSchema } from '@/utils/validators';
import { useSocket } from '@/context/SocketContext';
import CountdownTimer from '@/components/ui/CountdownTimer';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { formatCurrency, formatRelativeTime } from '@/utils/helpers';
import toast from 'react-hot-toast';

export default function AuctionDetail() {
  const { id } = useParams();
  const socket = useSocket();
  const { user, isAuthenticated } = useSelector((s) => s.auth);
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bidding, setBidding] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue } = useForm({ resolver: zodResolver(bidSchema) });

  const fetchAuction = useCallback(async () => {
    try {
      const { data } = await auctionAPI.getById(id);
      setAuction(data?.data?.auction || data?.data || data?.auction);
    } catch { toast.error('Auction not found'); }
    setLoading(false);
  }, [id]);

  useEffect(() => { fetchAuction(); }, [fetchAuction]);

  useEffect(() => {
    if (!socket) return;
    socket.emit('join-auction', id);
    socket.on('new-bid', (data) => {
      setAuction((prev) => prev ? { ...prev, currentBid: data.amount, bids: [data, ...(prev.bids || [])] } : prev);
    });
    socket.on('auction-ended', () => { fetchAuction(); });
    return () => { socket.emit('leave-auction', id); socket.off('new-bid'); socket.off('auction-ended'); };
  }, [socket, id]);

  const onBid = async (data) => {
    if (!isAuthenticated) { toast.error('Please login to bid'); return; }
    setBidding(true);
    try {
      await auctionAPI.placeBid(id, data);
      toast.success('Bid placed successfully!');
      fetchAuction();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to place bid'); }
    setBidding(false);
  };

  if (loading) return <PageLoader />;
  if (!auction) return <div className="text-center py-20 text-surface-500">Auction not found</div>;

  const minBid = (auction.currentBid || auction.startingPrice) + (auction.minBidIncrement || 1);
  const isWinner = auction.winner && auction.winner === user?._id;
  const isEnded = new Date(auction.endTime) < new Date();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Product Image */}
        <div className="lg:col-span-3">
          <div className="aspect-video rounded-2xl overflow-hidden bg-surface-100 dark:bg-surface-800">
            {auction.product?.images?.[0] ? <img src={auction.product.images[0].url} alt={auction.product.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Gavel className="h-20 w-20 text-surface-300" /></div>}
          </div>
          <div className="mt-6">
            <h1 className="text-2xl md:text-3xl font-display font-bold text-surface-900 dark:text-white">{auction.product?.name}</h1>
            <p className="text-surface-600 dark:text-surface-400 mt-3">{auction.product?.description}</p>
          </div>
          {/* Bid History */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4 flex items-center gap-2"><Clock className="h-5 w-5" /> Bid History</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {(auction.bids || []).length === 0 ? <p className="text-surface-500 text-sm">No bids yet. Be the first!</p> : auction.bids.map((bid, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-800">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center shrink-0"><span className="text-xs font-bold text-white">{bid.bidder?.name?.charAt(0) || '?'}</span></div>
                    <div><p className="text-sm font-medium text-surface-900 dark:text-white">{bid.bidder?.name || 'Anonymous'}</p><p className="text-xs text-surface-500">{formatRelativeTime(bid.createdAt || bid.time)}</p></div>
                  </div>
                  <span className="font-bold text-accent-600 dark:text-accent-400">{formatCurrency(bid.amount)}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Bid Panel */}
        <div className="lg:col-span-2">
          <div className="sticky top-24 space-y-6">
            <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 p-6 shadow-card">
              {isEnded ? (
                <div className="text-center">
                  <Trophy className="h-12 w-12 text-warning-500 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-1">Auction Ended</h3>
                  {isWinner && <p className="text-success-600 font-medium">🎉 Congratulations! You won!</p>}
                  <p className="text-2xl font-bold text-accent-600 dark:text-accent-400 mt-3">{formatCurrency(auction.currentBid || auction.startingPrice)}</p>
                  <p className="text-sm text-surface-500 mt-1">Final Price</p>
                </div>
              ) : (
                <>
                  <div className="text-center mb-6"><CountdownTimer targetDate={auction.endTime} variant="accent" size="lg" label="Time Remaining" /></div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 rounded-xl bg-accent-50 dark:bg-accent-900/20 text-center">
                      <p className="text-xs text-surface-500 mb-1">Current Bid</p>
                      <p className="text-xl font-bold text-accent-600 dark:text-accent-400">{formatCurrency(auction.currentBid || auction.startingPrice)}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-surface-50 dark:bg-surface-800 text-center">
                      <p className="text-xs text-surface-500 mb-1">Total Bids</p>
                      <p className="text-xl font-bold text-surface-900 dark:text-white">{auction.bids?.length || 0}</p>
                    </div>
                  </div>
                  <form onSubmit={handleSubmit(onBid)} className="space-y-4">
                    <Input type="number" label={`Minimum Bid: ${formatCurrency(minBid)}`} placeholder={`${minBid}`} icon={TrendingUp} step="0.01" error={errors.amount?.message} {...register('amount')} />
                    <Button type="submit" fullWidth isLoading={bidding} variant="gradient" size="lg" icon={Gavel}>Place Bid</Button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
