import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: 'admin' | 'customer';
  created_at: string;
  updated_at: string;
}

interface AuthStore {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  isAdmin: () => boolean;
  isCustomer: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      isLoading: true,
      isAuthenticated: false,
      
      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user
        // Don't set isLoading to false here, let setProfile handle it
      }),
      
      setProfile: (profile) => set({ 
        profile,
        isLoading: false
      }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      logout: () => set({ 
        user: null, 
        profile: null, 
        isAuthenticated: false,
        isLoading: false 
      }),
      
      isAdmin: () => {
        const state = get();
        return state.isAuthenticated && state.profile?.role === 'admin';
      },
      
      isCustomer: () => {
        const state = get();
        return state.isAuthenticated && state.profile?.role === 'customer';
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        isAuthenticated: state.isAuthenticated,
        isLoading: false, // Always set to false when persisting
      }),
      onRehydrateStorage: () => (state) => {
        // When rehydrating, set loading to false if we have user data
        if (state && (state.user || state.profile)) {
          state.isLoading = false;
        }
      },
    }
  )
);