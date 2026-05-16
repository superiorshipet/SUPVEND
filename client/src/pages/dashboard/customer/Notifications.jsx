import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Bell, Check, Trash2, CheckCheck } from 'lucide-react';
import { fetchNotifications, markAsRead, markAllAsRead } from '@/store/slices/notificationSlice';
import { notificationAPI } from '@/api/endpoints';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { formatRelativeTime } from '@/utils/helpers';
import toast from 'react-hot-toast';

export default function Notifications() {
  const dispatch = useDispatch();
  const { items, isLoading } = useSelector((s) => s.notifications);

  useEffect(() => { dispatch(fetchNotifications()); }, [dispatch]);

  const handleDelete = async (id) => {
    try { await notificationAPI.delete(id); dispatch(fetchNotifications()); toast.success('Deleted'); } catch { toast.error('Failed'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-surface-900 dark:text-white">Notifications</h2>
        {items.length > 0 && <Button variant="ghost" size="sm" icon={CheckCheck} onClick={() => dispatch(markAllAsRead())}>Mark all read</Button>}
      </div>
      {items.length === 0 ? <EmptyState icon={Bell} title="No notifications" description="You're all caught up!" /> : (
        <div className="space-y-3">
          {items.map((n) => (
            <div key={n._id} className={`flex items-start gap-3 p-4 rounded-xl border transition-colors ${n.isRead ? 'bg-white dark:bg-surface-900 border-surface-200 dark:border-surface-800' : 'bg-primary-50/50 dark:bg-primary-900/10 border-primary-200 dark:border-primary-800'}`}>
              <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${n.isRead ? 'bg-surface-300' : 'bg-primary-500'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-surface-900 dark:text-white">{n.title}</p>
                <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">{n.message}</p>
                <p className="text-xs text-surface-400 mt-1">{formatRelativeTime(n.createdAt)}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {!n.isRead && <button onClick={() => dispatch(markAsRead(n._id))} className="p-1.5 rounded hover:bg-surface-100 dark:hover:bg-surface-800 cursor-pointer"><Check className="h-4 w-4 text-surface-400" /></button>}
                <button onClick={() => handleDelete(n._id)} className="p-1.5 rounded hover:bg-surface-100 dark:hover:bg-surface-800 cursor-pointer"><Trash2 className="h-4 w-4 text-surface-400" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
