'use client';

import { useState, useEffect } from 'react';
import { Heart, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { useWishlistStore } from '@/store/wishlist';
import { useCartStore } from '@/store/cart';
import { formatPrice } from '@/lib/utils';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/store/wishlist';

interface ProductPageClientProps {
  product: Product;
}

export default function ProductPageClient({ product }: ProductPageClientProps) {
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [imageErrors, setImageErrors] = useState<{[key: number]: boolean}>({});
  const [imageRetries, setImageRetries] = useState<{[key: number]: number}>({});
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  
  const { addItem, removeItem, isInWishlist } = useWishlistStore();
  const { addItem: addToCart } = useCartStore();
  const inWishlist = isInWishlist(product.id);

  // Use product images from Supabase
  const productImages = [product.image];

  // Helper functions for image handling
  const handleImageError = (index: number) => {
    const currentRetries = imageRetries[index] || 0;
    const maxRetries = 2;
    
    console.warn(`Image failed to load at index ${index} (attempt ${currentRetries + 1}):`, productImages[index]);
    
    if (currentRetries < maxRetries && productImages[index]?.includes('supabase.co/storage')) {
      // Retry loading the image
      setImageRetries(prev => ({ ...prev, [index]: currentRetries + 1 }));
      
      // Force reload after a short delay
      setTimeout(() => {
        const img = new window.Image();
        img.onload = () => {
          console.log(`Image retry successful for index ${index}`);
          // Reset error state if retry succeeds
          setImageErrors(prev => ({ ...prev, [index]: false }));
        };
        img.onerror = () => {
          console.error(`Image retry failed for index ${index}`);
          setImageErrors(prev => ({ ...prev, [index]: true }));
        };
        img.src = productImages[index];
      }, 1000 * (currentRetries + 1)); // Exponential backoff
    } else {
      // Max retries reached or not a Supabase URL, use fallback
      setImageErrors(prev => ({ ...prev, [index]: true }));
    }
  };

  const getImageSrc = (imageSrc: string, index: number) => {
    if (imageErrors[index]) {
      return '/placeholder-image.svg';
    }
    
    // Check if the image URL is from Supabase storage
    if (imageSrc && imageSrc.includes('supabase.co/storage')) {
      // Add error handling for Supabase storage URLs
      try {
        // Validate URL format
        const url = new URL(imageSrc);
        
        // Add cache-busting parameter to help with QUIC protocol issues
        const retryCount = imageRetries[index] || 0;
        if (retryCount > 0) {
          url.searchParams.set('retry', retryCount.toString());
          url.searchParams.set('t', Date.now().toString());
        }
        
        return url.toString();
      } catch (error) {
        console.warn('Invalid Supabase storage URL:', imageSrc);
        return '/placeholder-image.svg';
      }
    }
    
    return imageSrc || '/placeholder-image.svg';
  };

  // Alternative image source for critical failures
  const getAlternativeImageSrc = (imageSrc: string) => {
    if (imageSrc && imageSrc.includes('supabase.co/storage')) {
      // Try to construct a direct storage URL without CDN
      try {
        const url = new URL(imageSrc);
        // Force HTTP/1.1 by adding specific parameters
        url.searchParams.set('download', 'true');
        return url.toString();
      } catch (error) {
        return '/placeholder-image.svg';
      }
    }
    return '/placeholder-image.svg';
  };

  // Function to handle network errors specifically
  const handleNetworkError = (index: number, error: any) => {
    console.error(`Network error loading image at index ${index}:`, error);
    handleImageError(index);
  };
  
  // Fetch related products from Supabase
  useEffect(() => {
    const fetchRelatedProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', product.category)
        .neq('id', product.id)
        .limit(4);
      
      if (data && !error) {
        const transformedProducts = data.map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description || '',
          price: p.price,
          originalPrice: p.discount ? p.price / (1 - p.discount / 100) : p.price,
          discount: p.discount || 0,
          image: p.images?.[0] || '/placeholder-image.svg',
          images: p.images || ['/placeholder-image.svg'],
          category: p.category,
          subcategory: p.subcategory,
          brand: p.brand,
          sizes: p.sizes || [],
          colors: ['Default'],
          stock: p.stock,
          rating: 4.5,
          reviews: 0,
          gender: p.gender
        }));
        setRelatedProducts(transformedProducts);
      }
    };
    
    fetchRelatedProducts();
  }, [product.category, product.id]);

  const handleWishlistToggle = () => {
    if (inWishlist) {
      removeItem(product.id);
    } else {
      addItem(product);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedSize) {
      alert('Silakan pilih ukuran terlebih dahulu');
      return;
    }
    
    setIsAddingToCart(true);
    
    // Add to cart
    addToCart(product, selectedSize, selectedColor);
    
    // Show success feedback
    setTimeout(() => {
      setIsAddingToCart(false);
      alert('Produk berhasil ditambahkan ke keranjang!');
    }, 500);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
            <Image
              src={getImageSrc(productImages[currentImageIndex], currentImageIndex)}
              alt={product.name}
              fill
              className="object-cover"
              onError={() => handleImageError(currentImageIndex)}
              onLoadingComplete={() => console.log('Image loaded successfully:', productImages[currentImageIndex])}
              unoptimized={productImages[currentImageIndex]?.includes('supabase.co/storage')}
              priority={currentImageIndex === 0}
            />
            
            {/* Image Navigation */}
            {productImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Discount Badge */}
            {product.discount && product.discount > 0 && (
              <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded">
                {product.discount}% OFF
              </div>
            )}
          </div>

          {/* Image Thumbnails */}
          {productImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                    index === currentImageIndex ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <Image
                    src={getImageSrc(image, index)}
                    alt={`${product.name} ${index + 1}`}
                    width={80}
                    height={80}
                    className="object-cover w-full h-full"
                    onError={() => handleImageError(index)}
                    unoptimized={image?.includes('supabase.co/storage')}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <div className="text-sm text-primary font-semibold mb-2">
              {product.brand}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-4">
              {product.name}
            </h1>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="text-3xl font-bold text-foreground">
                {formatPrice(product.price)}
              </div>
              {product.originalPrice && (
                <div className="text-lg text-muted-foreground line-through">
                  {formatPrice(product.originalPrice)}
                </div>
              )}
            </div>

            {product.description && (
              <p className="text-muted-foreground mb-6">
                {product.description}
              </p>
            )}
          </div>

          {/* Color Selection */}
          {product.colors && product.colors.length > 1 && (
            <div>
              <h3 className="font-medium mb-3">Warna</h3>
              <div className="flex gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 border rounded-lg text-sm transition-colors ${
                      selectedColor === color
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'hover:bg-accent'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          <div>
            <h3 className="font-medium mb-3">Ukuran</h3>
            <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`py-2 px-3 border rounded-lg text-sm transition-colors ${
                    selectedSize === size
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'hover:bg-accent'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleAddToCart}
              disabled={!selectedSize}
              className="w-full bg-primary hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed text-primary-foreground py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {isAddingToCart ? 'Menambahkan...' : 'Tambah ke Keranjang'}
            </button>
            
            <button
              onClick={handleWishlistToggle}
              className={`w-full py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors border ${
                inWishlist
                  ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                  : 'border-gray-300 hover:bg-accent'
              }`}
            >
              <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
              {inWishlist ? 'Hapus dari Wishlist' : 'Tambah ke Wishlist'}
            </button>
          </div>

          {/* Product Info */}
          <div className="border-t pt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Kategori:</span>
                <div className="font-medium capitalize">{product.category}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Subcategory:</span>
                <div className="font-medium">{product.subcategory}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Gender:</span>
                <div className="font-medium capitalize">{product.gender}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Brand:</span>
                <div className="font-medium">{product.brand}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6">Produk Serupa</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}