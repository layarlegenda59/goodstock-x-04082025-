-- Script SQL untuk menambahkan 6 produk sample dari berbagai kategori ke database Supabase
-- Pastikan tabel products sudah ada sebelum menjalankan script ini

-- Produk 1: Sepatu Sneakers - Air Jordan 1 Retro High OG
INSERT INTO products (
  name, 
  brand, 
  price, 
  discount, 
  images, 
  category, 
  subcategory, 
  gender, 
  sizes, 
  description, 
  promo,
  created_at,
  updated_at
) VALUES (
  'Air Jordan 1 Retro High OG',
  'Air Jordan',
  2100000,
  16,
  ARRAY['https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg'],
  'sepatu',
  'Sneakers',
  'unisex',
  ARRAY['39', '40', '41', '42', '43', '44'],
  'Sepatu basket ikonik dengan desain timeless dan kualitas premium.',
  true,
  NOW(),
  NOW()
);

-- Produk 2: Sepatu Casual - Nike Air Force 1 Low
INSERT INTO products (
  name, 
  brand, 
  price, 
  discount, 
  images, 
  category, 
  subcategory, 
  gender, 
  sizes, 
  description, 
  promo,
  created_at,
  updated_at
) VALUES (
  'Nike Air Force 1 Low',
  'Nike',
  1299000,
  13,
  ARRAY['https://images.pexels.com/photos/1464625/pexels-photo-1464625.jpeg'],
  'sepatu',
  'Sneakers',
  'unisex',
  ARRAY['38', '39', '40', '41', '42', '43'],
  'Sepatu klasik yang cocok untuk berbagai occasion dengan kenyamanan maksimal.',
  true,
  NOW(),
  NOW()
);

-- Produk 3: Tas Hand Bag - Louis Vuitton Keepall 50
INSERT INTO products (
  name, 
  brand, 
  price, 
  discount, 
  images, 
  category, 
  subcategory, 
  gender, 
  sizes, 
  description, 
  promo,
  created_at,
  updated_at
) VALUES (
  'Louis Vuitton Keepall 50',
  'Louis Vuitton',
  25000000,
  11,
  ARRAY['https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg'],
  'tas',
  'Hand Bag',
  'unisex',
  ARRAY['One Size'],
  'Tas travel mewah dengan desain ikonik dan kualitas premium.',
  true,
  NOW(),
  NOW()
);

-- Produk 4: Tas Backpack - The North Face Borealis Backpack
INSERT INTO products (
  name, 
  brand, 
  price, 
  discount, 
  images, 
  category, 
  subcategory, 
  gender, 
  sizes, 
  description, 
  promo,
  created_at,
  updated_at
) VALUES (
  'The North Face Borealis Backpack',
  'The North Face',
  1299000,
  0,
  ARRAY['https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg'],
  'tas',
  'Backpack',
  'unisex',
  ARRAY['One Size'],
  'Backpack serbaguna dengan kompartemen laptop dan desain ergonomis.',
  false,
  NOW(),
  NOW()
);

-- Produk 5: Pakaian Hoodie - Stone Island Hoodie
INSERT INTO products (
  name, 
  brand, 
  price, 
  discount, 
  images, 
  category, 
  subcategory, 
  gender, 
  sizes, 
  description, 
  promo,
  created_at,
  updated_at
) VALUES (
  'Stone Island Hoodie',
  'Stone Island',
  4500000,
  13,
  ARRAY['https://images.pexels.com/photos/1182825/pexels-photo-1182825.jpeg'],
  'pakaian',
  'Hoodies',
  'pria',
  ARRAY['S', 'M', 'L', 'XL', 'XXL'],
  'Hoodie premium dengan bahan berkualitas tinggi dan desain minimalis.',
  true,
  NOW(),
  NOW()
);

-- Produk 6: Pakaian Kaos - Uniqlo Airism T-Shirt
INSERT INTO products (
  name, 
  brand, 
  price, 
  discount, 
  images, 
  category, 
  subcategory, 
  gender, 
  sizes, 
  description, 
  promo,
  created_at,
  updated_at
) VALUES (
  'Uniqlo Airism T-Shirt',
  'Uniqlo',
  149000,
  0,
  ARRAY['https://images.pexels.com/photos/1182825/pexels-photo-1182825.jpeg'],
  'pakaian',
  'Kaos',
  'unisex',
  ARRAY['S', 'M', 'L', 'XL', 'XXL'],
  'Kaos dengan teknologi Airism yang menyerap keringat dan cepat kering.',
  false,
  NOW(),
  NOW()
);

-- Verifikasi data yang telah diinsert
SELECT 
  id,
  name,
  brand,
  price,
  discount,
  category,
  subcategory,
  gender,
  promo,
  created_at
FROM products 
WHERE name IN (
  'Air Jordan 1 Retro High OG',
  'Nike Air Force 1 Low', 
  'Louis Vuitton Keepall 50',
  'The North Face Borealis Backpack',
  'Stone Island Hoodie',
  'Uniqlo Airism T-Shirt'
)
ORDER BY created_at DESC;