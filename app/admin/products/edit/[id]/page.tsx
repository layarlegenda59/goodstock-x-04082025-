'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { categories, brands, shoeSizes, clothingSizes } from '@/lib/mockData';
import ImageUpload from '@/components/admin/ImageUpload';
import { PriceInput } from '@/components/ui/price-input';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  category: z.enum(['sepatu', 'tas', 'pakaian']),
  subcategory: z.string().min(1, 'Subcategory is required'),
  brand: z.string().min(1, 'Brand is required'),
  originalPrice: z.number().min(0, 'Original price must be positive'),
  price: z.number().min(0, 'Final price must be positive'),
  discount: z.number().min(0).max(100).optional(),
  stock: z.number().min(0, 'Stock must be positive'),
  sizes: z.array(z.string()).min(1, 'At least one size is required'),
  gender: z.enum(['pria', 'wanita', 'unisex']),
  promo: z.boolean().default(false),
});

type ProductFormData = z.infer<typeof productSchema>;

interface EditProductPageProps {
  params: { id: string };
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [product, setProduct] = useState<any>(null);
  const router = useRouter();
  const { id } = params;

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      category: 'sepatu',
      subcategory: '',
      brand: '',
      originalPrice: 0, // Fixed: Added missing originalPrice
      price: 0,
      discount: 0,
      stock: 0,
      sizes: [],
      gender: 'unisex',
      promo: false,
    },
  });

  const selectedCategory = form.watch('category');
  const originalPrice = form.watch('originalPrice');
  const discount = form.watch('discount');
  const availableSizes = selectedCategory === 'sepatu' ? shoeSizes : 
                        selectedCategory === 'pakaian' ? clothingSizes : 
                        ['One Size'];

  // Fetch product data
  const fetchProduct = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        setProduct(data);
        setImages(data.images || []);
        
        // Reset form with fetched data
        form.reset({
          name: data.name,
          description: data.description || '',
          category: data.category,
          subcategory: data.subcategory,
          brand: data.brand,
          originalPrice: data.originalPrice || data.price,
          price: data.price,
          discount: data.discount || 0,
          stock: data.stock,
          sizes: data.sizes || [],
          gender: data.gender,
          promo: data.promo,
        });
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to fetch product');
      router.push('/admin/products');
    } finally {
      setFetchLoading(false);
    }
  }, [id, form, router]);

  // Auto-calculate discounted price
  useEffect(() => {
    if (originalPrice && discount !== undefined) {
      const discountedPrice = originalPrice - (originalPrice * (discount / 100));
      form.setValue('price', Math.round(discountedPrice));
    }
  }, [originalPrice, discount, form]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const onSubmit = async (data: ProductFormData) => {
    if (images.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    setLoading(true);
    try {
      // Only include the fields that should be updated
      // Note: updated_at will be automatically set by the database default
      const updateData = {
        name: data.name,
        description: data.description,
        category: data.category,
        subcategory: data.subcategory,
        brand: data.brand,
        originalPrice: data.originalPrice,
        price: data.price,
        discount: data.discount,
        stock: data.stock,
        sizes: data.sizes,
        gender: data.gender,
        promo: data.promo,
        images,
      };
      
      const { error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      toast.success('Product updated successfully');
      
      // Navigate back to products page
      router.push('/admin/products');
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild className="btn-responsive touch-target">
            <Link href="/admin/products">
              <ArrowLeft className="icon-responsive-sm mr-2" />
              Back to Products
            </Link>
          </Button>
          <h1 className="text-responsive-2xl font-bold text-gray-900 dark:text-white">
            Edit Product
          </h1>
        </div>
        <Card className="card-responsive">
          <CardContent className="p-responsive">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild className="btn-responsive touch-target">
            <Link href="/admin/products">
              <ArrowLeft className="icon-responsive-sm mr-2" />
              Back to Products
            </Link>
          </Button>
          <h1 className="text-responsive-2xl font-bold text-gray-900 dark:text-white">
            Product Not Found
          </h1>
        </div>
        <Card className="card-responsive">
          <CardContent className="p-responsive text-center">
            <p className="text-muted-foreground text-responsive-sm">The product you&apos;re looking for doesn&apos;t exist.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.push('/admin/products')}
          className="btn-responsive touch-target"
        >
          <ArrowLeft className="icon-responsive-sm mr-2" />
          Back to Products
        </Button>
        <h1 className="text-responsive-2xl font-bold text-gray-900 dark:text-white">
          Edit Product: {product.name}
        </h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="card-responsive">
                <CardHeader>
                  <CardTitle className="text-responsive-lg">Product Information</CardTitle>
                  <CardDescription className="text-responsive-sm">
                    Update product details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 p-responsive">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-responsive-sm">Product Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter product name" {...field} className="text-responsive-sm touch-target" />
                        </FormControl>
                        <FormMessage className="text-responsive-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-responsive-sm">Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter product description" 
                            {...field} 
                            className="text-responsive-sm touch-target"
                          />
                        </FormControl>
                        <FormMessage className="text-responsive-xs" />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-responsive-sm">Category</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="text-responsive-sm touch-target">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(categories).map(([key, category]) => (
                                <SelectItem key={key} value={key} className="text-responsive-sm">
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-responsive-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="subcategory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-responsive-sm">Subcategory</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="text-responsive-sm touch-target">
                                <SelectValue placeholder="Select subcategory" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories[selectedCategory]?.subcategories.map((sub) => (
                                <SelectItem key={sub} value={sub} className="text-responsive-sm">
                                  {sub}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-responsive-xs" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="brand"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-responsive-sm">Brand</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="text-responsive-sm touch-target">
                              <SelectValue placeholder="Select brand" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {brands.map((brand) => (
                              <SelectItem key={brand} value={brand} className="text-responsive-sm">
                                {brand}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-responsive-xs" />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card className="card-responsive">
                <CardHeader>
                  <CardTitle className="text-responsive-lg">Pricing & Inventory</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-responsive">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <FormField
                      control={form.control}
                      name="originalPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-responsive-sm">Origin Price (IDR)</FormLabel>
                          <FormControl>
                            <PriceInput 
                              value={field.value}
                              onChange={field.onChange}
                              className="text-responsive-sm touch-target"
                            />
                          </FormControl>
                          <FormMessage className="text-responsive-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-responsive-sm">Price after Discount (IDR)</FormLabel>
                          <FormControl>
                            <PriceInput 
                              value={field.value}
                              onChange={field.onChange}
                              className="text-responsive-sm touch-target"
                            />
                          </FormControl>
                          <FormMessage className="text-responsive-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="discount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-responsive-sm">Discount (%)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="" 
                              min="0"
                              max="100"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                              className="text-responsive-sm touch-target"
                            />
                          </FormControl>
                          <FormMessage className="text-responsive-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="stock"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-responsive-sm">Stock Quantity</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="" 
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                              className="text-responsive-sm touch-target"
                            />
                          </FormControl>
                          <FormMessage className="text-responsive-xs" />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="card-responsive">
                <CardHeader>
                  <CardTitle className="text-responsive-lg">Product Variants</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-responsive">
                  <FormField
                    control={form.control}
                    name="sizes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-responsive-sm">Available Sizes</FormLabel>
                        <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                          {availableSizes.map((size) => (
                            <div key={size} className="flex items-center space-x-2">
                              <Checkbox
                                id={size}
                                checked={field.value.includes(size)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange([...field.value, size]);
                                  } else {
                                    field.onChange(field.value.filter((s) => s !== size));
                                  }
                                }}
                                className="touch-target"
                              />
                              <Label htmlFor={size} className="text-responsive-xs">
                                {size}
                              </Label>
                            </div>
                          ))}
                        </div>
                        <FormMessage className="text-responsive-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-responsive-sm">Gender</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="text-responsive-sm touch-target">
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pria" className="text-responsive-sm">Pria</SelectItem>
                            <SelectItem value="wanita" className="text-responsive-sm">Wanita</SelectItem>
                            <SelectItem value="unisex" className="text-responsive-sm">Unisex</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-responsive-xs" />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="card-responsive">
                <CardHeader>
                  <CardTitle className="text-responsive-lg">Product Images</CardTitle>
                  <CardDescription className="text-responsive-sm">
                    Update product images (max 5 images)
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-responsive">
                  <ImageUpload
                    images={images}
                    onImagesChange={setImages}
                    maxImages={5}
                  />
                </CardContent>
              </Card>

              <Card className="card-responsive">
                <CardHeader>
                  <CardTitle className="text-responsive-lg">Promotion</CardTitle>
                </CardHeader>
                <CardContent className="p-responsive">
                  <FormField
                    control={form.control}
                    name="promo"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="touch-target"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-responsive-sm">
                            Enable Promo
                          </FormLabel>
                          <FormDescription className="text-responsive-xs">
                            Mark this product as promotional item
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <div className="space-y-2">
                <Button type="submit" className="w-full btn-responsive touch-target" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="icon-responsive-sm mr-2 animate-spin" />
                      Updating Product...
                    </>
                  ) : (
                    <>
                      <Save className="icon-responsive-sm mr-2" />
                      Update Product
                    </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full btn-responsive touch-target"
                  onClick={() => router.push('/admin/products')}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}