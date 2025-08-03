'use client';

import { useState } from 'react';
import { Minus, Plus, Trash2, ShoppingCart, MessageCircle, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/store/cart';
import { formatPrice, generateWhatsAppMessage, openWhatsApp } from '@/lib/utils';


export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, getTotalPrice } = useCartStore();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleQuantityChange = (productId: string, selectedSize: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(productId, selectedSize);
    } else {
      updateQuantity(productId, selectedSize, newQuantity);
    }
  };

  const handleWhatsAppCheckout = () => {
    if (items.length === 0) return;

    setIsCheckingOut(true);

    // Generate comprehensive WhatsApp message
    let message = `Halo! Saya ingin memesan produk berikut:\n\n`;
    
    items.forEach((item, index) => {
      message += `${index + 1}. ${item.product.name}\n`;
      message += `   Brand: ${item.product.brand}\n`;
      message += `   Harga: ${formatPrice(item.product.price)}\n`;
      message += `   Ukuran: ${item.selectedSize}\n`;
      if (item.selectedColor) {
        message += `   Warna: ${item.selectedColor}\n`;
      }
      message += `   Jumlah: ${item.quantity}\n`;
      message += `   Subtotal: ${formatPrice(item.product.price * item.quantity)}\n\n`;
    });

    message += `Total Pesanan: ${formatPrice(getTotalPrice())}\n\n`;
    message += `Mohon konfirmasi ketersediaan dan total biaya termasuk ongkir. Terima kasih!`;

    openWhatsApp(message);
    
    setTimeout(() => {
      setIsCheckingOut(false);
    }, 1000);
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Keranjang Kosong</h1>
          <p className="text-muted-foreground mb-6">
            Belum ada produk di keranjang Anda. Yuk mulai belanja!
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Lanjut Belanja
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/"
          className="p-2 hover:bg-accent rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Keranjang Belanja</h1>
          <p className="text-muted-foreground mt-1">
            {items.length} produk di keranjang
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={`${item.product.id}-${item.selectedSize}`}
              className="bg-card border rounded-lg p-4"
            >
              <div className="flex gap-4">
                <div className="relative w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={item.product.image}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm font-semibold text-primary">
                        {item.product.brand}
                      </p>
                      <h3 className="font-medium text-sm line-clamp-2">
                        {item.product.name}
                      </h3>
                    </div>
                    <button
                      onClick={() => removeItem(item.product.id, item.selectedSize)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-xs text-muted-foreground mb-2">
                    <span>Ukuran: {item.selectedSize}</span>
                    {item.selectedColor && (
                      <span className="ml-4">Warna: {item.selectedColor}</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          handleQuantityChange(
                            item.product.id,
                            item.selectedSize,
                            item.quantity - 1
                          )
                        }
                        className="p-1 border rounded hover:bg-accent transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          handleQuantityChange(
                            item.product.id,
                            item.selectedSize,
                            item.quantity + 1
                          )
                        }
                        className="p-1 border rounded hover:bg-accent transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right">
                      <div className="font-bold">
                        {formatPrice(item.product.price * item.quantity)}
                      </div>
                      {item.quantity > 1 && (
                        <div className="text-xs text-muted-foreground">
                          {formatPrice(item.product.price)} × {item.quantity}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-between items-center pt-4">
            <button
              onClick={clearCart}
              className="text-sm text-red-600 hover:text-red-700 underline"
            >
              Hapus Semua
            </button>
            <Link
              href="/"
              className="text-sm text-primary hover:text-primary/80 underline"
            >
              Lanjut Belanja
            </Link>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-card border rounded-lg p-6 sticky top-6">
            <h2 className="text-lg font-semibold mb-4">Ringkasan Pesanan</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span>Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)} item)</span>
                <span>{formatPrice(getTotalPrice())}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Ongkos Kirim</span>
                <span className="text-muted-foreground">Akan dihitung</span>
              </div>
              <hr />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-lg">{formatPrice(getTotalPrice())}</span>
              </div>
            </div>

            <button
              onClick={handleWhatsAppCheckout}
              disabled={isCheckingOut}
              className="w-full bg-[#25D366] hover:bg-[#20BA5A] disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              {isCheckingOut ? 'Memproses...' : 'Checkout via WhatsApp'}
            </button>

            <p className="text-xs text-muted-foreground text-center mt-3">
              Anda akan diarahkan ke WhatsApp untuk menyelesaikan pesanan
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}