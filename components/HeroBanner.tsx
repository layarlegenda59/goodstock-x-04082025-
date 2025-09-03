'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface HeroSlide {
  id: number;
  title: string;
  subtitle: string;
  image_url: string;
  cta_text: string;
  cta_link: string;
  is_active: boolean;
  order_index: number;
}

// Fallback data jika database kosong
const fallbackBannerData = [
  {
    id: 1,
    title: 'Koleksi Sepatu Terbaru',
    subtitle: 'Dapatkan diskon hingga 50% untuk semua sneakers premium',
    image_url: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg',
    cta_text: 'Shop Now',
    cta_link: '/kategori/sepatu',
    is_active: true,
    order_index: 1
  },
  {
    id: 2,
    title: 'Tas Premium Collection',
    subtitle: 'Luxury bags untuk gaya hidup modern Anda',
    image_url: 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg',
    cta_text: 'Lihat Koleksi',
    cta_link: '/kategori/tas',
    is_active: true,
    order_index: 2
  },
  {
    id: 3,
    title: 'Fashion Streetwear',
    subtitle: 'Tampil trendy dengan koleksi pakaian terkini',
    image_url: 'https://images.pexels.com/photos/1182825/pexels-photo-1182825.jpeg',
    cta_text: 'Belanja Sekarang',
    cta_link: '/kategori/pakaian',
    is_active: true,
    order_index: 3
  }
];

export default function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState<HeroSlide[]>(fallbackBannerData);
  const [loading, setLoading] = useState(true);

  // Fungsi untuk mengambil data slide dari database
  const fetchSlides = async () => {
    try {
      const { data, error } = await supabase
        .from('hero_slides')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (error) {
        console.error('Error fetching slides:', error);
        setSlides(fallbackBannerData);
      } else if (data && data.length > 0) {
        // Use slides data as-is from database
        // Let the Image component handle loading errors with onError handler
        setSlides(data.map(slide => ({
          ...slide,
          image_url: slide.image_url
        })));
      } else {
        // Jika tidak ada data di database, gunakan fallback
        setSlides(fallbackBannerData);
      }
    } catch (error) {
      console.error('Error fetching slides:', error);
      setSlides(fallbackBannerData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  useEffect(() => {
    if (slides.length === 0) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  if (loading) {
    return (
      <div className="relative w-full h-64 md:h-96 bg-muted overflow-hidden rounded-lg flex items-center justify-center">
        <div className="text-muted-foreground">Loading slides...</div>
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div className="relative w-full h-64 md:h-96 bg-muted overflow-hidden rounded-lg flex items-center justify-center">
        <div className="text-muted-foreground">No slides available</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-64 md:h-96 bg-muted overflow-hidden rounded-lg">
      {slides.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
            index === currentSlide ? 'translate-x-0' : 
            index < currentSlide ? '-translate-x-full' : 'translate-x-full'
          }`}
        >
          <div className="relative w-full h-full">
            <Image
              src={banner.image_url}
              alt={banner.title}
              fill
              className="object-cover"
              unoptimized
              onError={(e) => {
                console.log('Image load error:', banner.image_url);
                // Fallback to a simple placeholder
                e.currentTarget.src = '/placeholder-image.svg';
              }}
            />
            <div className="absolute inset-0 bg-black/40" />
            
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white px-4">
                <h2 className="text-2xl md:text-4xl font-bold mb-2">
                  {banner.title}
                </h2>
                <p className="text-sm md:text-lg mb-4 opacity-90">
                  {banner.subtitle}
                </p>
                <a
                  href={banner.cta_link}
                  className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  {banner.cta_text}
                </a>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentSlide ? 'bg-white' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}