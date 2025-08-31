import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://eldhtxtnwdanyavkikap.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsZGh0eHRud2Rhbnlhdmtpa2FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMzc4NTgsImV4cCI6MjA2OTcxMzg1OH0.Wz7TtwZqZT3m4UCqN9XF1O3ifnrnaOQezXasvZ-uX7Q';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});

// Auth helpers
export const signUp = async (email: string, password: string, userData?: any) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData
    }
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};

// Clear invalid session data
export const clearInvalidSession = async () => {
  try {
    // Clear localStorage
    if (typeof window !== 'undefined') {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.includes('supabase') || key.includes('auth')) {
          localStorage.removeItem(key);
        }
      });
    }
    
    // Sign out to clear any server-side session
    await supabase.auth.signOut();
  } catch (error) {
    console.error('Error clearing invalid session:', error);
  }
};

export const resetPassword = async (email: string) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`
  });
  return { data, error };
};
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          role: 'admin' | 'customer';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          role?: 'admin' | 'customer';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          phone?: string | null;
          role?: 'admin' | 'customer';
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          category: 'sepatu' | 'tas' | 'pakaian';
          subcategory: string;
          brand: string;
          price: number;
          discount: number | null;
          stock: number;
          sizes: string[];
          gender: 'pria' | 'wanita' | 'unisex';
          promo: boolean;
          images: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          category: 'sepatu' | 'tas' | 'pakaian';
          subcategory: string;
          brand: string;
          price: number;
          discount?: number | null;
          stock: number;
          sizes: string[];
          gender: 'pria' | 'wanita' | 'unisex';
          promo?: boolean;
          images?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          category?: 'sepatu' | 'tas' | 'pakaian';
          subcategory?: string;
          brand?: string;
          price?: number;
          discount?: number | null;
          stock?: number;
          sizes?: string[];
          gender?: 'pria' | 'wanita' | 'unisex';
          promo?: boolean;
          images?: string[];
          updated_at?: string;
        };
      };
    };
  };
};