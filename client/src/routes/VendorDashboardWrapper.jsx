import DashboardLayout from '@/components/layouts/DashboardLayout';
import { BarChart3, Package, ShoppingCart, Zap, Gavel, Tag, User, DollarSign } from 'lucide-react';

const navItems = [
  { label: 'Overview', path: '/vendor', icon: BarChart3, end: true },
  { label: 'Products', path: '/vendor/products', icon: Package },
  { label: 'Orders', path: '/vendor/orders', icon: ShoppingCart },
  { label: 'Flash Sales', path: '/vendor/flash-sales', icon: Zap },
  { label: 'Auctions', path: '/vendor/auctions', icon: Gavel },
  { label: 'Coupons', path: '/vendor/coupons', icon: Tag },
  { label: 'Payouts', path: '/vendor/payouts', icon: DollarSign },
  { label: 'Profile', path: '/vendor/profile', icon: User },
];

export default function VendorDashboardWrapper() {
  return <DashboardLayout navItems={navItems} title="Vendor Dashboard" />;
}
