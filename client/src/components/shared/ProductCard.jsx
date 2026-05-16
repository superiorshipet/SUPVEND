import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '@/store/slices/cartSlice';
import Rating from '@/components/ui/Rating';
import CountdownTimer from '@/components/ui/CountdownTimer';
import { formatCurrency } from '@/utils/helpers';
import toast from 'react-hot-toast';

export default function ProductCard({ product, flashSale }) {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((s) => s.auth);
  const img = product?.images?.[0]?.url || product?.image;
  const hasDiscount = flashSale || product?.comparePrice > product?.price;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { toast.error('Please login to add items to cart'); return; }
    dispatch(addToCart({ product: product._id, quantity: 1 }));
    toast.success('Added to cart');
  };

  return (
    <Link to={`/products/${product._id}`} className="group block">
      <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-800 overflow-hidden hover:shadow-card-hover hover:border-surface-300 dark:hover:border-surface-600 transition-all duration-300">
        {/* Image */}
        <div className="aspect-square bg-surface-100 dark:bg-surface-800 relative overflow-hidden">
          {img ? (
            <img src={img} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-surface-300 dark:text-surface-600">
              <ShoppingCart className="h-12 w-12" />
            </div>
          )}
          {/* Badges */}
          {hasDiscount && (
            <span className="absolute top-3 left-3 px-2 py-1 bg-danger-600 text-white text-xs font-bold rounded-lg">
              {flashSale ? 'FLASH SALE' : `${Math.round((1 - product.price / product.comparePrice) * 100)}% OFF`}
            </span>
          )}
          {/* Hover Actions */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={handleAddToCart}
              className="w-10 h-10 rounded-full bg-white dark:bg-surface-800 shadow-lg flex items-center justify-center text-surface-700 dark:text-surface-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer">
              <ShoppingCart className="h-4 w-4" />
            </motion.button>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
              className="w-10 h-10 rounded-full bg-white dark:bg-surface-800 shadow-lg flex items-center justify-center text-surface-700 dark:text-surface-300 hover:text-danger-500 transition-colors cursor-pointer">
              <Heart className="h-4 w-4" />
            </motion.button>
          </div>
          {flashSale?.endTime && (
            <div className="absolute bottom-3 left-3 right-3"><CountdownTimer targetDate={flashSale.endTime} variant="danger" size="sm" /></div>
          )}
        </div>
        {/* Info */}
        <div className="p-4">
          {product.vendor?.storeName && (
            <p className="text-xs text-surface-500 dark:text-surface-400 mb-1">{product.vendor.storeName}</p>
          )}
          <h3 className="font-medium text-surface-900 dark:text-white line-clamp-2 mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {product.name}
          </h3>
          {product.rating !== undefined && <Rating value={product.rating || 0} count={product.reviewCount || product.numReviews} size="xs" />}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-lg font-bold text-surface-900 dark:text-white">{formatCurrency(flashSale?.salePrice || product.price)}</span>
            {(flashSale || product.comparePrice > product.price) && (
              <span className="text-sm text-surface-400 line-through">{formatCurrency(product.comparePrice || product.price)}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
