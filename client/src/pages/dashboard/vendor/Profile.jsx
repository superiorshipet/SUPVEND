import { useSelector } from 'react-redux';
import { User, Store, Mail, Phone } from 'lucide-react';
import Card from '@/components/ui/Card';

export default function Profile() {
  const { user } = useSelector((s) => s.auth);
  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center"><span className="text-2xl font-bold text-white">{user?.name?.charAt(0)?.toUpperCase()}</span></div>
          <div><h2 className="text-xl font-semibold text-surface-900 dark:text-white">{user?.name}</h2><p className="text-sm text-surface-500">{user?.email}</p></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[{ icon: Store, label: 'Store Name', value: user?.storeName || '—' }, { icon: Mail, label: 'Email', value: user?.email }, { icon: Phone, label: 'Phone', value: user?.phone || '—' }, { icon: User, label: 'Role', value: 'Vendor' }].map((item) => (
            <div key={item.label} className="flex items-center gap-3 p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50">
              <item.icon className="h-5 w-5 text-primary-500" />
              <div><p className="text-xs text-surface-500">{item.label}</p><p className="font-medium text-surface-900 dark:text-white">{item.value}</p></div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
