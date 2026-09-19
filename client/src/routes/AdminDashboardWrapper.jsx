import DashboardLayout from '@/components/layouts/DashboardLayout';
import { BarChart3, Users, Store, Package, ShoppingCart, Zap, Gavel, FolderTree, Tag, DollarSign, FileText } from 'lucide-react';

const navItems = [
  { label: 'Overview', path: '/admin', icon: BarChart3, end: true },
  { label: 'Users', path: '/admin/users', icon: Users },
  { label: 'Vendors', path: '/admin/vendors', icon: Store },
  { label: 'Products', path: '/admin/products', icon: Package },
  { label: 'Orders', path: '/admin/orders', icon: ShoppingCart },
  { label: 'Flash Sales', path: '/admin/flash-sales', icon: Zap },
  { label: 'Auctions', path: '/admin/auctions', icon: Gavel },
  { label: 'Categories', path: '/admin/categories', icon: FolderTree },
  { label: 'Coupons', path: '/admin/coupons', icon: Tag },
  { label: 'Payouts', path: '/admin/payouts', icon: DollarSign },
  { label: 'Reports', path: '/admin/reports', icon: FileText },
];

export default function AdminDashboardWrapper() {
  return <DashboardLayout navItems={navItems} title="Admin Panel" />;
}
