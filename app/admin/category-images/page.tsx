'use client';

import CategoryImageManager from '@/components/admin/CategoryImageManager';

export default function CategoryImagesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-responsive-2xl font-bold text-gray-900 dark:text-white">
          Kelola Gambar Kategori Populer
        </h1>
      </div>
      
      <CategoryImageManager />
    </div>
  );
}