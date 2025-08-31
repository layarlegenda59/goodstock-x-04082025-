'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, supabase } from '@/lib/supabase';
import { useAdminAuthStore } from '@/store/admin-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, LogIn } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { setAdminUser, setAdminProfile } = useAdminAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await signIn(email, password);

      if (error) {
        setError(error.message);
        return;
      }

      if (data.user) {
        // First set the admin user
        setAdminUser(data.user);
        
        // Wait a bit for session to be established
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Then fetch profile with retry logic
        let profile = null;
        let retries = 3;
        
        while (retries > 0 && !profile) {
          try {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .single();
            
            if (profileError) {
              console.error('Profile fetch error:', profileError);
              if (retries === 1) throw profileError;
            } else {
              profile = profileData;
            }
          } catch (err) {
            console.error('Profile fetch attempt failed:', err);
          }
          
          if (!profile) {
            retries--;
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
        
        if (!profile) {
          setError('Gagal mengambil data profil. Silakan coba lagi.');
          await supabase.auth.signOut();
          setAdminUser(null);
          return;
        }
        
        // Check if user is admin
        if (profile.role === 'admin') {
          setAdminProfile(profile);
          toast.success('Login admin berhasil!');
          
          // Wait a bit for state to update before redirect
          await new Promise(resolve => setTimeout(resolve, 50));
          
          // Redirect to admin dashboard
          router.push('/admin/dashboard');
        } else {
          setError('Akses ditolak. Anda bukan admin.');
          await supabase.auth.signOut();
          setAdminUser(null);
          setAdminProfile(null);
        }
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Terjadi kesalahan yang tidak terduga');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-responsive">
      <Card className="w-full max-w-md card-responsive">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="https://rkfkxhfvldavnirarytg.supabase.co/storage/v1/object/sign/material/Logo%20goodstock-x%20dengan%20tulisan.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81ZDE5M2Q1NS1kYTM5LTQ3YzQtOTUzNC00YTNlNzczMGZhOGUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJtYXRlcmlhbC9Mb2dvIGdvb2RzdG9jay14IGRlbmdhbiB0dWxpc2FuLnBuZyIsImlhdCI6MTc1NDE0MjkyMywiZXhwIjoxNzg1Njc4OTIzfQ.WyK0q_2J6diVJ1SBDjPJa0TgyFwwlT0RB8H38lieHqY"
              alt="Goodstock-X"
              className="h-10 sm:h-12 w-auto"
            />
          </div>
          <CardTitle className="text-responsive-2xl font-bold">Admin Login</CardTitle>
          <CardDescription className="text-responsive-sm">
            Masuk untuk mengakses dashboard admin Goodstock-X
          </CardDescription>
        </CardHeader>
        <CardContent className="p-responsive">
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription className="text-responsive-xs">{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-responsive-sm">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@goodstock-x.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="touch-target text-responsive-sm"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-responsive-sm">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Masukkan password admin"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="touch-target text-responsive-sm"
              />
            </div>
            
            <Button type="submit" className="w-full btn-responsive touch-target" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 icon-responsive-sm animate-spin" />
                  Masuk...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 icon-responsive-sm" />
                  Masuk sebagai Admin
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}