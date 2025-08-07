import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  images?: string[];
  category: 'sepatu' | 'tas' | 'pakaian';
  subcategory: string;
  gender: 'pria' | 'wanita' | 'unisex';
  sizes: string[];
  colors?: string[];
  isPromo?: boolean;
  description?: string;
}

interface WishlistStore {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) =>
        set((state) => ({
          items: state.items.find((item) => item.id === product.id)
            ? state.items
            : [...state.items, product],
        })),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        })),
      isInWishlist: (productId) => {
        const state = get();
        return state.items.some((item) => item.id === productId);
      },
      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'wishlist-storage',
    }
  )
);