'use client';

import { useEffect, useState, useCallback } from 'react';
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
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
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

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [promoFilter, setPromoFilter] = useState('all');

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, categoryFilter, promoFilter, filterProducts]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = useCallback(() => {
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

    // Promo filter
    if (promoFilter !== 'all') {
      filtered = filtered.filter(product => 
        promoFilter === 'promo' ? product.promo : !product.promo
      );
    }

    setFilteredProducts(filtered);
  }, [products, searchQuery, categoryFilter, promoFilter]);

  const handleDeleteProduct = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      setProducts(products.filter(p => p.id !== productId));
      toast.success('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
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
    } catch (error) {
      console.error('Error updating promo status:', error);
      toast.error('Failed to update promo status');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Products</h1>
        </div>
        <Card>
          <CardContent className="p-6">
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
          Products Management
        </h1>
        <Button asChild className="btn-responsive">
          <Link href="/admin/products/add">
            <Plus className="icon-responsive-sm mr-2" />
            <span className="hidden sm:inline">Add Product</span>
            <span className="sm:hidden">Add</span>
          </Link>
        </Button>
      </div>

      <Card className="card-responsive">
        <CardHeader>
          <CardTitle className="text-responsive-lg">Product Catalog</CardTitle>
          <CardDescription className="text-responsive-sm">
            Manage your product inventory and pricing
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
            <Select value={promoFilter} onValueChange={setPromoFilter}>
              <SelectTrigger className="w-full md:w-48 text-responsive-sm">
                <SelectValue placeholder="Promo Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-responsive-sm">All Products</SelectItem>
                <SelectItem value="promo" className="text-responsive-sm">Promo Only</SelectItem>
                <SelectItem value="regular" className="text-responsive-sm">Regular Only</SelectItem>
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
                  <TableHead className="text-responsive-sm hidden sm:table-cell">Stock</TableHead>
                  <TableHead className="text-responsive-sm hidden lg:table-cell">Status</TableHead>
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
                        <div>
                          <div className="text-responsive-sm font-medium">Rp {product.price.toLocaleString('id-ID')}</div>
                          {product.discount != null && product.discount > 0 && (
                            <div className="text-responsive-xs text-red-600">{product.discount}% off</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant={product.stock > 0 ? "secondary" : "destructive"} className="text-responsive-xs">
                          {product.stock} units
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex gap-2">
                          <Badge 
                            variant={product.promo ? "default" : "secondary"}
                            className="cursor-pointer text-responsive-xs touch-target"
                            onClick={() => togglePromo(product.id, product.promo)}
                          >
                            {product.promo ? 'Promo' : 'Regular'}
                          </Badge>
                        </div>
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
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="min-h-[44px] min-w-[44px]">
                                <Trash2 className="icon-responsive-sm text-red-600" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="mx-4">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-responsive-lg">Delete Product</AlertDialogTitle>
                                <AlertDialogDescription className="text-responsive-sm">
                                  Are you sure you want to delete "{product.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="btn-responsive-sm">Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="bg-red-600 hover:bg-red-700 btn-responsive-sm"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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