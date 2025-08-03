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
    { href: '/cart', icon: ShoppingCart, label: 'Keranjang', badge: isHydrated ? cartItems : 0 },
    { href: '/wishlist', icon: Heart, label: 'Wishlist', badge: isHydrated ? wishlistItems.length : 0 },
    { href: '/akun', icon: User, label: 'Akun' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t z-40">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors ${
                isActive
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}