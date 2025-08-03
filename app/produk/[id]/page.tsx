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
    discount: product.discount || 0,
    image: product.images?.[0] || '/placeholder-image.svg',
    images: product.images || ['/placeholder-image.svg'],
    category: product.category,
    subcategory: product.subcategory,
    brand: product.brand,
    sizes: product.sizes || [],
    colors: ['Default'], // Add default color since it's not in the database
    stock: product.stock,
    rating: 4.5, // Default rating
    reviews: 0, // Default reviews
    gender: product.gender
  };

  return <ProductPageClient product={transformedProduct} />;
}