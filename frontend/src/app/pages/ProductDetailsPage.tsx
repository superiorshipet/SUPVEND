import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { ShoppingCart, Heart } from 'lucide-react';
import { productsApi } from '../../services/api';
import { useCartStore } from '../../store/cartStore';
import { Button } from '../components/ui/Button';
import { Rating } from '../components/ui/Rating';
import { Badge } from '../components/ui/Badge';
import { toast } from 'sonner';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCartStore();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await productsApi.getById(id!);
      setProduct(response.data.data.product);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
      toast.success(`${product.name} added to cart`);
    }
  };

  const getImageUrl = () => {
    if (product?.images && product.images.length > 0) {
      const img = product.images[0];
      if (typeof img === 'string') return img;
      if (img.url) return img.url;
    }
    return 'https://placehold.co/600x600/4F46E5/white?text=No+Image';
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full size-12 border-b-2 border-[#4F46E5]"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Product not found</p>
      </div>
    );
  }

  const discount = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div>
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={getImageUrl()}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {product.images && product.images.length > 1 && (
            <div className="flex gap-4 mt-4">
              {product.images.slice(1, 4).map((img: any, idx: number) => (
                <div key={idx} className="size-20 rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={typeof img === 'string' ? img : img.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <Badge variant={product.stock > 0 ? 'success' : 'danger'}>
            {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
          </Badge>
          <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-3">{product.name}</h1>
          <div className="flex items-center gap-4 mb-6">
            <Rating value={product.rating || 0} showValue size="md" />
            <span className="text-gray-600">({product.totalReviews || 0} reviews)</span>
          </div>

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-4xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
            {product.compareAtPrice && (
              <>
                <span className="text-xl text-gray-500 line-through">${product.compareAtPrice.toFixed(2)}</span>
                <Badge variant="danger">-{discount}%</Badge>
              </>
            )}
          </div>

          <p className="text-gray-600 mb-6">{product.description}</p>

          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center gap-2 border border-gray-300 rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 hover:bg-gray-100"
              >
                -
              </button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-2 hover:bg-gray-100"
              >
                +
              </button>
            </div>
            <Button onClick={handleAddToCart} size="lg" className="flex-1">
              <ShoppingCart className="size-5" />
              Add to Cart
            </Button>
            <Button variant="outline" size="lg">
              <Heart className="size-5" />
            </Button>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="font-semibold text-gray-900 mb-4">Product Details</h3>
            <dl className="space-y-3">
              <div className="flex">
                <dt className="w-32 text-gray-600">Category:</dt>
                <dd className="text-gray-900">{product.categoryId?.name}</dd>
              </div>
              <div className="flex">
                <dt className="w-32 text-gray-600">Vendor:</dt>
                <dd className="text-gray-900">{product.vendorId?.storeName}</dd>
              </div>
              <div className="flex">
                <dt className="w-32 text-gray-600">Stock:</dt>
                <dd className="text-gray-900">{product.stock} units</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
