import { Link } from 'react-router';
import { Zap } from 'lucide-react';
import { FlashSale } from '../../../types';
import { CountdownTimer } from '../ui/CountdownTimer';
import { Button } from '../ui/Button';

interface FlashSaleCardProps {
  flashSale: FlashSale;
}

export function FlashSaleCard({ flashSale }: FlashSaleCardProps) {
  const { product, discountedPrice, endTime, availableQuantity, soldQuantity } = flashSale;
  const discount = Math.round(((product.price - discountedPrice) / product.price) * 100);
  const progress = (soldQuantity / (soldQuantity + availableQuantity)) * 100;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      <Link to={`/products/${product.id}`} className="block relative">
        <div className="aspect-square overflow-hidden bg-gray-100">
          <img
            src={product.images[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute top-2 left-2 bg-[#EF4444] text-white px-3 py-1 rounded-full flex items-center gap-1 font-medium">
          <Zap className="size-4 fill-current" />
          -{discount}%
        </div>
      </Link>

      <div className="p-4">
        <Link to={`/products/${product.id}`}>
          <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 hover:text-[#4F46E5]">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-2xl font-bold text-[#EF4444]">${discountedPrice.toFixed(2)}</span>
          <span className="text-sm text-gray-500 line-through">${product.price.toFixed(2)}</span>
        </div>

        <CountdownTimer endTime={endTime} className="mb-3" />

        <div className="mb-3">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Sold: {soldQuantity}</span>
            <span>Available: {availableQuantity}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-[#F59E0B] h-full rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <Button className="w-full" disabled={availableQuantity === 0}>
          {availableQuantity === 0 ? 'Sold Out' : 'Buy Now'}
        </Button>
      </div>
    </div>
  );
}
