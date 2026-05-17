import { Link } from 'react-router';
import { ShoppingCart, Heart } from 'lucide-react';
import { useCartStore } from '../../../store/cartStore';
import { toast } from 'sonner';

interface ProductCardProps {
  product: any;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product, 1);
    toast.success(`${product.name} added to cart`);
  };

  // Get the main image URL
  const getImageUrl = () => {
    if (product.images && product.images.length > 0) {
      if (typeof product.images[0] === 'string') {
        return product.images[0];
      }
      if (product.images[0].url) {
        return product.images[0].url;
      }
    }
    return 'https://placehold.co/400x400/4F46E5/white?text=No+Image';
  };

  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group hover:shadow-lg transition-shadow">
      <Link to={`/products/${product.id}`} className="block relative">
        <div className="aspect-square overflow-hidden bg-gray-100">
          <img
            src={getImageUrl()}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        </div>
        {discount > 0 && (
          <div className="absolute top-2 left-2 bg-[#EF4444] text-white px-2 py-1 rounded text-sm font-medium">
            -{discount}%
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-medium text-lg">Out of Stock</span>
          </div>
        )}
      </Link>

      <div className="p-4">
        <Link to={`/products/${product.id}`}>
          <h3 className="font-medium text-gray-900 mb-1 line-clamp-2 hover:text-[#4F46E5]">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            <span className="text-yellow-400">★</span>
            <span className="text-sm text-gray-600">{product.rating?.toFixed(1) || '0'}</span>
          </div>
          <span className="text-sm text-gray-500">({product.totalReviews || 0} reviews)</span>
        </div>

        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-xl font-bold text-gray-900">${product.price?.toFixed(2)}</span>
          {product.compareAtPrice && (
            <span className="text-sm text-gray-500 line-through">
              ${product.compareAtPrice.toFixed(2)}
            </span>
          )}
        </div>

        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="w-full bg-[#4F46E5] text-white py-2 rounded-lg hover:bg-[#4338CA] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          <ShoppingCart className="size-4" />
          Add to Cart
        </button>
      </div>
    </div>
  );
}
