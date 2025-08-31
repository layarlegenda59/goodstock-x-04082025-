'use client';

import HeroSlideManager from '@/components/admin/HeroSlideManager';

export default function HeroSlidesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-responsive-2xl font-bold text-gray-900 dark:text-white">
          Kelola Slide Hero Section
        </h1>
      </div>
      
      <HeroSlideManager />
    </div>
  );
}