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
  }, [isInWishlist, product.id]);

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
    <div className="group bg-card rounded-lg border overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer">
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
            <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 bg-red-500 text-white text-responsive-xs font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded">
              {product.discount}% OFF
            </div>
          )}

          {/* Wishlist Button */}
          <button
            onClick={handleWishlistToggle}
            className={`absolute top-1.5 right-1.5 sm:top-2 sm:right-2 p-1.5 sm:p-2 rounded-full transition-all duration-200 touch-target ${
              inWishlist
                ? 'bg-red-500 text-white'
                : 'bg-white/90 text-gray-600 hover:bg-red-500 hover:text-white'
            }`}
          >
            <Heart className="icon-responsive-sm" fill={isHydrated && inWishlist ? 'currentColor' : 'none'} />
          </button>
        </div>

        <div className="card-responsive">
          <div className="text-responsive-xs font-semibold text-primary mb-1">
            {product.brand}
          </div>
          <h3 className="font-medium text-responsive-xs mb-2 line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem] leading-tight">
            {product.name}
          </h3>
          
          <div className="mb-2 sm:mb-3">
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="text-responsive-xs text-muted-foreground line-through">
                {formatPrice(product.originalPrice)}
              </div>
            )}
            <div className="text-responsive-base font-bold text-foreground">
              {formatPrice(product.price)}
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