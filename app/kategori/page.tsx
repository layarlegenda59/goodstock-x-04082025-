'use client';

import Link from 'next/link';
import { categories } from '@/lib/mockData';
import CategoryGrid from '@/components/CategoryGrid';

export default function KategoriPage() {
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-8">Semua Kategori</h1>
      
      <CategoryGrid />
      
      <div className="space-y-8">
        {Object.entries(categories).map(([key, category]) => (
          <div key={key}>
            <h2 className="text-2xl font-semibold mb-4">{category.name}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {category.subcategories.map((sub) => (
                <Link
                  key={sub}
                  href={`/kategori/${key}?subcategory=${encodeURIComponent(sub)}`}
                  className="p-4 bg-card border rounded-lg hover:shadow-md transition-shadow text-center"
                >
                  <span className="text-sm font-medium">{sub}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}