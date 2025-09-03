'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, clearInvalidSession } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setProfile, setLoading } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          
          // Handle specific refresh token errors
          if (error?.message?.includes('refresh') || error?.message?.includes('token')) {
            console.log('Clearing invalid session due to token error');
            await clearInvalidSession();
          }
          
          // Clear any invalid session data
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }
        
        if (session?.user) {
          setUser(session.user);
          await fetchUserProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
        setIsInitialized(true);
      } catch (error: any) {
          console.error('Error getting initial session:', error);
          setUser(null);
          setProfile(null);
          setLoading(false);
          setIsInitialized(true);
        }
    };

    // Fetch user profile from database
    const fetchUserProfile = async (userId: string) => {
      try {
        // Add retry logic for profile fetching
        let retries = 3;
        let profile = null;
        
        while (retries > 0 && !profile) {
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
          
          if (error) {
            console.error('Profile fetch error:', error);
            if (retries === 1) {
              // If this is the last retry and still failing, create profile
              console.log('Creating missing profile for user:', userId);
              const { data: user } = await supabase.auth.getUser();
              if (user.user) {
                const { data: newProfile, error: createError } = await supabase
                  .from('profiles')
                  .insert({
                    id: userId,
                    email: user.user.email || '',
                    full_name: user.user.user_metadata?.full_name || '',
                    phone: user.user.user_metadata?.phone || '',
                    role: 'customer'
                  })
                  .select()
                  .single();
                
                if (!createError && newProfile) {
                  profile = newProfile;
                }
              }
            }
          } else {
            profile = profileData;
          }
          
          if (!profile) {
            retries--;
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }

        if (profile) {
          setProfile(profile);
        }
      } catch (error: any) {
        console.error('Error in fetchUserProfile:', error);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        
        try {
          if (event === 'SIGNED_IN' && session?.user) {
            setUser(session.user);
            // Always fetch profile for authenticated users
            await fetchUserProfile(session.user.id);
          } else if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
            if (event === 'SIGNED_OUT') {
              setUser(null);
              setProfile(null);
              // Only redirect to home if not on admin pages
              if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
                router.push('/admin/login');
              } else {
                router.push('/');
              }
            } else if (event === 'TOKEN_REFRESHED' && session?.user) {
              // Handle successful token refresh
              setUser(session.user);
              await fetchUserProfile(session.user.id);
            }
          }
        } catch (error: any) {
          console.error('Error in auth state change:', error);
          
          // Handle specific refresh token errors
          if (error?.message?.includes('refresh') || error?.message?.includes('token')) {
            console.log('Clearing invalid session due to token error in auth change');
            await clearInvalidSession();
          }
          
          // On error, clear session and redirect
          setUser(null);
          setProfile(null);
          if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
            router.push('/admin/login');
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [setUser, setProfile, setLoading, router]);

  // Prevent hydration mismatch by waiting for initialization
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}