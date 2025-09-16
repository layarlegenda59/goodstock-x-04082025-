'use client';

import { Heart, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Product, useWishlistStore } from '@/store/wishlist';
import { formatPrice } from '@/lib/utils';


interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem, removeItem, isInWishlist } = useWishlistStore();
  const router = useRouter();
  const [inWishlist, setInWishlist] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setInWishlist(isInWishlist(product.id));
    setIsHydrated(true);
  }, [product.id]); // Fixed: Removed isInWishlist function from dependencies

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (inWishlist) {
      removeItem(product.id);
      setInWishlist(false);
    } else {
      addItem(product);
      setInWishlist(true);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Navigate to product detail page for size selection
    router.push(`/produk/${product.id}`);
  };

  const handleCardClick = () => {
    router.push(`/produk/${product.id}`);
  };

  return (
    <div className="group bg-card rounded-lg border overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer card-responsive">
      <div onClick={handleCardClick}>
        <div className="relative">
          <div className="aspect-square relative overflow-hidden bg-muted">
            <Image
              src={imageError ? '/placeholder-image.svg' : product.image}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              priority={false}
              onError={() => setImageError(true)}
            />
          </div>
          
          {/* Discount Badge */}
          {product.discount && product.discount > 0 && (
            <div className="absolute top-1 sm:top-2 left-1 sm:left-2 bg-red-500 text-white text-responsive-xs font-medium px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
              {product.discount}% OFF
            </div>
          )}

          {/* Wishlist Button */}
          <button
            onClick={handleWishlistToggle}
            className={`absolute top-2 sm:top-2 right-2 sm:right-2 w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full transition-colors touch-target ${
              inWishlist
                ? 'bg-red-100 text-red-600'
                : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-600'
            }`}
          >
            <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${inWishlist ? 'fill-current' : ''}`} />
          </button>
        </div>

        <div className="padding-responsive">
          <h3 className="font-medium text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors text-responsive-sm">
            {product.name}
          </h3>
          <p className="text-responsive-xs text-gray-500 mb-2">{product.brand}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-bold text-responsive-base text-gray-900">
                Rp {product.price.toLocaleString('id-ID')}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-responsive-xs text-gray-500 line-through">
                  Rp {product.originalPrice.toLocaleString('id-ID')}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            className="w-full btn-responsive bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium flex items-center justify-center gap-1.5 sm:gap-2 transition-colors touch-target"
          >
            <ShoppingCart className="icon-responsive-sm" />
            <span className="hidden xs:inline">Tambah ke Keranjang</span>
            <span className="xs:hidden">Tambah</span>
          </button>
        </div>
      </div>
    </div>
  );
}