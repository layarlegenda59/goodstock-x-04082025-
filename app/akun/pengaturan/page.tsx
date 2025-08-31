'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Settings, Moon, Sun, Bell, Shield, Globe } from 'lucide-react';
import Link from 'next/link';



export default function PengaturanPage() {
  const { isAuthenticated } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [language, setLanguage] = useState('id');
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currency, setCurrency] = useState('idr');

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
    // Load saved settings from localStorage
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setNotifications(settings.notifications ?? true);
      setEmailUpdates(settings.emailUpdates ?? false);
      setTwoFactor(settings.twoFactor ?? false);
      setCurrency(settings.currency ?? 'idr');
    }
  }, [isAuthenticated, router]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save settings to localStorage
      const settings = {
        notifications,
        emailUpdates,
        twoFactor,
        language,
        currency,
        theme
      };
      localStorage.setItem('userSettings', JSON.stringify(settings));
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message (you can add toast notification here)
      alert('Pengaturan berhasil disimpan!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Gagal menyimpan pengaturan. Silakan coba lagi.');
    } finally {
      setSaving(false);
    }
  };

  if (!mounted || !isAuthenticated) {
    return null;
  }



  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/akun"
          className="p-2 hover:bg-accent rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold">Pengaturan</h1>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Moon className="w-5 h-5" />
              Tampilan
            </CardTitle>
            <CardDescription>
              Sesuaikan tampilan aplikasi sesuai preferensi Anda
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="theme-toggle">Mode Gelap</Label>
                <p className="text-sm text-muted-foreground">
                  Aktifkan mode gelap untuk pengalaman yang lebih nyaman di mata
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4" />
                <Switch
                  id="theme-toggle"
                  checked={theme === 'dark'}
                  onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                />
                <Moon className="w-4 h-4" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifikasi
            </CardTitle>
            <CardDescription>
              Kelola preferensi notifikasi Anda
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="push-notifications">Notifikasi Push</Label>
                <p className="text-sm text-muted-foreground">
                  Terima notifikasi untuk pesanan dan promo terbaru
                </p>
              </div>
              <Switch
                id="push-notifications"
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-updates">Update Email</Label>
                <p className="text-sm text-muted-foreground">
                  Terima update produk dan penawaran melalui email
                </p>
              </div>
              <Switch
                id="email-updates"
                checked={emailUpdates}
                onCheckedChange={setEmailUpdates}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Keamanan
            </CardTitle>
            <CardDescription>
              Kelola pengaturan keamanan akun Anda
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="two-factor">Autentikasi Dua Faktor</Label>
                <p className="text-sm text-muted-foreground">
                  Tambahkan lapisan keamanan ekstra untuk akun Anda
                </p>
              </div>
              <Switch
                id="two-factor"
                checked={twoFactor}
                onCheckedChange={setTwoFactor}
              />
            </div>

            <div className="pt-4 border-t">
              <Button variant="outline" className="w-full">
                Ubah Password
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Language Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Bahasa & Wilayah
            </CardTitle>
            <CardDescription>
              Pilih bahasa dan mata uang yang Anda inginkan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="language">Bahasa</Label>
              <select
                id="language"
                className="w-full p-2 border rounded-lg bg-background"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="id">Bahasa Indonesia</option>
                <option value="en">English</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Mata Uang</Label>
              <select
                id="currency"
                className="w-full p-2 border rounded-lg bg-background"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="idr">Rupiah (IDR)</option>
                <option value="usd">US Dollar (USD)</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex gap-4">
          <Button 
            className="flex-1" 
            onClick={handleSave}
            disabled={saving}
          >
            <Settings className="w-4 h-4 mr-2" />
            {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </Button>
          <Button variant="outline" asChild>
            <Link href="/akun">
              Kembali
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}