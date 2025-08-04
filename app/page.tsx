'use client';

import { useState, useEffect } from 'react';
import HeroBanner from '@/components/HeroBanner';
import CategoryGrid from '@/components/CategoryGrid';
import ProductCard from '@/components/ProductCard';
import { supabase } from '@/lib/supabase';
import { Product } from '@/store/wishlist';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(8);

      if (error) throw error;
      
      // Transform Supabase data to match ProductCard expected format
      const transformedProducts = (data || []).map((product: any) => ({
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        originalPrice: product.discount ? product.price / (1 - product.discount / 100) : product.price,
        discount: product.discount || undefined,
        image: product.images?.[0] || '/placeholder-image.svg',
        category: product.category as 'sepatu' | 'tas' | 'pakaian',
        subcategory: product.subcategory,
        gender: product.gender as 'pria' | 'wanita' | 'unisex',
        sizes: product.sizes || [],
        colors: ['Default'], // Default color since it's not in database
        isPromo: product.promo,
        description: product.description || ''
      }));
      
      setFeaturedProducts(transformedProducts);
    } catch (error) {
      console.error('Error fetching featured products:', error);
      // Fallback to empty array if error
      setFeaturedProducts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-6 sm:space-y-8">
      {/* Hero Banner */}
      <HeroBanner />

      {/* Category Quick Links */}
      <section>
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Kategori Populer</h2>
        <CategoryGrid />
      </section>

      {/* Featured Products */}
      <section>
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Produk Unggulan</h2>
        {loading ? (
          <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 aspect-square rounded-lg mb-2"></div>
                <div className="h-3 sm:h-4 bg-gray-200 rounded mb-1"></div>
                <div className="h-3 sm:h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm sm:text-base">Belum ada produk tersedia.</p>
          </div>
        )}
      </section>
    </div>
  );
}