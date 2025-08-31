'use client';

import { User, Settings, ShoppingBag, Heart, HelpCircle, LogOut, Edit } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { signOut } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';


export default function AkunPage() {
  const { isAuthenticated, profile, logout } = useAuthStore();

  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  const handleLogout = async () => {
    await signOut();
    logout();
    router.push('/');
  };

  const menuItems = [
    { icon: User, label: 'Profil Saya', href: '/akun/profil' },
    { icon: ShoppingBag, label: 'Riwayat Pesanan', href: '/akun/pesanan' },
    { icon: Heart, label: 'Wishlist', href: '/wishlist' },
    { icon: Settings, label: 'Pengaturan', href: '/akun/pengaturan' },
    { icon: HelpCircle, label: 'Bantuan', href: '/akun/bantuan' },
  ];

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-8">Akun Saya</h1>
      
      {/* Profile Card */}
      <div className="bg-card border rounded-lg p-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold">
            {profile?.full_name?.charAt(0) || profile?.email?.charAt(0) || 'U'}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold">{profile?.full_name || 'User'}</h2>
            <p className="text-muted-foreground">{profile?.email}</p>
            {profile?.phone && (
              <p className="text-sm text-muted-foreground">{profile.phone}</p>
            )}
          </div>
          <Link
            href="/akun/profil"
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <Edit className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Menu Items */}
      <div className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-4 p-4 bg-card border rounded-lg hover:shadow-md transition-shadow"
            >
              <Icon className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
        
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 p-4 bg-card border rounded-lg hover:shadow-md transition-shadow text-red-600 hover:bg-red-50"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Keluar</span>
        </button>
      </div>
    </div>
  );
}