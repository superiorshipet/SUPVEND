import DashboardLayout from '@/components/layouts/DashboardLayout';
import { User, MapPin, Package, Wallet, Gavel, Bell } from 'lucide-react';

const navItems = [
  { label: 'Profile', path: '/dashboard/profile', icon: User, end: true },
  { label: 'Addresses', path: '/dashboard/addresses', icon: MapPin },
  { label: 'Orders', path: '/dashboard/orders', icon: Package },
  { label: 'Wallet', path: '/dashboard/wallet', icon: Wallet },
  { label: 'Auctions', path: '/dashboard/auctions', icon: Gavel },
  { label: 'Notifications', path: '/dashboard/notifications', icon: Bell },
];

export default function CustomerDashboardWrapper() {
  return <DashboardLayout navItems={navItems} title="My Account" />;
}
