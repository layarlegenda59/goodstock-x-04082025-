'use client';

import { useState } from 'react';
import Link from 'next/link';
import { resetPassword } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await resetPassword(email);

      if (error) {
        setError(error.message);
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError('Terjadi kesalahan yang tidak terduga');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Email Terkirim!</h2>
              <p className="text-muted-foreground mb-4">
                Kami telah mengirim link reset password ke email <strong>{email}</strong>. 
                Silakan cek inbox atau folder spam Anda.
              </p>
              <Button asChild>
                <Link href="/auth/login">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Kembali ke Login
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="https://rkfkxhfvldavnirarytg.supabase.co/storage/v1/object/sign/material/Logo%20goodstock-x%20dengan%20tulisan.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81ZDE5M2Q1NS1kYTM5LTQ3YzQtOTUzNC00YTNlNzczMGZhOGUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJtYXRlcmlhbC9Mb2dvIGdvb2RzdG9jay14IGRlbmdhbiB0dWxpc2FuLnBuZyIsImlhdCI6MTc1NDE0MjkyMywiZXhwIjoxNzg1Njc4OTIzfQ.WyK0q_2J6diVJ1SBDjPJa0TgyFwwlT0RB8H38lieHqY"
              alt="Goodstock-X"
              className="h-12 w-auto"
            />
          </div>
          <CardTitle className="text-2xl font-bold">Lupa Password</CardTitle>
          <CardDescription>
            Masukkan email Anda untuk menerima link reset password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResetPassword} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mengirim...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Kirim Link Reset
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link 
              href="/auth/login" 
              className="text-sm text-primary hover:underline flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}