'use client';

import { Heart, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { useWishlistStore } from '@/store/wishlist';

export default function WishlistPage() {
  const { items, clearWishlist } = useWishlistStore();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Wishlist Kosong</h1>
          <p className="text-muted-foreground mb-6">
            Belum ada produk yang ditambahkan ke wishlist Anda
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
            Mulai Belanja
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Wishlist Saya</h1>
          <p className="text-muted-foreground mt-1">
            {items.length} produk tersimpan
          </p>
        </div>
        
        <button
          onClick={clearWishlist}
          className="text-sm text-red-600 hover:text-red-700 underline"
        >
          Hapus Semua
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}