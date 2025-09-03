'use client';

import { useEffect } from 'react';
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

  // Single useEffect to handle all redirects
  useEffect(() => {
    if (!isAdminLoading) {
      if (!adminUser || !adminProfile) {
        if (pathname !== '/admin/login') {
          router.push('/admin/login');
        }
      } else if (adminProfile.role !== 'admin') {
        if (pathname !== '/admin/login') {
          router.push('/admin/login');
        }
      } else if (adminProfile.role === 'admin' && pathname === '/admin/login') {
        // Admin is on login page, redirect to dashboard immediately
        router.replace('/admin/dashboard');
      }
    }
  }, [isAdminLoading, adminUser, adminProfile, pathname, router]);

  useEffect(() => {
    const getSession = async () => {
      // Always set loading when checking session
      setAdminLoading(true);
      
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setAdminLoading(false);
          return;
        }
      
        if (session?.user) {
          setAdminUser(session.user);
          // Keep loading true until profile is fetched
        
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
            } catch (err: any) {
              console.error('Profile fetch attempt failed:', err);
            }
            
            if (!userProfile) {
              retries--;
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          }
          
          if (userProfile) {
            setAdminProfile(userProfile);
            // Profile loaded successfully, loading will be set to false by setAdminProfile
          } else {
            // Failed to fetch profile after retries
            setAdminLoading(false);
          }
        } else {
          // No session, clear state and redirect to login
          setAdminUser(null);
          setAdminProfile(null);
          setAdminLoading(false);
          if (pathname !== '/admin/login') {
            router.push('/admin/login');
          }
        }
      } catch (error: any) {
        console.error('Error in getSession:', error);
        if (pathname !== '/admin/login') {
          router.push('/admin/login');
        }
      } finally {
        setAdminLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id);
        
        try {
          if (event === 'SIGNED_OUT') {
            // Handle logout - clear state completely
            setAdminUser(null);
            setAdminProfile(null);
            setAdminLoading(false);
            if (pathname !== '/admin/login') {
              router.push('/admin/login');
            }
            return;
          }
          
          if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
            setAdminUser(session.user);
            
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
              } catch (err: any) {
                console.error('Profile fetch in auth change failed:', err);
              }
              
              if (!userProfile) {
                retries--;
                await new Promise(resolve => setTimeout(resolve, 300));
              }
            }
            
            if (userProfile) {
              setAdminProfile(userProfile);
            } else {
              // Failed to fetch profile, set loading to false
              setAdminLoading(false);
            }
          } else if (!session?.user) {
            // Handle logout - clear state completely
            setAdminUser(null);
            setAdminProfile(null);
            setAdminLoading(false);
            if (pathname !== '/admin/login') {
              router.push('/admin/login');
            }
          }
        } catch (error: any) {
          console.error('Error in admin auth state change:', error);
          // On error, clear session and redirect to login
          setAdminUser(null);
          setAdminProfile(null);
          setAdminLoading(false);
          if (pathname !== '/admin/login') {
            router.push('/admin/login');
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [setAdminUser, setAdminProfile, setAdminLoading, router, pathname]);

  if (isAdminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="icon-responsive animate-spin" />
      </div>
    );
  }

  // Show login page if not authenticated or not admin
  if (pathname === '/admin/login') {
    return children;
  }

  // Protect admin routes - only redirect if we're sure user is not admin
  if (!adminUser || !adminProfile) {
    // Still loading or no user/profile, show loading only if actually loading
    if (isAdminLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="icon-responsive animate-spin" />
        </div>
      );
    }
    // If not loading but no user/profile, show loading (redirect handled in useEffect)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="icon-responsive animate-spin" />
      </div>
    );
  }
  
  if (adminProfile.role !== 'admin') {
    // Show loading (redirect handled in useEffect)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="icon-responsive animate-spin" />
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