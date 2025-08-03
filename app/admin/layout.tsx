'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, isLoading, setUser, setProfile, setLoading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  // Handle redirects in separate useEffect to avoid render warnings
  useEffect(() => {
    if (!isLoading && !user && !profile && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [isLoading, user, profile, pathname, router]);

  useEffect(() => {
    if (profile && profile.role !== 'admin' && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [profile, router, pathname]);

  useEffect(() => {
    const getSession = async () => {
      // Always set loading when checking session
      setLoading(true);
      
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setLoading(false);
          return;
        }
      
        if (session?.user) {
          setUser(session.user);
        
          // Fetch user profile to check if admin with retry logic
          let userProfile = null;
          let retries = 3;
          
          while (retries > 0 && !userProfile) {
            try {
              const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
              
              if (profileError) {
                console.error('Profile fetch error in layout:', profileError);
                if (retries === 1) {
                  // Last retry failed, redirect to login
                  if (pathname !== '/admin/login') {
                    router.push('/admin/login');
                  }
                  break;
                }
              } else {
                userProfile = profileData;
              }
            } catch (err) {
              console.error('Profile fetch attempt failed:', err);
            }
            
            if (!userProfile) {
              retries--;
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          }
          
          if (userProfile) {
            setProfile(userProfile);
          
            // Check if user is admin and handle redirects
            if (userProfile.role === 'admin') {
              // User is admin, redirect from login page to dashboard
              if (pathname === '/admin/login') {
                // On login page but already authenticated as admin, go to dashboard
                router.push('/admin/dashboard');
              }
              // If already on admin page, allow access (no action needed)
            } else {
              // Not admin, redirect to login
              if (pathname !== '/admin/login') {
                router.push('/admin/login');
              }
            }
          }
        } else {
          // No session, clear state and redirect to login
          setUser(null);
          setProfile(null);
          setLoading(false);
          if (pathname !== '/admin/login') {
            router.push('/admin/login');
          }
        }
      } catch (error) {
        console.error('Error in getSession:', error);
        if (pathname !== '/admin/login') {
          router.push('/admin/login');
        }
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id);
        
        if (session?.user) {
          setUser(session.user);
          
          // Fetch profile for new session with retry
          let userProfile = null;
          let retries = 3;
          
          while (retries > 0 && !userProfile) {
            try {
              const { data: profileData, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
              
              if (!error && profileData) {
                userProfile = profileData;
              }
            } catch (err) {
              console.error('Profile fetch in auth change failed:', err);
            }
            
            if (!userProfile) {
              retries--;
              await new Promise(resolve => setTimeout(resolve, 300));
            }
          }
          
          if (userProfile) {
            setProfile(userProfile);
            
            if (userProfile.role === 'admin' && pathname === '/admin/login') {
              router.push('/admin/dashboard');
            }
          }
        } else {
          // Handle logout - clear state completely
          setUser(null);
          setProfile(null);
          setLoading(false);
          if (pathname !== '/admin/login') {
            router.push('/admin/login');
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [setUser, setProfile, setLoading, router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Show login page if not authenticated or not admin
  if (pathname === '/admin/login') {
    return children;
  }

  // Protect admin routes - only redirect if we're sure user is not admin
  if (!user || !profile) {
    // Still loading or no user/profile, show loading only if actually loading
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );
    }
    // If not loading but no user/profile, show loading (redirect handled in useEffect)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  if (profile.role !== 'admin') {
    // Show loading (redirect handled in useEffect)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminSidebar />
      <div className="lg:ml-64 min-h-screen">
        <AdminHeader />
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}