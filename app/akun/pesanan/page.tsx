'use client';

import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Package, Calendar, MapPin, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';


interface OrderItem {
  id: string;
  product_name: string;
  product_brand: string;
  product_price: number;
  selected_size: string;
  selected_color?: string;
  quantity: number;
  subtotal: number;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  shipping_address?: string;
  phone?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  order_items: OrderItem[];
}

export default function PesananPage() {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    } else {
      fetchOrders();
    }
  }, [isAuthenticated, router, user]);

  const fetchOrders = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Fetch orders with order items
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
        toast.error('Gagal memuat riwayat pesanan');
        return;
      }

      setOrders(ordersData || []);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast.error('Gagal memuat riwayat pesanan');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/akun" className="text-muted-foreground hover:text-foreground">
            ← Kembali
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold">Riwayat Pesanan</h1>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/6 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'delivered': return 'Terkirim';
      case 'shipped': return 'Dikirim';
      case 'processing': return 'Diproses';
      case 'cancelled': return 'Dibatalkan';
      default: return 'Unknown';
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/akun" className="text-muted-foreground hover:text-foreground">
          ← Kembali
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold">Riwayat Pesanan</h1>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Belum Ada Pesanan</h3>
            <p className="text-muted-foreground text-center mb-6">
              Anda belum memiliki riwayat pesanan. Mulai berbelanja sekarang!
            </p>
            <Button asChild>
              <Link href="/">Mulai Belanja</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">Pesanan #{order.order_number}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(order.created_at).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    {order.shipping_address && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate max-w-xs">{order.shipping_address}</span>
                      </div>
                    )}
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    {getStatusText(order.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {order.order_items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.product_brand} • Size: {item.selected_size}
                          {item.selected_color && ` • ${item.selected_color}`}
                        </p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          Rp {item.subtotal.toLocaleString('id-ID')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          @Rp {item.product_price.toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total:</span>
                      <span className="font-bold text-lg">
                        Rp {order.total_amount.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                  
                  {order.notes && (
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        <strong>Catatan:</strong> {order.notes}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm">
                      Lihat Detail
                    </Button>
                    {order.status === 'delivered' && (
                      <Button variant="outline" size="sm">
                        Beli Lagi
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}