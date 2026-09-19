import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Minus, Plus, Store, Star, Truck, Shield, RotateCcw } from 'lucide-react';
import { productAPI } from '@/api/endpoints';
import { addToCart } from '@/store/slices/cartSlice';
import Button from '@/components/ui/Button';
import Rating from '@/components/ui/Rating';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { formatCurrency } from '@/utils/helpers';
import toast from 'react-hot-toast';

export default function ProductDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((s) => s.auth);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await productAPI.getById(id);
        setProduct(data?.data?.product || data?.data || data?.product);
      } catch { toast.error('Product not found'); }
      setLoading(false);
    };
    fetch();
  }, [id]);

  if (loading) return <PageLoader />;
  if (!product) return <div className="text-center py-20 text-surface-500">Product not found</div>;

  const images = product.images || [];
  const handleAddToCart = () => {
    if (!isAuthenticated) { toast.error('Please login first'); return; }
    dispatch(addToCart({ product: product._id, quantity }));
    toast.success('Added to cart!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Images */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="aspect-square rounded-2xl overflow-hidden bg-surface-100 dark:bg-surface-800 mb-4">
            {images[selectedImage] ? (
              <img src={images[selectedImage].url} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center"><ShoppingCart className="h-20 w-20 text-surface-300" /></div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <button key={i} onClick={() => setSelectedImage(i)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 cursor-pointer transition-all ${i === selectedImage ? 'border-primary-500 ring-2 ring-primary-500/30' : 'border-surface-200 dark:border-surface-700'}`}>
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Details */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          {product.vendor && (
            <Link to={`/vendors/${product.vendor._id || product.vendor}`} className="inline-flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 hover:underline">
              <Store className="h-4 w-4" /> {product.vendor.storeName || 'View Vendor'}
            </Link>
          )}
          <h1 className="text-2xl md:text-3xl font-display font-bold text-surface-900 dark:text-white">{product.name}</h1>
          {product.rating !== undefined && <Rating value={product.rating || 0} count={product.reviewCount || product.numReviews} size="md" />}
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-surface-900 dark:text-white">{formatCurrency(product.price)}</span>
            {product.comparePrice > product.price && (
              <>
                <span className="text-lg text-surface-400 line-through">{formatCurrency(product.comparePrice)}</span>
                <span className="px-2 py-1 bg-danger-50 dark:bg-danger-900/30 text-danger-600 text-sm font-bold rounded-lg">{Math.round((1 - product.price / product.comparePrice) * 100)}% OFF</span>
              </>
            )}
          </div>
          <p className="text-surface-600 dark:text-surface-400 leading-relaxed">{product.description}</p>
          <div className="border-t border-surface-200 dark:border-surface-800 pt-6">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-medium text-surface-700 dark:text-surface-300">Quantity</span>
              <div className="flex items-center border border-surface-300 dark:border-surface-600 rounded-lg">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 hover:bg-surface-100 dark:hover:bg-surface-800 cursor-pointer"><Minus className="h-4 w-4" /></button>
                <span className="px-4 text-sm font-medium min-w-[40px] text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="p-2 hover:bg-surface-100 dark:hover:bg-surface-800 cursor-pointer"><Plus className="h-4 w-4" /></button>
              </div>
              <span className="text-sm text-surface-500">{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</span>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleAddToCart} size="lg" icon={ShoppingCart} disabled={product.stock <= 0} className="flex-1" variant="gradient">Add to Cart</Button>
              <Button variant="outline" size="lg" icon={Heart}>Wishlist</Button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 pt-4">
            {[{ icon: Truck, label: 'Free Shipping' }, { icon: Shield, label: 'Secure Payment' }, { icon: RotateCcw, label: 'Easy Returns' }].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50 text-center">
                <Icon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                <span className="text-xs font-medium text-surface-600 dark:text-surface-400">{label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
