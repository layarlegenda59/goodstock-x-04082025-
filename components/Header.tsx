'use client';

import { Search, Heart, Moon, Sun, Menu, X, ShoppingCart, User } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWishlistStore } from '@/store/wishlist';
import { useCartStore } from '@/store/cart';
import { useAuthStore } from '@/store/auth';
import { signOut } from '@/lib/supabase';
import { categories } from '@/lib/mockData';


export default function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const router = useRouter();
  const wishlistItems = useWishlistStore((state) => state.items);
  const cartItems = useCartStore((state) => state.getTotalItems());
  const { isAuthenticated, profile, logout } = useAuthStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    await signOut();
    logout();
    setIsMenuOpen(false); // Close mobile menu if open
    router.push('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearchSuggestions(false);
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSearchSuggestions(value.length > 0);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(e as any);
    }
    if (e.key === 'Escape') {
      setShowSearchSuggestions(false);
    }
  };

  const popularSearches = [
    'Nike Air Force 1',
    'Adidas Ultraboost',
    'Jordan 1',
    'Converse Chuck Taylor',
    'Louis Vuitton',
    'Stone Island Hoodie'
  ];
  if (!mounted) {
    return null;
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        {/* Desktop Header */}
        <div className="hidden md:block">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between gap-8">
              {/* Logo */}
              <Link href="/" className="flex items-center">
                <img 
                  src="https://rkfkxhfvldavnirarytg.supabase.co/storage/v1/object/sign/material/Logo%20goodstock-x%20dengan%20tulisan.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81ZDE5M2Q1NS1kYTM5LTQ3YzQtOTUzNC00YTNlNzczMGZhOGUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJtYXRlcmlhbC9Mb2dvIGdvb2RzdG9jay14IGRlbmdhbiB0dWxpc2FuLnBuZyIsImlhdCI6MTc1NDE0MjkyMywiZXhwIjoxNzg1Njc4OTIzfQ.WyK0q_2J6diVJ1SBDjPJa0TgyFwwlT0RB8H38lieHqY"
                  alt="Goodstock-X"
                  className="h-12 w-auto"
                />
              </Link>

              {/* Search Bar */}
              <div className="flex-1 max-w-2xl">
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Cari produk, brand, atau kategori..."
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    onKeyDown={handleSearchKeyDown}
                    onFocus={() => setShowSearchSuggestions(searchQuery.length > 0)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  />
                  
                  {/* Search Suggestions Dropdown */}
                  {showSearchSuggestions && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                      {searchQuery.length > 0 && (
                        <div className="p-3 border-b">
                          <button
                            type="submit"
                            className="flex items-center gap-3 w-full text-left hover:bg-accent p-2 rounded-md transition-colors"
                          >
                            <Search className="w-4 h-4 text-muted-foreground" />
                            <span>Cari &quot;<strong>{searchQuery}</strong>&quot;</span>
                          </button>
                        </div>
                      )}
                      
                      <div className="p-3">
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Pencarian Populer</h4>
                        <div className="space-y-1">
                          {popularSearches.map((search) => (
                            <button
                              key={search}
                              type="button"
                              onClick={() => {
                                setSearchQuery(search);
                                router.push(`/search?q=${encodeURIComponent(search)}`);
                                setShowSearchSuggestions(false);
                              }}
                              className="flex items-center gap-3 w-full text-left hover:bg-accent p-2 rounded-md transition-colors text-sm"
                            >
                              <Search className="w-3 h-3 text-muted-foreground" />
                              <span>{search}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </form>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4">
                {/* User Account */}
                {isAuthenticated ? (
                  <div className="relative group">
                    <button className="flex items-center gap-2 p-2 hover:bg-accent rounded-lg transition-colors">
                      <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                        {profile?.full_name?.charAt(0) || profile?.email?.charAt(0) || 'U'}
                      </div>
                      <span className="hidden md:block text-sm font-medium">
                        {profile?.full_name || 'User'}
                      </span>
                    </button>
                    
                    {/* Dropdown Menu */}
                    <div className="absolute right-0 top-full mt-2 w-48 bg-background border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="p-2">
                        <Link
                          href="/akun"
                          className="block px-3 py-2 text-sm hover:bg-accent rounded-md transition-colors"
                        >
                          Akun Saya
                        </Link>
                        <Link
                          href="/akun/pesanan"
                          className="block px-3 py-2 text-sm hover:bg-accent rounded-md transition-colors"
                        >
                          Riwayat Pesanan
                        </Link>
                        <hr className="my-2" />
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                          Keluar
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    href="/auth/login"
                    className="p-2 hover:bg-accent rounded-lg transition-colors"
                    title="Masuk / Daftar"
                  >
                    <User className="w-5 h-5" />
                  </Link>
                )}

                <Link
                  href="/cart"
                  className="relative p-2 hover:bg-accent rounded-lg transition-colors"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cartItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartItems}
                    </span>
                  )}
                </Link>
                <Link
                  href="/wishlist"
                  className="relative p-2 hover:bg-accent rounded-lg transition-colors"
                >
                  <Heart className="w-5 h-5" />
                  {wishlistItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {wishlistItems.length}
                    </span>
                  )}
                </Link>
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="p-2 hover:bg-accent rounded-lg transition-colors"
                >
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="border-t bg-muted/20">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-center gap-8 py-3">
                {Object.entries(categories).map(([key, category]) => (
                  <div key={key} className="group relative">
                    <Link
                      href={`/kategori/${key}`}
                      className="text-sm font-medium hover:text-primary transition-colors py-2"
                    >
                      {category.name}
                    </Link>
                    <div className="absolute left-0 top-full mt-2 w-64 bg-background border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="p-2">
                        {category.subcategories.map((sub) => (
                          <Link
                            key={sub}
                            href={`/kategori/${key}?subcategory=${encodeURIComponent(sub)}`}
                            className="block px-3 py-2 text-sm hover:bg-accent rounded-md transition-colors"
                          >
                            {sub}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </nav>
        </div>

        {/* Mobile Header */}
        <div className="md:hidden">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link href="/" className="text-xl font-bold text-primary">
              <img 
                src="https://rkfkxhfvldavnirarytg.supabase.co/storage/v1/object/sign/material/Logo%20goodstock-x%20dengan%20tulisan.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81ZDE5M2Q1NS1kYTM5LTQ3YzQtOTUzNC00YTNlNzczMGZhOGUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJtYXRlcmlhbC9Mb2dvIGdvb2RzdG9jay14IGRlbmdhbiB0dWxpc2FuLnBuZyIsImlhdCI6MTc1NDE0MjkyMywiZXhwIjoxNzg1Njc4OTIzfQ.WyK0q_2J6diVJ1SBDjPJa0TgyFwwlT0RB8H38lieHqY"
                alt="Goodstock-X"
                className="h-6 w-auto"
              />
            </Link>

            <div className="flex items-center gap-2">
              {/* Mobile User Menu */}
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                    {profile?.full_name?.charAt(0) || profile?.email?.charAt(0) || 'U'}
                  </div>
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-primary"
                >
                  Masuk
                </Link>
              )}

              <Link
                href="/cart"
                className="relative p-2 hover:bg-accent rounded-lg transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {cartItems}
                  </span>
                )}
              </Link>
              <Link
                href="/wishlist"
                className="relative p-2 hover:bg-accent rounded-lg transition-colors"
              >
                <Heart className="w-5 h-5" />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 hover:bg-accent rounded-lg transition-colors"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="px-4 pb-4">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Cari produk, brand, atau kategori..."
                value={searchQuery}
                onChange={handleSearchInputChange}
                onKeyDown={handleSearchKeyDown}
                className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </form>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t bg-background">
            <div className="p-4 space-y-4">
              {/* Mobile Auth Section */}
              {isAuthenticated ? (
                <div className="border-b pb-4 mb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-medium">
                      {profile?.full_name?.charAt(0) || profile?.email?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <div className="font-medium">{profile?.full_name || 'User'}</div>
                      <div className="text-sm text-muted-foreground">{profile?.email}</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Link
                      href="/akun"
                      className="block text-sm hover:text-primary transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Akun Saya
                    </Link>
                    <Link
                      href="/akun/pesanan"
                      className="block text-sm hover:text-primary transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Riwayat Pesanan
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="block text-sm text-red-600 hover:text-red-700 transition-colors"
                    >
                      Keluar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-b pb-4 mb-4">
                  <div className="flex gap-4">
                    <Link
                      href="/auth/login"
                      className="flex-1 text-center py-2 border rounded-lg hover:bg-accent transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Masuk
                    </Link>
                    <Link
                      href="/auth/register"
                      className="flex-1 text-center py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Daftar
                    </Link>
                  </div>
                </div>
              )}

              {Object.entries(categories).map(([key, category]) => (
                <div key={key}>
                  <Link
                    href={`/kategori/${key}`}
                    className="block text-lg font-medium py-2 hover:text-primary transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {category.name}
                  </Link>
                  <div className="ml-4 space-y-1">
                    {category.subcategories.map((sub) => (
                      <Link
                        key={sub}
                        href={`/kategori/${key}?subcategory=${encodeURIComponent(sub)}`}
                        className="block text-sm text-muted-foreground py-1 hover:text-foreground transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {sub}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </header>
      
      {/* Search Overlay for Mobile */}
      {showSearchSuggestions && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setShowSearchSuggestions(false)}
        />
      )}
    </>
  );
}