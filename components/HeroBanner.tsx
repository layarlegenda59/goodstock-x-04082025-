'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const bannerData = [
  {
    id: 1,
    title: 'Koleksi Sepatu Terbaru',
    subtitle: 'Dapatkan diskon hingga 50% untuk semua sneakers premium',
    image: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg',
    cta: 'Shop Now',
    link: '/kategori/sepatu'
  },
  {
    id: 2,
    title: 'Tas Premium Collection',
    subtitle: 'Luxury bags untuk gaya hidup modern Anda',
    image: 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg',
    cta: 'Lihat Koleksi',
    link: '/kategori/tas'
  },
  {
    id: 3,
    title: 'Fashion Streetwear',
    subtitle: 'Tampil trendy dengan koleksi pakaian terkini',
    image: 'https://images.pexels.com/photos/1182825/pexels-photo-1182825.jpeg',
    cta: 'Belanja Sekarang',
    link: '/kategori/pakaian'
  }
];

export default function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerData.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % bannerData.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + bannerData.length) % bannerData.length);
  };

  return (
    <div className="relative w-full h-64 md:h-96 bg-muted overflow-hidden rounded-lg">
      {bannerData.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
            index === currentSlide ? 'translate-x-0' : 
            index < currentSlide ? '-translate-x-full' : 'translate-x-full'
          }`}
        >
          <div className="relative w-full h-full">
            <Image
              src={banner.image}
              alt={banner.title}
              fill
              className="object-cover"
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
                  href={banner.link}
                  className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  {banner.cta}
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
        {bannerData.map((_, index) => (
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