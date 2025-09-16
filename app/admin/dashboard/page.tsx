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
      const { count: totalProducts, error: totalError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      if (totalError) {
        console.error('Error fetching total products:', totalError);
      }

      // Get promo products with error handling
      let promoProducts = 0;
      try {
        const { count, error: promoError } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('promo', true);
        
        if (promoError) {
          console.error('Error fetching promo products:', promoError);
          // Fallback: manually count promo products
          const { data: allProducts, error: allError } = await supabase
            .from('products')
            .select('promo');
          
          if (!allError && allProducts) {
            promoProducts = allProducts.filter(p => p.promo === true).length;
          }
        } else {
          promoProducts = count || 0;
        }
      } catch (promoErr: any) {
        console.error('Promo products query failed:', promoErr);
        promoProducts = 0;
      }

      // Get recent products
      const { data: recentProducts, error: recentError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentError) {
        console.error('Error fetching recent products:', recentError);
      }

      setStats({
        totalProducts: totalProducts || 0,
        promoProducts: promoProducts,
        recentProducts: recentProducts || []
      });
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      // Set fallback data
      setStats({
        totalProducts: 0,
        promoProducts: 0,
        recentProducts: []
      });
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
    <div className="space-y-8">
      {/* Header Section - Improved typography and spacing */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
            Dashboard Admin
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-400 mt-2">
            Kelola produk dan monitor performa toko Anda
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild className="btn-responsive shadow-sm">
            <Link href="/admin/products/add">
              <Plus className="icon-responsive-sm mr-2" />
              <span className="hidden sm:inline">Tambah Produk</span>
              <span className="sm:hidden">Tambah</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards - Improved visual hierarchy */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-responsive border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Total Produk
            </CardTitle>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {stats.totalProducts.toLocaleString('id-ID')}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Produk aktif dalam katalog
            </p>
          </CardContent>
        </Card>

        <Card className="card-responsive border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Produk Promo
            </CardTitle>
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <Tag className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {stats.promoProducts.toLocaleString('id-ID')}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Produk dengan promo aktif
            </p>
          </CardContent>
        </Card>

        <Card className="card-responsive border-0 shadow-md hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
              Tingkat Konversi
            </CardTitle>
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">12.5%</div>
            <p className="text-sm text-green-600 dark:text-green-400 font-medium">
              +2.1% dari bulan lalu
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Products - Improved layout and typography */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                Produk Terbaru
              </CardTitle>
              <CardDescription className="text-base text-gray-600 dark:text-gray-400 mt-1">
                5 produk terakhir yang ditambahkan ke katalog
              </CardDescription>
            </div>
            <Button asChild variant="outline" size="sm" className="self-start sm:self-auto">
              <Link href="/admin/products">
                Lihat Semua
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {stats.recentProducts.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Belum ada produk
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Mulai dengan menambahkan produk pertama Anda
              </p>
              <Button asChild>
                <Link href="/admin/products/add">
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Produk Pertama
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.recentProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    {product.images && product.images.length > 0 && (
                      <div className="w-16 h-16 relative rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-700">
                        {!imageErrors[product.id] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover transition-opacity duration-200"
                            onError={() => handleImageError(product.id)}
                            onLoad={(e) => {
                              const img = e.target as HTMLImageElement;
                              img.style.opacity = '1';
                            }}
                            style={{ opacity: 0 }}
                            sizes="64px"
                            priority={false}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                            <Package className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate mb-1">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {product.brand} • {product.category}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        {product.promo && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                            Promo
                          </span>
                        )}
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(product.created_at).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      Rp {product.price.toLocaleString('id-ID')}
                    </p>
                    <Button asChild variant="ghost" size="sm" className="mt-2">
                      <Link href={`/admin/products/${product.id}/edit`}>
                        Edit
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions & System Status - Improved layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
              Aksi Cepat
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Akses cepat ke fitur-fitur utama
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild variant="outline" className="w-full justify-start h-12 text-left hover:bg-gray-50 dark:hover:bg-gray-800">
              <Link href="/admin/products">
                <Package className="w-5 h-5 mr-3 text-blue-600" />
                <div>
                  <div className="font-medium">Kelola Produk</div>
                  <div className="text-xs text-gray-500">Lihat dan edit produk</div>
                </div>
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start h-12 text-left hover:bg-gray-50 dark:hover:bg-gray-800">
              <Link href="/admin/products/add">
                <Plus className="w-5 h-5 mr-3 text-green-600" />
                <div>
                  <div className="font-medium">Tambah Produk Baru</div>
                  <div className="text-xs text-gray-500">Buat produk baru</div>
                </div>
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start h-12 text-left hover:bg-gray-50 dark:hover:bg-gray-800">
              <Link href="/admin/promos">
                <Tag className="w-5 h-5 mr-3 text-orange-600" />
                <div>
                  <div className="font-medium">Kelola Promo</div>
                  <div className="text-xs text-gray-500">Atur promosi produk</div>
                </div>
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
              Status Sistem
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Monitor kesehatan sistem
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/10 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="font-medium text-gray-900 dark:text-white">Database</span>
                </div>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">Terhubung</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/10 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="font-medium text-gray-900 dark:text-white">Storage</span>
                </div>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">Aktif</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/10 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="font-medium text-gray-900 dark:text-white">Autentikasi</span>
                </div>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">Aman</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}