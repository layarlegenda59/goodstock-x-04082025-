'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import FilterDrawer from '@/components/FilterDrawer';
import { supabase } from '@/lib/supabase';


interface FilterState {
  categories: string[];
  sizes: string[];
  gender: string;
  brand: string;
  priceRange: [number, number];
  isPromo: boolean;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
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
    } catch (error: any) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];

    let results = products.filter((product) => {
      const searchTerm = query.toLowerCase();
      const matchesSearch = 
        product.name.toLowerCase().includes(searchTerm) ||
        product.brand.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm) ||
        product.subcategory.toLowerCase().includes(searchTerm) ||
        (product.description && product.description.toLowerCase().includes(searchTerm));

      if (!matchesSearch) return false;

      // Apply filters
      if (filters.categories.length > 0 && !filters.categories.includes(product.category)) {
        return false;
      }
      
      if (filters.sizes.length > 0) {
        const hasMatchingSize = filters.sizes.some(size => product.sizes.includes(size));
        if (!hasMatchingSize) return false;
      }
      
      if (filters.gender && product.gender !== filters.gender) {
        return false;
      }
      
      if (filters.brand && product.brand !== filters.brand) {
        return false;
      }
      
      if (product.price > filters.priceRange[1]) {
        return false;
      }
      
      if (filters.isPromo && !product.isPromo) {
        return false;
      }
      
      return true;
    });

    // Sort results
    switch (sortBy) {
      case 'price-low':
        results.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        results.sort((a, b) => b.price - a.price);
        break;
      case 'discount':
        results.sort((a, b) => (b.discount || 0) - (a.discount || 0));
        break;
      case 'name':
        results.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'relevance':
      default:
        // Sort by relevance (exact matches first, then partial matches)
        results.sort((a, b) => {
          const aExact = a.name.toLowerCase() === query.toLowerCase() ? 1 : 0;
          const bExact = b.name.toLowerCase() === query.toLowerCase() ? 1 : 0;
          return bExact - aExact;
        });
        break;
    }

    return results;
  }, [query, filters, sortBy, products]);

  const handleApplyFilters = () => {
    setIsFilterOpen(false);
  };

  if (!query.trim()) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Cari Produk</h1>
          <p className="text-muted-foreground">
            Gunakan search bar di atas untuk mencari produk yang Anda inginkan
          </p>
        </div>
      </div>
    );
  }

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
                Hasil pencarian: &quot;{query}&quot;
              </h1>
              <p className="text-muted-foreground mt-1 text-responsive-sm">
                {searchResults.length} produk ditemukan
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 sm:flex-none btn-responsive border rounded-lg bg-background text-responsive-sm"
              >
                <option value="relevance">Relevansi</option>
                <option value="name">Nama A-Z</option>
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
            </div>
          </div>

          {/* Search Results */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 grid-responsive">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-200 aspect-square rounded-lg mb-2"></div>
                  <div className="bg-gray-200 h-3 sm:h-4 rounded mb-1"></div>
                  <div className="bg-gray-200 h-3 sm:h-4 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : searchResults.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 grid-responsive">
              {searchResults.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-responsive">
              <Search className="w-8 h-8 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-responsive-lg font-medium mb-2">Tidak ada hasil ditemukan</h3>
              <p className="text-muted-foreground mb-6 text-responsive-sm">
                Maaf, tidak ada produk yang cocok dengan pencarian &quot;<strong>{query}</strong>&quot;
              </p>
              <div className="space-y-2 text-responsive-sm text-muted-foreground">
                <p>Saran:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Periksa ejaan kata kunci</li>
                  <li>Gunakan kata kunci yang lebih umum</li>
                  <li>Coba kata kunci yang berbeda</li>
                  <li>Kurangi filter yang diterapkan</li>
                </ul>
              </div>
            </div>
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