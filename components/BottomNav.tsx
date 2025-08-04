'use client';

import { Home, Grid3X3, ShoppingCart, Heart, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWishlistStore } from '@/store/wishlist';
import { useCartStore } from '@/store/cart';
import { useEffect, useState } from 'react';


export default function BottomNav() {
  const pathname = usePathname();

  const [isHydrated, setIsHydrated] = useState(false);
  const wishlistItems = useWishlistStore((state) => state.items);
  const cartItems = useCartStore((state) => state.getTotalItems());

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const navItems = [
    { href: '/', icon: Home, label: 'Beranda' },
    { href: '/kategori', icon: Grid3X3, label: 'Kategori' },
    { href: '/cart', icon: ShoppingCart, label: 'Keranjang', badge: isHydrated && cartItems > 0 ? cartItems : undefined },
    { href: '/wishlist', icon: Heart, label: 'Wishlist', badge: isHydrated && wishlistItems.length > 0 ? wishlistItems.length : undefined },
    { href: '/akun', icon: User, label: 'Akun' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90 border-t z-40 safe-area-pb">
      <div className="flex items-center justify-around py-2 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-2 px-2 sm:px-3 rounded-lg transition-colors min-w-0 flex-1 ${
                isActive
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center font-medium">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs sm:text-sm font-medium truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}