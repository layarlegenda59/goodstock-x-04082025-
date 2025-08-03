import { Product } from '@/store/wishlist';

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Air Jordan 1 Retro High OG',
    brand: 'Air Jordan',
    price: 2100000,
    originalPrice: 2500000,
    discount: 16,
    image: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg',
    category: 'sepatu',
    subcategory: 'Sneakers',
    gender: 'unisex',
    sizes: ['39', '40', '41', '42', '43', '44'],
    colors: ['Black/Red', 'White/Black'],
    isPromo: true,
    description: 'Sepatu basket ikonik dengan desain timeless dan kualitas premium.'
  },
  {
    id: '2',
    name: 'Nike Air Force 1 Low',
    brand: 'Nike',
    price: 1299000,
    originalPrice: 1499000,
    discount: 13,
    image: 'https://images.pexels.com/photos/1464625/pexels-photo-1464625.jpeg',
    category: 'sepatu',
    subcategory: 'Sneakers',
    gender: 'unisex',
    sizes: ['38', '39', '40', '41', '42', '43'],
    colors: ['White', 'Black', 'Navy'],
    isPromo: true,
    description: 'Sepatu klasik yang cocok untuk berbagai occasion dengan kenyamanan maksimal.'
  },
  {
    id: '3',
    name: 'Adidas Ultraboost 22',
    brand: 'Adidas',
    price: 2800000,
    image: 'https://images.pexels.com/photos/1464625/pexels-photo-1464625.jpeg',
    category: 'sepatu',
    subcategory: 'Sepatu Olahraga',
    gender: 'unisex',
    sizes: ['39', '40', '41', '42', '43', '44', '45'],
    colors: ['Core Black', 'Cloud White', 'Navy'],
    description: 'Sepatu lari dengan teknologi Boost untuk performa dan kenyamanan terbaik.'
  },
  {
    id: '4',
    name: 'Louis Vuitton Keepall 50',
    brand: 'Louis Vuitton',
    price: 25000000,
    originalPrice: 28000000,
    discount: 11,
    image: 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg',
    category: 'tas',
    subcategory: 'Hand Bag',
    gender: 'unisex',
    sizes: ['One Size'],
    colors: ['Monogram', 'Damier Ebene'],
    isPromo: true,
    description: 'Tas travel mewah dengan desain ikonik dan kualitas premium.'
  },
  {
    id: '5',
    name: 'The North Face Borealis Backpack',
    brand: 'The North Face',
    price: 1299000,
    image: 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg',
    category: 'tas',
    subcategory: 'Backpack',
    gender: 'unisex',
    sizes: ['One Size'],
    colors: ['Black', 'Navy', 'Gray'],
    description: 'Backpack serbaguna dengan kompartemen laptop dan desain ergonomis.'
  },
  {
    id: '6',
    name: 'Stone Island Hoodie',
    brand: 'Stone Island',
    price: 4500000,
    originalPrice: 5200000,
    discount: 13,
    image: 'https://images.pexels.com/photos/1182825/pexels-photo-1182825.jpeg',
    category: 'pakaian',
    subcategory: 'Hoodies',
    gender: 'pria',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Black', 'Navy', 'Olive'],
    isPromo: true,
    description: 'Hoodie premium dengan bahan berkualitas tinggi dan desain minimalis.'
  },
  {
    id: '7',
    name: 'Uniqlo Airism T-Shirt',
    brand: 'Uniqlo',
    price: 149000,
    image: 'https://images.pexels.com/photos/1182825/pexels-photo-1182825.jpeg',
    category: 'pakaian',
    subcategory: 'Kaos',
    gender: 'unisex',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['White', 'Black', 'Gray', 'Navy'],
    description: 'Kaos dengan teknologi Airism yang menyerap keringat dan cepat kering.'
  },
  {
    id: '8',
    name: 'Converse Chuck Taylor All Star',
    brand: 'Converse',
    price: 899000,
    originalPrice: 1099000,
    discount: 18,
    image: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg',
    category: 'sepatu',
    subcategory: 'Casual',
    gender: 'unisex',
    sizes: ['36', '37', '38', '39', '40', '41', '42', '43'],
    colors: ['Black', 'White', 'Red', 'Navy'],
    isPromo: true,
    description: 'Sepatu canvas klasik dengan desain timeless yang cocok untuk gaya kasual.'
  }
];

export const brands = [
  'adidas', 'nike', 'Air Jordan', 'reebok', 'New Balance', 'puma', 'asics', 'Diadora', 
  'Umbro', 'Fila', 'GAP', 'Uniqlo', 'Onitsuka Tiger', 'Under Armour', 'Salomon', 
  'On Cloud', 'Li-Ning', 'Yonex', 'Mizuno', 'Columbia', 'Timberland', 'Dr. Martens', 
  'Clarks', 'Converse', 'Vans', 'Skechers', 'Lacoste', 'Stone Island', 'Saucony', 
  'K-Swiss', 'Kenzo', 'Levis', 'Balenciaga', 'Fendi', 'Louis Vuitton', 'Coach', 
  'Bally', 'Versace', 'Ferragamo', 'Tumi', 'Gucci', 'Dior', 'Prada', 'Givenchy', 
  'Hermes', 'H&M', 'The North Face', 'Calvin Klein', 'Ecco', 'Burberry', 'Carhartt', 
  'Christian Louboutin', 'Chanel'
].sort();

export const categories = {
  sepatu: {
    name: 'Sepatu',
    subcategories: ['Sneakers', 'Casual', 'Boots', 'Sepatu Olahraga', 'Sepatu Bola', 'Sepatu Luxury Brand', 'Sepatu Anak']
  },
  tas: {
    name: 'Tas',
    subcategories: ['Backpack', 'Tas Laptop', 'Sling Bag', 'Tote Bag', 'Hand Bag', 'Waist Bag', 'Tas Kulit']
  },
  pakaian: {
    name: 'Pakaian',
    subcategories: ['Hoodies', 'Crewneck', 'Jaket', 'Kemeja', 'Kaos']
  }
};

export const shoeSizes = ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47'];
export const clothingSizes = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];