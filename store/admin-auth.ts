import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@supabase/supabase-js';

interface AdminProfile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: 'admin';
  created_at: string;
  updated_at: string;
}

interface AdminAuthStore {
  adminUser: User | null;
  adminProfile: AdminProfile | null;
  isAdminLoading: boolean;
  isAdminAuthenticated: boolean;
  setAdminUser: (user: User | null) => void;
  setAdminProfile: (profile: AdminProfile | null) => void;
  setAdminLoading: (loading: boolean) => void;
  adminLogout: () => void;
}

export const useAdminAuthStore = create<AdminAuthStore>()(
  persist(
    (set, get) => ({
      adminUser: null,
      adminProfile: null,
      isAdminLoading: true,
      isAdminAuthenticated: false,
      
      setAdminUser: (adminUser) => set({ 
        adminUser, 
        isAdminAuthenticated: !!adminUser
        // Don't set loading to false here, let setAdminProfile handle it
      }),
      
      setAdminProfile: (adminProfile) => set({ 
        adminProfile,
        isAdminLoading: false
      }),
      
      setAdminLoading: (isAdminLoading) => set({ isAdminLoading }),
      
      adminLogout: () => set({ 
        adminUser: null, 
        adminProfile: null, 
        isAdminAuthenticated: false,
        isAdminLoading: false
      }),
    }),
    {
      name: 'admin-auth-storage',
      partialize: (state) => ({
        adminUser: state.adminUser,
        adminProfile: state.adminProfile,
        isAdminAuthenticated: state.isAdminAuthenticated
      })
    }
  )
);