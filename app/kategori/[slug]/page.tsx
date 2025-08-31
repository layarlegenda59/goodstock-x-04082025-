import { categories } from '@/lib/mockData';
import CategoryPageClient from './CategoryPageClient';
import { notFound } from 'next/navigation';

interface CategoryPageProps {
  params: { slug: string };
  searchParams: { subcategory?: string };
}

// Generate static params for all categories
export async function generateStaticParams() {
  const categoryKeys = Object.keys(categories);
  return categoryKeys.map((slug) => ({
    slug: slug,
  }));
}

export default function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = params;
  const { subcategory } = searchParams;
  
  // Validate category exists
  const category = categories[slug as keyof typeof categories];
  if (!category && slug !== 'all') {
    notFound();
  }

  return <CategoryPageClient params={params} searchParams={searchParams} />;
}