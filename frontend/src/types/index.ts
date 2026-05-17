export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'vendor' | 'admin';
  avatar?: string;
  phone?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  stock: number;
  images: string[];
  category: Category;
  vendor: Vendor;
  rating: number;
  reviewsCount: number;
  variants?: ProductVariant[];
  createdAt: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  options: { [key: string]: string };
  price: number;
  stock: number;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  parentId?: string;
}

export interface Vendor {
  id: string;
  name: string;
  logo?: string;
  rating: number;
  productsCount: number;
  description?: string;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  variantId?: string;
  variant?: ProductVariant;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  total: number;
  coupon?: Coupon;
  discount: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: string;
  shippingAddress: Address;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  product: Product;
  quantity: number;
  price: number;
  variant?: ProductVariant;
  status: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

export interface FlashSale {
  id: string;
  product: Product;
  discountedPrice: number;
  startTime: string;
  endTime: string;
  availableQuantity: number;
  soldQuantity: number;
}

export interface Auction {
  id: string;
  product: Product;
  startingPrice: number;
  currentPrice: number;
  startTime: string;
  endTime: string;
  status: 'upcoming' | 'active' | 'ended';
  bids: Bid[];
  winnerId?: string;
}

export interface Bid {
  id: string;
  auctionId: string;
  userId: string;
  userName: string;
  amount: number;
  createdAt: string;
}

export interface Wallet {
  balance: number;
  totalDeposited: number;
  totalSpent: number;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'payment' | 'refund';
  amount: number;
  description: string;
  createdAt: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface Notification {
  id: string;
  type: 'order' | 'auction' | 'payment' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderValue: number;
  endDate: string;
  description?: string;
}

export interface DashboardStats {
  todayRevenue: number;
  weekRevenue: number;
  totalRevenue: number;
  availableBalance: number;
  newOrders: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
}
