'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import HeroBanner from '@/components/HeroBanner';
import CategoryGrid from '@/components/CategoryGrid';
import ProductCard from '@/components/ProductCard';
import { supabase } from '@/lib/supabase';
import { Product } from '@/store/wishlist';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasNetworkError, setHasNetworkError] = useState(false);
  const [retryAttempts, setRetryAttempts] = useState(0);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchFeaturedProducts = useCallback(async (retryCount = 0) => {
    try {
      setLoading(true);
      
      // Create AbortController with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(8); // Fixed: Removed invalid abortSignal method

      clearTimeout(timeoutId);

      if (error) throw error;
      
      // Transform Supabase data to match ProductCard expected format
      const transformedProducts = (data || []).map((product: any) => ({
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        originalPrice: product.discount && product.discount > 0 ? product.price / (1 - product.discount / 100) : product.price,
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
      
      // Reset error states on successful fetch
      setHasNetworkError(false);
      setRetryAttempts(0);
    } catch (error: any) {
      console.error('Error fetching featured products:', error);
      
      // Check if it's a network-related error
      const isNetworkError = error?.name === 'AbortError' || error?.message?.includes('fetch') || error?.message?.includes('QUIC') || error?.message?.includes('Failed to fetch') || error?.message?.includes('ERR_ABORTED');
      
      // Retry logic for network errors
      if (retryCount < 2 && isNetworkError) {
        console.log(`Retrying fetch featured products (attempt ${retryCount + 1})...`);
        setTimeout(() => fetchFeaturedProducts(retryCount + 1), 1000 * (retryCount + 1)); // Exponential backoff
        return;
      }
      
      // Set network error state for auto-retry mechanism
      if (isNetworkError && retryCount >= 2) {
        setHasNetworkError(true);
      }
      
      // Fallback to empty array if error
      setFeaturedProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []); // Fixed: Removed fetchFeaturedProducts from dependency array

  // Auto-retry mechanism for network errors
  useEffect(() => {
    if (hasNetworkError && retryAttempts < 3) {
      const retryDelay = Math.min(5000 * Math.pow(2, retryAttempts), 30000); // Max 30 seconds
      console.log(`Auto-retry scheduled for featured products in ${retryDelay/1000} seconds (attempt ${retryAttempts + 1})`);
      
      retryTimeoutRef.current = setTimeout(() => {
        console.log('Auto-retrying to fetch featured products...');
        setRetryAttempts(prev => prev + 1);
        fetchFeaturedProducts(0); // Reset retry count for fetchFeaturedProducts
      }, retryDelay);
      
      return () => {
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
        }
      };
    }
  }, [hasNetworkError, retryAttempts, fetchFeaturedProducts]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="container mx-auto container-responsive py-responsive space-y-6 sm:space-y-8">
      {/* Hero Banner */}
      <HeroBanner />

      {/* Category Quick Links */}
      <section>
        <h2 className="text-responsive-2xl font-bold mb-4 sm:mb-6">Kategori Populer</h2>
        <CategoryGrid />
      </section>

      {/* Featured Products */}
      <section>
        <h2 className="text-responsive-2xl font-bold mb-4 sm:mb-6">Produk Unggulan</h2>
        {loading ? (
          <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 grid-responsive">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 aspect-square rounded-lg mb-2"></div>
                <div className="h-3 sm:h-4 bg-gray-200 rounded mb-1"></div>
                <div className="h-3 sm:h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 grid-responsive">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p className="text-responsive-sm">Belum ada produk tersedia.</p>
          </div>
        )}
      </section>
    </div>
  );
}