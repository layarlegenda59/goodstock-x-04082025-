'use client';

import HeroSlideManager from '@/components/admin/HeroSlideManager';

export default function HeroSlidesPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
            Hero Slides
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-400 mt-2">
            Kelola slide hero section di halaman utama
          </p>
        </div>
      </div>
      
      <HeroSlideManager />
    </div>
  );
}