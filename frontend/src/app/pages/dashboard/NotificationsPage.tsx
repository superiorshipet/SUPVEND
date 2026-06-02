import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { notificationsApi } from '../../../services/api';
import { Button } from '../../components/ui/Button';
import { Bell, CheckCheck, Package, Gavel, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await notificationsApi.getAll();
      // Handle different response structures
      const data = response.data.data?.notifications || response.data.notifications || [];
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      fetchNotifications();
      toast.success('Marked as read');
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      fetchNotifications();
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order_status_changed': return <Package className="size-5 text-blue-500" />;
      case 'auction_won': return <Gavel className="size-5 text-green-500" />;
      case 'auction_outbid': return <Gavel className="size-5 text-red-500" />;
      case 'auction_lost': return <Gavel className="size-5 text-orange-500" />;
      case 'payment_received': return <DollarSign className="size-5 text-green-500" />;
      case 'new_order': return <Package className="size-5 text-purple-500" />;
      default: return <Bell className="size-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full size-12 border-b-2 border-[#4F46E5]"></div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Bell className="size-5" />
            <CardTitle>Notifications</CardTitle>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          {notifications.length > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <CheckCheck className="size-4" />
              Mark All Read
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="size-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-500">No notifications yet</p>
            <p className="text-sm text-gray-400 mt-1">When you have notifications, they'll appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <div
                key={notif._id}
                className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                  notif.isRead ? 'bg-white' : 'bg-blue-50 border-blue-200'
                }`}
                onClick={() => !notif.isRead && markAsRead(notif._id)}
              >
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notif.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900">{notif.title}</p>
                        <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(notif.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {!notif.isRead && (
                        <div className="size-2 bg-blue-500 rounded-full mt-2"></div>
                      )}
                    </div>
                    {notif.data?.orderId && (
                      <Link to={`/dashboard/orders/${notif.data.orderId}`}>
                        <Button variant="outline" size="sm" className="mt-3">
                          View Order
                        </Button>
                      </Link>
                    )}
                    {notif.data?.auctionId && (
                      <Link to={`/auctions/${notif.data.auctionId}`}>
                        <Button variant="outline" size="sm" className="mt-3">
                          View Auction
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
