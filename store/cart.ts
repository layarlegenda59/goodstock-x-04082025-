import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from './wishlist';

export interface CartItem {
  product: Product;
  selectedSize: string;
  selectedColor?: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, selectedSize: string, selectedColor?: string, quantity?: number) => void;
  removeItem: (productId: string, selectedSize: string) => void;
  updateQuantity: (productId: string, selectedSize: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getItemKey: (productId: string, selectedSize: string) => string;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product, selectedSize, selectedColor, quantity = 1) => {
        const state = get();
        const existingItemIndex = state.items.findIndex(
          item => item.product.id === product.id && item.selectedSize === selectedSize
        );

        if (existingItemIndex >= 0) {
          // Update quantity if item already exists
          const updatedItems = [...state.items];
          updatedItems[existingItemIndex].quantity += quantity;
          set({ items: updatedItems });
        } else {
          // Add new item
          const newItem: CartItem = {
            product,
            selectedSize,
            selectedColor,
            quantity,
          };
          set({ items: [...state.items, newItem] });
        }
      },

      removeItem: (productId, selectedSize) =>
        set((state) => ({
          items: state.items.filter(
            item => !(item.product.id === productId && item.selectedSize === selectedSize)
          ),
        })),

      updateQuantity: (productId, selectedSize, quantity) =>
        set((state) => ({
          items: state.items.map(item =>
            item.product.id === productId && item.selectedSize === selectedSize
              ? { ...item, quantity: Math.max(0, quantity) }
              : item
          ).filter(item => item.quantity > 0),
        })),

      clearCart: () => set({ items: [] }),

      getTotalItems: () => {
        const state = get();
        return state.items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        const state = get();
        return state.items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
      },

      getItemKey: (productId, selectedSize) => `${productId}-${selectedSize}`,
    }),
    {
      name: 'cart-storage',
    }
  )
);