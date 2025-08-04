import Link from 'next/link';
import Image from 'next/image';
import { categories } from '@/lib/mockData';

const categoryImages = {
  sepatu: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg',
  tas: 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg',
  pakaian: 'https://images.pexels.com/photos/1182825/pexels-photo-1182825.jpeg'
};

export default function CategoryGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
      {Object.entries(categories).map(([key, category]) => (
        <Link
          key={key}
          href={`/kategori/${key}`}
          className="group bg-card rounded-lg border overflow-hidden hover:shadow-lg transition-all duration-300"
        >
          <div className="aspect-[4/3] relative overflow-hidden">
            <Image
              src={categoryImages[key as keyof typeof categoryImages]}
              alt={category.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
            <div className="absolute inset-0 flex items-center justify-center">
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white text-center px-2">
                {category.name}
              </h3>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}