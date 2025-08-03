'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setProfile, setLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        await fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
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
      } catch (error) {
        console.error('Error in fetchUserProfile:', error);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          // Only fetch profile if not on admin pages (admin layout handles its own auth)
          if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/admin')) {
            await fetchUserProfile(session.user.id);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          // Only redirect to home if not on admin pages
          if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
            router.push('/admin/login');
          } else {
            router.push('/');
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [setUser, setProfile, setLoading, router]);

  return <>{children}</>;
}