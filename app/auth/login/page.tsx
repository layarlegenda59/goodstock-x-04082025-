'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { signIn } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, LogIn, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';


export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { setUser } = useAuthStore();


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
        setUser(data.user);
        toast.success('Login berhasil!');
        router.push('/akun');
      }
    } catch (err) {
      setError('Terjadi kesalahan yang tidak terduga');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-3 py-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-3">
            <Image 
              src="https://rkfkxhfvldavnirarytg.supabase.co/storage/v1/object/sign/material/Logo%20goodstock-x%20dengan%20tulisan.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81ZDE5M2Q1NS1kYTM5LTQ3YzQtOTUzNC00YTNlNzczMGZhOGUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJtYXRlcmlhbC9Mb2dvIGdvb2RzdG9jay14IGRlbmdhbiB0dWxpc2FuLnBuZyIsImlhdCI6MTc1NDE0MjkyMywiZXhwIjoxNzg1Njc4OTIzfQ.WyK0q_2J6diVJ1SBDjPJa0TgyFwwlT0RB8H38lieHqY"
              alt="Goodstock-X"
              width={120}
              height={40}
              style={{ width: 'auto', height: 'auto' }}
              className="h-8 sm:h-10 w-auto"
            />
          </div>
          <CardTitle className="text-lg sm:text-xl font-bold">Masuk ke Akun</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Masukkan email dan password untuk masuk
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <form onSubmit={handleLogin} className="space-y-3">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-1">
              <Label htmlFor="email" className="text-xs sm:text-sm">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Masukkan email Anda"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="h-8 sm:h-10 text-xs sm:text-sm"
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="password" className="text-xs sm:text-sm">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan password Anda"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="h-8 sm:h-10 text-xs sm:text-sm pr-8"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" /> : <Eye className="h-3 w-3 sm:h-4 sm:w-4" />}
                </button>
              </div>
            </div>
            
            <Button type="submit" className="w-full h-8 sm:h-10 text-xs sm:text-sm" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                  Masuk...
                </>
              ) : (
                <>
                  <LogIn className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Masuk
                </>
              )}
            </Button>
          </form>

          <div className="mt-4 space-y-3">
            <div className="text-center">
              <Link 
                href="/auth/forgot-password" 
                className="text-xs sm:text-sm text-primary hover:underline"
              >
                Lupa Password?
              </Link>
            </div>
            
            <div className="text-center text-xs sm:text-sm text-muted-foreground">
              Belum punya akun?{' '}
              <Link href="/auth/register" className="text-primary hover:underline font-medium">
                Daftar Sekarang
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}