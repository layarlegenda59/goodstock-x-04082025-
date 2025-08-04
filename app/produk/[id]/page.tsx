import { supabase } from '@/lib/supabase';
import ProductPageClient from './ProductPageClient';
import { notFound } from 'next/navigation';

interface ProductPageProps {
  params: { id: string };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = params;
  
  // Fetch product from Supabase
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error || !product) {
    notFound();
  }

  // Transform Supabase product to match expected format
  const transformedProduct = {
    id: product.id,
    name: product.name,
    description: product.description || '',
    price: product.price,
    originalPrice: product.discount ? product.price / (1 - product.discount / 100) : product.price,
    discount: product.discount || undefined,
    image: product.images?.[0] || '/placeholder-image.svg',
    category: (product.category as 'sepatu' | 'tas' | 'pakaian') || 'sepatu',
    subcategory: product.subcategory || '',
    brand: product.brand || '',
    sizes: product.sizes || [],
    colors: product.colors || ['Default'],
    gender: (product.gender as 'pria' | 'wanita' | 'unisex') || 'unisex'
  };

  return <ProductPageClient product={transformedProduct} />;
}