'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Search, Tag, TrendingUp, Eye, Edit } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  brand: string;
  price: number;
  originalPrice?: number;
  discount: number | null;
  stock: number;
  promo: boolean;
  images: string[];
  created_at: string;
}

export default function PromosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, categoryFilter]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }

    setFilteredProducts(filtered);
  };

  const togglePromo = async (productId: string, currentPromo: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ promo: !currentPromo })
        .eq('id', productId);

      if (error) throw error;

      setProducts(products.map(p => 
        p.id === productId ? { ...p, promo: !currentPromo } : p
      ));
      toast.success(`Product ${!currentPromo ? 'added to' : 'removed from'} promo`);
    } catch (error: any) {
      console.error('Error updating promo status:', error);
      toast.error('Failed to update promo status');
    }
  };

  const updateDiscount = async (productId: string, discount: number) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ discount })
        .eq('id', productId);

      if (error) throw error;

      setProducts(products.map(p => 
        p.id === productId ? { ...p, discount } : p
      ));
      toast.success('Discount updated successfully');
    } catch (error: any) {
      console.error('Error updating discount:', error);
      toast.error('Failed to update discount');
    }
  };

  const promoProducts = filteredProducts.filter(p => p.promo);
  const regularProducts = filteredProducts.filter(p => !p.promo);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-responsive-2xl font-bold">Promo Management</h1>
        </div>
        <Card className="card-responsive">
          <CardContent className="p-responsive">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-responsive-2xl font-bold text-gray-900 dark:text-white">
          Promo Management
        </h1>
      </div>

      {/* Stats Cards */}
      <div className="grid-responsive gap-6">
        <Card className="card-responsive">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-responsive-sm font-medium">Total Products</CardTitle>
            <Tag className="icon-responsive-sm text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-responsive-xl font-bold">{products.length}</div>
            <p className="text-responsive-xs text-muted-foreground">
              All products in catalog
            </p>
          </CardContent>
        </Card>

        <Card className="card-responsive">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-responsive-sm font-medium">Promo Items</CardTitle>
            <TrendingUp className="icon-responsive-sm text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-responsive-xl font-bold">{promoProducts.length}</div>
            <p className="text-responsive-xs text-muted-foreground">
              Products with active promotions
            </p>
          </CardContent>
        </Card>

        <Card className="card-responsive">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-responsive-sm font-medium">Avg Discount</CardTitle>
            <Tag className="icon-responsive-sm text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-responsive-xl font-bold">
              {promoProducts.length > 0 
                ? Math.round(promoProducts.reduce((sum, p) => sum + (p.discount || 0), 0) / promoProducts.length)
                : 0}%
            </div>
            <p className="text-responsive-xs text-muted-foreground">
              Average discount rate
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="card-responsive">
        <CardHeader>
          <CardTitle className="text-responsive-lg">Promo Products Management</CardTitle>
          <CardDescription className="text-responsive-sm">
            Manage promotional status and discounts for your products
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 icon-responsive-sm" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-responsive-sm"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48 text-responsive-sm">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-responsive-sm">All Categories</SelectItem>
                <SelectItem value="sepatu" className="text-responsive-sm">Sepatu</SelectItem>
                <SelectItem value="tas" className="text-responsive-sm">Tas</SelectItem>
                <SelectItem value="pakaian" className="text-responsive-sm">Pakaian</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Products Table */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-responsive-sm">Product</TableHead>
                  <TableHead className="text-responsive-sm hidden md:table-cell">Category</TableHead>
                  <TableHead className="text-responsive-sm">Price</TableHead>
                  <TableHead className="text-responsive-sm hidden sm:table-cell">Discount (%)</TableHead>
                  <TableHead className="text-responsive-sm hidden lg:table-cell">Promo Status</TableHead>
                  <TableHead className="text-right text-responsive-sm">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-responsive-sm">
                      No products found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {product.images && product.images.length > 0 && (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-8 h-8 sm:w-10 sm:h-10 object-cover rounded-lg flex-shrink-0"
                            />
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="text-responsive-sm font-medium truncate">{product.name}</div>
                            <div className="text-responsive-xs text-muted-foreground truncate">{product.brand}</div>
                            <div className="md:hidden text-responsive-xs text-muted-foreground capitalize">{product.category}</div>
                            <div className="sm:hidden text-responsive-xs">
                              {product.discount && product.discount > 0 ? `${product.discount}% off` : 'No discount'}
                            </div>
                            <div className="lg:hidden text-responsive-xs">
                              <Badge 
                                variant={product.promo ? "default" : "secondary"}
                                className="cursor-pointer text-responsive-xs touch-target mt-1"
                                onClick={() => togglePromo(product.id, product.promo)}
                              >
                                {product.promo ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div>
                          <div className="text-responsive-sm capitalize">{product.category}</div>
                          <div className="text-responsive-xs text-muted-foreground">{product.subcategory}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-responsive-sm font-medium">Rp {product.price.toLocaleString('id-ID')}</div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={product.discount || 0}
                          onChange={(e) => {
                            const discount = Number(e.target.value);
                            if (discount >= 0 && discount <= 100) {
                              updateDiscount(product.id, discount);
                            }
                          }}
                          className="w-16 sm:w-20 text-responsive-sm"
                        />
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge 
                          variant={product.promo ? "default" : "secondary"}
                          className="cursor-pointer text-responsive-xs touch-target"
                          onClick={() => togglePromo(product.id, product.promo)}
                        >
                          {product.promo ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" asChild className="min-h-[44px] min-w-[44px]">
                            <Link href={`/produk/${product.id}`}>
                              <Eye className="icon-responsive-sm" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="sm" asChild className="min-h-[44px] min-w-[44px]">
                            <Link href={`/admin/products/edit/${product.id}`}>
                              <Edit className="icon-responsive-sm" />
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}