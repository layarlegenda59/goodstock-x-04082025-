'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAdminAuthStore } from '@/store/admin-auth';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { adminUser, adminProfile, isAdminLoading, setAdminUser, setAdminProfile, setAdminLoading } = useAdminAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isInitialized, setIsInitialized] = useState(false);
  
  // If this is the login page, render it directly without auth checks
  if (pathname === '/admin/login') {
    return children;
  }

  // Single useEffect to handle all redirects with better error handling
  useEffect(() => {
    const handleAuth = async () => {
      try {
        if (!isAdminLoading && !isInitialized) {
          if (!adminUser || !adminProfile) {
            router.push('/admin/login');
          } else if (adminProfile.role !== 'admin') {
            router.push('/admin/login');
          }
          setIsInitialized(true);
        }
      } catch (error) {
        console.error('Auth error in admin layout:', error);
        router.push('/admin/login');
      }
    };

    handleAuth();
  }, [isAdminLoading, adminUser, adminProfile, router, isInitialized]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setAdminLoading(true);
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setAdminUser(null);
          setAdminProfile(null);
          setAdminLoading(false);
          return;
        }

        if (session?.user) {
          setAdminUser(session.user);
          
          // Fetch admin profile with error handling
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profileError) {
            console.error('Profile error:', profileError);
            setAdminProfile(null);
          } else {
            setAdminProfile(profile);
          }
        } else {
          setAdminUser(null);
          setAdminProfile(null);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setAdminUser(null);
        setAdminProfile(null);
      } finally {
        setAdminLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes with error handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (event === 'SIGNED_OUT' || !session) {
          setAdminUser(null);
          setAdminProfile(null);
          router.push('/admin/login');
        } else if (session?.user) {
          setAdminUser(session.user);
          
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (!error && profile) {
            setAdminProfile(profile);
          }
        }
      } catch (error) {
        console.error('Auth state change error:', error);
      }
    });

    return () => subscription.unsubscribe();
  }, [setAdminUser, setAdminProfile, setAdminLoading, router, pathname]);

  // Show loading while checking auth
  if (isAdminLoading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 dark:text-gray-400">Memuat...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated and is admin
  if (!adminUser || !adminProfile) {
    // Show loading while redirecting
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 dark:text-gray-400">Mengalihkan ke halaman login...</p>
        </div>
      </div>
    );
  }
  
  if (adminProfile.role !== 'admin') {
    // Show loading while redirecting
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-red-600" />
          <p className="text-gray-600 dark:text-gray-400">Akses ditolak. Mengalihkan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminSidebar />
      <div className="lg:ml-64 min-h-screen">
        <AdminHeader />
        <main className="p-responsive">
          {children}
        </main>
      </div>
    </div>
  );
}