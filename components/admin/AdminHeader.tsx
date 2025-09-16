'use client';

import { usePathname } from 'next/navigation';
import { useAdminAuthStore } from '@/store/admin-auth';
import { Button } from '@/components/ui/button';
import { Menu, Bell, User } from 'lucide-react';

export default function AdminHeader() {
  const { adminProfile } = useAdminAuthStore();
  const pathname = usePathname();

  const getPageTitle = () => {
    switch (pathname) {
      case '/admin/dashboard':
        return 'Dashboard Admin';
      case '/admin/products':
        return 'Kelola Produk';
      case '/admin/products/add':
        return 'Tambah Produk';
      case '/admin/promos':
        return 'Kelola Promo';
      case '/admin/hero-slides':
        return 'Hero Slides';
      case '/admin/category-images':
        return 'Gambar Kategori';
      default:
        if (pathname.includes('/admin/products/') && pathname.includes('/edit')) {
          return 'Edit Produk';
        }
        return 'Admin Panel';
    }
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            {getPageTitle()}
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Admin Info */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {adminProfile?.full_name || 'Admin'}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                Administrator
              </div>
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-md">
              {adminProfile?.full_name?.charAt(0) || adminProfile?.email?.charAt(0) || 'A'}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}