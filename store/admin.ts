import { create } from 'zustand';
import { User } from '@supabase/supabase-js';

interface AdminStore {
  user: User | null;
  isLoading: boolean;
  sidebarOpen: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useAdminStore = create<AdminStore>((set) => ({
  user: null,
  isLoading: true,
  sidebarOpen: false,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
}));