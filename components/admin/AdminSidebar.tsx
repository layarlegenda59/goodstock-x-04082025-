'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAdminAuthStore } from '@/store/admin-auth';
import { signOut } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Package, 
  Plus, 
  LogOut, 
  Menu,
  X,
  Settings,
  Tag,
  Image as ImageIcon,
  Layers
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Kelola Produk', href: '/admin/products', icon: Package },
  { name: 'Tambah Produk', href: '/admin/products/add', icon: Plus },
  { name: 'Kelola Promo', href: '/admin/promos', icon: Tag },
  { name: 'Hero Slides', href: '/admin/hero-slides', icon: ImageIcon },
  { name: 'Gambar Kategori', href: '/admin/category-images', icon: Layers },
];

export default function AdminSidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { adminLogout, adminProfile } = useAdminAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    adminLogout();
    // Redirect to admin login after logout
    router.push('/admin/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 z-50 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 w-64 lg:translate-x-0
        transition-all duration-300 ease-in-out shadow-lg lg:shadow-none
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <Image 
            src="/Logo Goodstock-X.png"
            alt="Goodstock-X"
            width={50}
            height={12}
            priority
            style={{ width: 'auto', height: 'auto' }}
            className="h-3 w-auto object-contain"
          />
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
                Admin
              </span>
            </div>
          </div>

          {/* Admin Info */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-md">
                {adminProfile?.full_name?.charAt(0) || adminProfile?.email?.charAt(0) || 'A'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {adminProfile?.full_name || 'Admin'}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Administrator
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-3">
              Menu Utama
            </div>
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group
                    ${isActive 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${
                    isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                  }`} />
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 py-3 h-auto"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              <span className="ml-3 text-sm font-medium">Keluar</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-white dark:bg-gray-800 border shadow-lg hover:shadow-xl transition-shadow p-2"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>
    </>
  );
}