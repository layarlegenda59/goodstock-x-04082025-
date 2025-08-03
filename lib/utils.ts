import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price);
}

export function generateWhatsAppMessage(productName: string, price: number, selectedSize?: string): string {
  const baseMessage = `Halo Goodstock-X, saya ingin memesan produk:
Nama: ${productName}
Harga: ${formatPrice(price)}`;
  
  if (selectedSize) {
    return `${baseMessage}
Ukuran: ${selectedSize}`;
  }
  
  return baseMessage;
}

export function openWhatsApp(message: string) {
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/6281234567890?text=${encodedMessage}`;
  window.open(whatsappUrl, '_blank');
}