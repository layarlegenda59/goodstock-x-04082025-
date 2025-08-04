'use client';

import { useState, useMemo, useEffect } from 'react';
import { Filter, SlidersHorizontal } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import FilterDrawer from '@/components/FilterDrawer';
import { categories } from '@/lib/mockData';
import { Product } from '@/store/wishlist';
import { supabase } from '@/lib/supabase';

interface FilterState {
  categories: string[];
  sizes: string[];
  gender: string;
  brand: string;
  priceRange: [number, number];
  isPromo: boolean;
}

interface CategoryPageClientProps {
  params: { slug: string };
  searchParams: { subcategory?: string };
}

export default function CategoryPageClient({ params, searchParams }: CategoryPageClientProps) {
  const { slug } = params;
  const { subcategory } = searchParams;

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [filters, setFilters] = useState<FilterState>({
    categories: slug !== 'all' ? [slug] : [],
    sizes: [],
    gender: '',
    brand: '',
    priceRange: [0, 10000000],
    isPromo: false,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

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
        images: product.images || ['/placeholder-image.svg'],
        category: product.category,
        subcategory: product.subcategory,
        gender: product.gender,
        sizes: product.sizes || [],
        colors: ['Default'],
        isPromo: product.promo,
        description: product.description || ''
      }));
      
      setProducts(transformedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const category = categories[slug as keyof typeof categories];
  const pageTitle = category?.name || 'Semua Produk';

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter((product) => {
      // Category filter
      if (filters.categories.length > 0 && !filters.categories.includes(product.category)) {
        return false;
      }
      
      // Subcategory filter
      if (subcategory && product.subcategory !== subcategory) {
        return false;
      }
      
      // Size filter
      if (filters.sizes.length > 0) {
        const hasMatchingSize = filters.sizes.some(size => product.sizes.includes(size));
        if (!hasMatchingSize) return false;
      }
      
      // Gender filter
      if (filters.gender && product.gender !== filters.gender) {
        return false;
      }
      
      // Brand filter
      if (filters.brand && product.brand !== filters.brand) {
        return false;
      }
      
      // Price filter
      if (product.price > filters.priceRange[1]) {
        return false;
      }
      
      // Promo filter
      if (filters.isPromo && !product.isPromo) {
        return false;
      }
      
      return true;
    });

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'discount':
        filtered.sort((a, b) => (b.discount || 0) - (a.discount || 0));
        break;
      case 'newest':
      default:
        // Keep original order for newest
        break;
    }

    return filtered;
  }, [products, filters, sortBy, subcategory]);

  const handleApplyFilters = () => {
    setIsFilterOpen(false);
  };

  return (
    <div className="container mx-auto container-responsive py-responsive">
      <div className="flex flex-col md:flex-row gap-responsive">
        {/* Desktop Sidebar */}
        <div className="hidden md:block md:w-80">
          <FilterDrawer
            isOpen={true}
            onClose={() => {}}
            filters={filters}
            onFiltersChange={setFilters}
            onApplyFilters={handleApplyFilters}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
            <div>
              <h1 className="text-responsive-2xl font-bold">
                {subcategory || pageTitle}
              </h1>
              <p className="text-muted-foreground mt-1 text-responsive-sm">
                {filteredAndSortedProducts.length} produk ditemukan
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 sm:flex-none btn-responsive border rounded-lg bg-background text-responsive-sm"
              >
                <option value="newest">Terbaru</option>
                <option value="price-low">Harga Terendah</option>
                <option value="price-high">Harga Tertinggi</option>
                <option value="discount">Diskon Terbesar</option>
              </select>

              {/* Mobile Filter Button */}
              <button
                onClick={() => setIsFilterOpen(true)}
                className="md:hidden flex items-center gap-2 btn-responsive border rounded-lg bg-background hover:bg-accent transition-colors touch-target"
              >
                <Filter className="icon-responsive-sm" />
                <span className="text-responsive-sm">Filter</span>
              </button>
            
            {/* Desktop Filter Toggle */}
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="hidden md:flex items-center gap-2 btn-responsive border rounded-lg bg-background hover:bg-accent transition-colors"
            >
              <Filter className="icon-responsive-sm" />
              <span className="text-responsive-sm">Filter</span>
            </button>
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 grid-responsive">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 aspect-square rounded-lg mb-2"></div>
                  <div className="h-3 sm:h-4 bg-gray-200 rounded mb-1"></div>
                  <div className="h-3 sm:h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 grid-responsive">
                {filteredAndSortedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Empty State */}
              {filteredAndSortedProducts.length === 0 && (
                <div className="text-center py-responsive">
                  <SlidersHorizontal className="w-8 h-8 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-responsive-lg font-medium mb-2">Tidak ada produk ditemukan</h3>
                  <p className="text-muted-foreground text-responsive-sm">
                    Coba sesuaikan filter Anda
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onFiltersChange={setFilters}
        onApplyFilters={handleApplyFilters}
      />
    </div>
  );
}