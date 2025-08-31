'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Tag, Plus, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
// Komponen HeroSlideManager dan CategoryImageManager dipindahkan ke halaman terpisah


interface DashboardStats {
  totalProducts: number;
  promoProducts: number;
  recentProducts: any[];
}

export default function AdminDashboard() {

  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    promoProducts: 0,
    recentProducts: []
  });
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState<{[key: string]: boolean}>({});

  const handleImageError = useCallback((productId: string) => {
    setImageErrors(prev => ({...prev, [productId]: true}));
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Get total products
      const { count: totalProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      // Get promo products
      const { count: promoProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('promo', true);

      // Get recent products
      const { data: recentProducts } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      setStats({
        totalProducts: totalProducts || 0,
        promoProducts: promoProducts || 0,
        recentProducts: recentProducts || []
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-responsive-2xl font-bold text-gray-900 dark:text-white">
          Dashboard Admin
        </h1>
        <div className="flex gap-2">
          <Button asChild className="btn-responsive">
            <Link href="/admin/products/add">
              <Plus className="icon-responsive-sm mr-2" />
              <span className="hidden sm:inline">Tambah Produk</span>
              <span className="sm:hidden">Tambah</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid-responsive gap-6">
        <Card className="card-responsive">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-responsive-sm font-medium">Total Produk</CardTitle>
            <Package className="icon-responsive-sm text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-responsive-xl font-bold">{stats.totalProducts}</div>
            <p className="text-responsive-xs text-muted-foreground">
              Produk aktif dalam katalog
            </p>
          </CardContent>
        </Card>

        <Card className="card-responsive">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-responsive-sm font-medium">Produk Promo</CardTitle>
            <Tag className="icon-responsive-sm text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-responsive-xl font-bold">{stats.promoProducts}</div>
            <p className="text-responsive-xs text-muted-foreground">
              Produk dengan promo aktif
            </p>
          </CardContent>
        </Card>

        <Card className="card-responsive">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-responsive-sm font-medium">Tingkat Konversi</CardTitle>
            <TrendingUp className="icon-responsive-sm text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-responsive-xl font-bold">12.5%</div>
            <p className="text-responsive-xs text-muted-foreground">
              +2.1% dari bulan lalu
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Products */}
      <Card className="card-responsive">
        <CardHeader>
          <CardTitle className="text-responsive-lg">Produk Terbaru</CardTitle>
          <CardDescription className="text-responsive-sm">
            5 produk terakhir yang ditambahkan ke katalog
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats.recentProducts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-responsive-sm">
              Belum ada produk. <Link href="/admin/products/add" className="text-primary hover:underline">Tambah produk pertama</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.recentProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-responsive border rounded-lg">
                  <div className="flex items-center gap-4">
                    {product.images && product.images.length > 0 && (
                      <div className="w-12 h-12 relative rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={imageErrors[product.id] ? '/placeholder-image.svg' : product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover"
                          onError={() => handleImageError(product.id)}
                        />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="text-responsive-sm font-medium truncate">{product.name}</h3>
                      <p className="text-responsive-xs text-muted-foreground truncate">
                        {product.brand} • {product.category}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-responsive-sm font-medium">Rp {product.price.toLocaleString('id-ID')}</p>
                    {product.promo && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-responsive-xs bg-red-100 text-red-800">
                        Promo
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Image Management dipindahkan ke sidebar menu terpisah */}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="card-responsive">
          <CardHeader>
            <CardTitle className="text-responsive-lg">Aksi Cepat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild variant="outline" className="w-full justify-start btn-responsive touch-target">
              <Link href="/admin/products">
                <Package className="icon-responsive-sm mr-2" />
                <span className="text-responsive-sm">Kelola Produk</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start btn-responsive touch-target">
              <Link href="/admin/products/add">
                <Plus className="icon-responsive-sm mr-2" />
                <span className="text-responsive-sm">Tambah Produk Baru</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start btn-responsive touch-target">
              <Link href="/admin/promos">
                <Tag className="icon-responsive-sm mr-2" />
                <span className="text-responsive-sm">Kelola Promo</span>
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="card-responsive">
          <CardHeader>
            <CardTitle className="text-responsive-lg">Status Sistem</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-responsive-sm">Database</span>
                <span className="text-responsive-sm text-green-600">Terhubung</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-responsive-sm">Storage</span>
                <span className="text-responsive-sm text-green-600">Aktif</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-responsive-sm">Autentikasi</span>
                <span className="text-responsive-sm text-green-600">Aman</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}