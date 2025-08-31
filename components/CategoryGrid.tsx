'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { categories } from '@/lib/mockData';
import { supabase } from '@/lib/supabase';

interface CategoryImage {
  id: number;
  category_key: string;
  category_name: string;
  image_url: string;
  is_active: boolean;
}

// Fallback data jika database kosong
const fallbackCategoryImages = {
  sepatu: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg',
  tas: 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg',
  pakaian: 'https://images.pexels.com/photos/1182825/pexels-photo-1182825.jpeg'
};

export default function CategoryGrid() {
  const [categoryImages, setCategoryImages] = useState<Record<string, string>>(fallbackCategoryImages);
  const [loading, setLoading] = useState(true);

  // Fungsi untuk mengambil data gambar kategori dari database
  const fetchCategoryImages = async () => {
    try {
      const { data, error } = await supabase
        .from('category_images')
        .select('*')
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching category images:', error);
        setCategoryImages(fallbackCategoryImages);
      } else if (data && data.length > 0) {
        // Convert array to object dengan category_key sebagai key
        const imageMap: Record<string, string> = {};
        data.forEach((item: CategoryImage) => {
          imageMap[item.category_key] = item.image_url;
        });
        
        // Merge dengan fallback untuk kategori yang tidak ada di database
        setCategoryImages({ ...fallbackCategoryImages, ...imageMap });
      } else {
        setCategoryImages(fallbackCategoryImages);
      }
    } catch (error) {
      console.error('Error fetching category images:', error);
      setCategoryImages(fallbackCategoryImages);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryImages();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 grid-responsive mb-6 sm:mb-8">
        {Object.entries(categories).map(([key]) => (
          <div key={key} className="bg-card rounded-lg border overflow-hidden animate-pulse">
            <div className="aspect-[4/3] bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 grid-responsive mb-6 sm:mb-8">
      {Object.entries(categories).map(([key, category]) => (
        <Link
          key={key}
          href={`/kategori/${key}`}
          className="group bg-card rounded-lg border overflow-hidden hover:shadow-lg transition-all duration-300 touch-target"
        >
          <div className="aspect-[4/3] relative overflow-hidden">
            <Image
              src={categoryImages[key] || fallbackCategoryImages[key as keyof typeof fallbackCategoryImages]}
              alt={category.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
            <div className="absolute inset-0 flex items-center justify-center">
              <h3 className="text-responsive-lg font-bold text-white text-center px-2">
                {category.name}
              </h3>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}