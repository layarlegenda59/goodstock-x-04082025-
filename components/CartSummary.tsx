'use client';

import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useCartStore } from '@/store/cart';
import { formatPrice } from '@/lib/utils';

export default function CartSummary() {
  const { items, getTotalItems, getTotalPrice } = useCartStore();
  const [isVisible, setIsVisible] = useState(true);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    const totalItems = getTotalItems();
    if (items.length > 0) {
      setIsVisible(true);
      setShouldRender(true);
      
      // Auto-hide after 4 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        // Remove from DOM after animation completes
        setTimeout(() => setShouldRender(false), 300);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [items.length, getTotalItems]);

  if (items.length === 0 || !shouldRender) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-80 z-40">
      <div 
        className={`bg-primary text-primary-foreground rounded-lg p-4 shadow-lg transition-all duration-300 ease-in-out transform ${
          isVisible 
            ? 'opacity-100 translate-y-0 scale-100' 
            : 'opacity-0 translate-y-2 scale-95'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            <span className="font-medium">{getTotalItems()} item dalam keranjang</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold">
            {formatPrice(getTotalPrice())}
          </div>
          <Link
            href="/cart"
            className="bg-white text-primary px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Lihat Keranjang
          </Link>
        </div>
      </div>
    </div>
  );
}