'use client';

import { X, Filter, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { brands, categories, shoeSizes, clothingSizes } from '@/lib/mockData';


// Debug: Check if data is properly loaded
console.log('Filter data loaded:', { 
  brands: brands?.length, 
  categories: Object.keys(categories || {}).length,
  shoeSizes: shoeSizes?.length,
  clothingSizes: clothingSizes?.length
});
interface FilterState {
  categories: string[];
  sizes: string[];
  gender: string;
  brand: string;
  priceRange: [number, number];
  isPromo: boolean;
}

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onApplyFilters: () => void;
}

export default function FilterDrawer({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  onApplyFilters,
}: FilterDrawerProps) {

  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  // Browser compatibility check
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('Browser info:', {
        userAgent: navigator.userAgent,
        supports: {
          flexbox: CSS.supports('display', 'flex'),
          grid: CSS.supports('display', 'grid'),
        }
      });
    }
  }, []);
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleCategoryToggle = (category: string) => {
    const newCategories = localFilters.categories.includes(category)
      ? localFilters.categories.filter((c) => c !== category)
      : [...localFilters.categories, category];
    
    setLocalFilters({ ...localFilters, categories: newCategories });
  };

  const handleSizeToggle = (size: string) => {
    const newSizes = localFilters.sizes.includes(size)
      ? localFilters.sizes.filter((s) => s !== size)
      : [...localFilters.sizes, size];
    
    setLocalFilters({ ...localFilters, sizes: newSizes });
  };

  const handleApply = () => {
    onFiltersChange(localFilters);
    onApplyFilters();
    onClose();
  };

  const clearFilters = () => {
    const clearedFilters: FilterState = {
      categories: [],
      sizes: [],
      gender: '',
      brand: '',
      priceRange: [0, 10000000],
      isPromo: false,
    };
    setLocalFilters(clearedFilters);
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 md:relative md:w-80 ${!isOpen ? 'md:hidden' : ''}`}>
      {/* Overlay */}
      <div 
        className={`absolute inset-0 bg-black/50 md:hidden transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`} 
        onClick={onClose} 
      />
      
      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-background border-l md:static md:border-l-0 md:border md:rounded-lg md:max-w-none">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
        ${isOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-lg transition-colors md:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-6 overflow-y-auto h-full pb-24 md:pb-4">
          {/* Categories */}
          <div>
            <h3 className="font-medium mb-3">Kategori</h3>
            <div className="space-y-2">
              {Object.entries(categories).map(([key, category]) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localFilters.categories.includes(key)}
                    onChange={() => handleCategoryToggle(key)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">{category.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Sizes */}
          <div>
            <h3 className="font-medium mb-3">Ukuran</h3>
            <div className="space-y-3">
              <div>
                <h4 className="text-sm text-muted-foreground mb-2">Sepatu (EU)</h4>
                <div className="grid grid-cols-4 gap-2">
                  {shoeSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => handleSizeToggle(size)}
                      className={`p-2 text-xs border rounded transition-colors ${
                        localFilters.sizes.includes(size)
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'hover:bg-accent'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm text-muted-foreground mb-2">Pakaian</h4>
                <div className="grid grid-cols-3 gap-2">
                  {clothingSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => handleSizeToggle(size)}
                      className={`p-2 text-xs border rounded transition-colors ${
                        localFilters.sizes.includes(size)
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'hover:bg-accent'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Gender */}
          <div>
            <h3 className="font-medium mb-3">Gender</h3>
            <div className="space-y-2">
              {['pria', 'wanita', 'unisex'].map((gender) => (
                <label key={gender} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value={gender}
                    checked={localFilters.gender === gender}
                    onChange={(e) => setLocalFilters({ ...localFilters, gender: e.target.value })}
                    className="text-primary"
                  />
                  <span className="text-sm capitalize">{gender}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Brand */}
          <div>
            <h3 className="font-medium mb-3">Brand</h3>
            <select
              value={localFilters.brand}
              onChange={(e) => setLocalFilters({ ...localFilters, brand: e.target.value })}
              className="w-full p-2 border rounded-lg bg-background"
            >
              <option value="">Semua Brand</option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div>
            <h3 className="font-medium mb-3">Rentang Harga</h3>
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="10000000"
                step="100000"
                value={localFilters.priceRange[1]}
                onChange={(e) =>
                  setLocalFilters({
                    ...localFilters,
                    priceRange: [localFilters.priceRange[0], parseInt(e.target.value)],
                  })
                }
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Rp 0</span>
                <span>Rp {localFilters.priceRange[1].toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>

          {/* Promo */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={localFilters.isPromo}
                onChange={(e) => setLocalFilters({ ...localFilters, isPromo: e.target.checked })}
                className="rounded border-gray-300"
              />
              <span className="text-sm">Promo Aktif</span>
            </label>
          </div>

          <div className="flex gap-2">
            <button
              onClick={clearFilters}
              className="flex-1 py-2 px-4 border rounded-lg hover:bg-accent transition-colors text-sm"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Apply Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t md:static md:border-t-0">
          <button
            onClick={handleApply}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Terapkan Filter
          </button>
        </div>
      </div>
    </div>
  );
}