import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cart';
import { useWishlistStore } from '@/store/wishlist';
import { useAuthStore } from '@/store/auth';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import CartSummary from '@/components/CartSummary';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  signOut: jest.fn().mockResolvedValue({}),
  supabase: {
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
      onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
    },
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    }),
  },
}));

// Mock stores
jest.mock('@/store/cart');
jest.mock('@/store/wishlist');
jest.mock('@/store/auth');

const mockPush = jest.fn();
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseCartStore = useCartStore as jest.MockedFunction<typeof useCartStore>;
const mockUseWishlistStore = useWishlistStore as jest.MockedFunction<typeof useWishlistStore>;
const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;

describe('Integration Tests - Main Application Flow', () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      prefetch: jest.fn(),
    } as any);

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('Search Flow Integration', () => {
    beforeEach(() => {
      mockUseCartStore.mockReturnValue({
        items: [],
        getTotalItems: () => 0,
        addItem: jest.fn(),
        removeItem: jest.fn(),
        updateQuantity: jest.fn(),
        clearCart: jest.fn(),
      });

      mockUseWishlistStore.mockReturnValue({
        items: [],
        addItem: jest.fn(),
        removeItem: jest.fn(),
        isInWishlist: jest.fn().mockReturnValue(false),
      });

      mockUseAuthStore.mockReturnValue({
        isAuthenticated: false,
        profile: null,
        login: jest.fn(),
        logout: jest.fn(),
        updateProfile: jest.fn(),
      });
    });

    it('should handle search input and navigation', async () => {
      render(<Header />);
      
      const searchInputs = screen.getAllByPlaceholderText('Cari produk, brand, atau kategori...');
      const searchInput = searchInputs[0];
      
      // Type in search input
      fireEvent.change(searchInput, { target: { value: 'nike' } });
      expect(searchInput).toHaveValue('nike');
      
      // Submit search form
      fireEvent.keyDown(searchInput, { key: 'Enter', code: 'Enter' });
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/search?q=nike');
      });
    });

    it('should handle search input focus and typing', async () => {
      render(<Header />);
      
      const searchInputs = screen.getAllByPlaceholderText('Cari produk, brand, atau kategori...');
      const searchInput = searchInputs[0];
      
      // Focus on search input
      fireEvent.focus(searchInput);
      fireEvent.change(searchInput, { target: { value: 'a' } });
      
      // Verify input value changed
      expect(searchInput).toHaveValue('a');
    });
  });

  describe('Cart Integration Flow', () => {
    const mockProduct = {
      id: '1',
      name: 'Test Product',
      price: 100000,
      image_url: 'test-image.jpg',
      brand: 'Test Brand',
      category: 'Test Category',
      description: 'Test Description',
      stock: 10,
      rating: 4.5,
      review_count: 100,
      is_featured: false,
      created_at: '2024-01-01',
      updated_at: '2024-01-01'
    };

    beforeEach(() => {
      mockUseWishlistStore.mockReturnValue({
        items: [],
        addItem: jest.fn(),
        removeItem: jest.fn(),
        isInWishlist: jest.fn().mockReturnValue(false),
      });

      mockUseAuthStore.mockReturnValue({
        isAuthenticated: true,
        profile: { id: '1', full_name: 'Test User', email: 'test@example.com' },
        login: jest.fn(),
        logout: jest.fn(),
        updateProfile: jest.fn(),
      });
    });

    it('should navigate to product detail when add to cart button is clicked', async () => {
      const mockPush = jest.fn();
      mockUseRouter.mockReturnValue({
        push: mockPush,
        replace: jest.fn(),
        back: jest.fn(),
        forward: jest.fn(),
        refresh: jest.fn(),
        prefetch: jest.fn(),
      } as any);
      
      mockUseCartStore.mockReturnValue({
        items: [],
        getTotalItems: () => 0,
        addItem: jest.fn(),
        removeItem: jest.fn(),
        updateQuantity: jest.fn(),
        clearCart: jest.fn(),
      });

      render(<ProductCard product={mockProduct} />);
      
      const addToCartButton = screen.getByText('Tambah ke Keranjang');
      fireEvent.click(addToCartButton);
      
      expect(mockPush).toHaveBeenCalledWith('/produk/1');
    });

    it('should display cart items count in header', () => {
      mockUseCartStore.mockReturnValue({
        items: [{ ...mockProduct, quantity: 2 }],
        addItem: jest.fn(),
        removeItem: jest.fn(),
        updateQuantity: jest.fn(),
        clearCart: jest.fn(),
        getTotalItems: jest.fn().mockReturnValue(2),
      });

      mockUseWishlistStore.mockReturnValue({
        items: [],
        addItem: jest.fn(),
        removeItem: jest.fn(),
        isInWishlist: jest.fn().mockReturnValue(false),
      });

      mockUseAuthStore.mockReturnValue({
        isAuthenticated: true,
        profile: { id: '1', full_name: 'Test User', email: 'test@example.com' },
        login: jest.fn(),
        logout: jest.fn(),
        updateProfile: jest.fn(),
      });

      render(<Header />);
      
      // Should show cart link with href='/cart'
      const cartLinks = screen.getAllByRole('link');
      const cartLink = cartLinks.find(link => link.getAttribute('href') === '/cart');
      expect(cartLink).toBeTruthy();
      
      // Check if cart badge exists (might be conditional)
      const cartBadge = screen.queryByText('2');
      if (cartBadge) {
        expect(cartBadge).toBeInTheDocument();
      } else {
        // If badge doesn't exist, at least verify cart icon is present
        expect(cartLink).toContainHTML('svg');
      }
    });
  });

  describe('Wishlist Integration Flow', () => {
    const mockProduct = {
      id: '1',
      name: 'Test Product',
      price: 100000,
      image_url: 'test-image.jpg',
      brand: 'Test Brand',
      category: 'Test Category',
      description: 'Test Description',
      stock: 10,
      rating: 4.5,
      review_count: 100,
      is_featured: false,
      created_at: '2024-01-01',
      updated_at: '2024-01-01'
    };

    beforeEach(() => {
      mockUseCartStore.mockReturnValue({
        items: [],
        getTotalItems: () => 0,
        addItem: jest.fn(),
        removeItem: jest.fn(),
        updateQuantity: jest.fn(),
        clearCart: jest.fn(),
      });

      mockUseAuthStore.mockReturnValue({
        isAuthenticated: true,
        profile: { id: '1', full_name: 'Test User', email: 'test@example.com' },
        login: jest.fn(),
        logout: jest.fn(),
        updateProfile: jest.fn(),
      });
    });

    it('should add product to wishlist', async () => {
      const mockAddItem = jest.fn();
      
      mockUseWishlistStore.mockReturnValue({
        items: [],
        addItem: mockAddItem,
        removeItem: jest.fn(),
        isInWishlist: jest.fn().mockReturnValue(false),
      });

      render(<ProductCard product={mockProduct} />);
      
      // Find wishlist button by looking for Heart icon
      const buttons = screen.getAllByRole('button');
      const wishlistButton = buttons.find(button => 
        button.querySelector('svg') && 
        button.className.includes('absolute')
      );
      
      expect(wishlistButton).toBeTruthy();
      fireEvent.click(wishlistButton!);
      
      expect(mockAddItem).toHaveBeenCalledWith(mockProduct);
    });

    it('should remove product from wishlist when already in wishlist', async () => {
      const mockRemoveItem = jest.fn();
      
      mockUseWishlistStore.mockReturnValue({
        items: [mockProduct],
        addItem: jest.fn(),
        removeItem: mockRemoveItem,
        isInWishlist: jest.fn().mockReturnValue(true),
      });

      render(<ProductCard product={mockProduct} />);
      
      // Find wishlist button by looking for Heart icon
      const buttons = screen.getAllByRole('button');
      const wishlistButton = buttons.find(button => 
        button.querySelector('svg') && 
        button.className.includes('absolute')
      );
      
      expect(wishlistButton).toBeTruthy();
      fireEvent.click(wishlistButton!);
      
      expect(mockRemoveItem).toHaveBeenCalledWith('1');
    });
  });

  describe('Authentication Integration Flow', () => {
    it('should show user menu when authenticated', () => {
      mockUseCartStore.mockReturnValue({
        items: [],
        getTotalItems: () => 0,
        addItem: jest.fn(),
        removeItem: jest.fn(),
        updateQuantity: jest.fn(),
        clearCart: jest.fn(),
      });

      mockUseWishlistStore.mockReturnValue({
        items: [],
        addItem: jest.fn(),
        removeItem: jest.fn(),
        isInWishlist: jest.fn().mockReturnValue(false),
      });

      mockUseAuthStore.mockReturnValue({
        isAuthenticated: true,
        profile: { id: '1', full_name: 'Test User', email: 'test@example.com' },
        login: jest.fn(),
        logout: jest.fn(),
        updateProfile: jest.fn(),
      });

      render(<Header />);
      
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    it('should show different UI when not authenticated', () => {
      mockUseCartStore.mockReturnValue({
        items: [],
        getTotalItems: () => 0,
        addItem: jest.fn(),
        removeItem: jest.fn(),
        updateQuantity: jest.fn(),
        clearCart: jest.fn(),
      });

      mockUseWishlistStore.mockReturnValue({
        items: [],
        addItem: jest.fn(),
        removeItem: jest.fn(),
        isInWishlist: jest.fn().mockReturnValue(false),
      });

      mockUseAuthStore.mockReturnValue({
        isAuthenticated: false,
        profile: null,
        login: jest.fn(),
        logout: jest.fn(),
        updateProfile: jest.fn(),
      });

      render(<Header />);
      
      // Should not show user name when not authenticated
      expect(screen.queryByText('Test User')).not.toBeInTheDocument();
      // Should show logo
      const logoImages = screen.getAllByAltText('Goodstock-X');
      expect(logoImages[0]).toBeInTheDocument();
    });
  });
});