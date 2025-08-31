'use client';

import { MessageCircle } from 'lucide-react';
import { useState } from 'react';

interface FloatingWhatsAppProps {
  phoneNumber?: string;
  message?: string;
}

export default function FloatingWhatsApp({ 
  phoneNumber = "6281278262893", // Default Indonesian number format
  message
}: FloatingWhatsAppProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const defaultMessage = message || "Halo! Saya tertarik dengan produk Anda. Bisakah Anda membantu saya?";

  const handleWhatsAppClick = () => {
    const encodedMessage = encodeURIComponent(defaultMessage);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      {/* Floating WhatsApp Button */}
      <button
        onClick={handleWhatsAppClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          fixed bottom-6 right-6 z-50
          w-14 h-14 md:w-16 md:h-16
          transition-all duration-300 ease-in-out
          transform hover:scale-110
          focus:outline-none
          active:scale-95
          animate-float
        `}
        aria-label="Hubungi via WhatsApp"
        title="Chat dengan kami"
      >
        {/* WhatsApp Image */}
        <img 
          src="https://eldhtxtnwdanyavkikap.supabase.co/storage/v1/object/sign/material/whatsapp%20logo.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV85NmM4ZmI1NS0xODg0LTRkNjgtYTlhMS1kNWFlYjVjMTcyZjUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJtYXRlcmlhbC93aGF0c2FwcCBsb2dvLnBuZyIsImlhdCI6MTc1NDU4MTU2MSwiZXhwIjoxNzg2MTE3NTYxfQ.uJZNaCvLagEJMj9FqWJnLpW8pNtXjoS8lAyQC06OhCM"
          alt="WhatsApp Logo"
          className="w-14 h-14 md:w-16 md:h-16 object-contain"
        />
      </button>

      {/* Optional Tooltip/Label */}
      <div
        className={`
          fixed bottom-6 right-20 md:right-24 z-40
          bg-gray-800 text-white text-sm
          px-3 py-2 rounded-lg
          shadow-lg
          transition-all duration-300 ease-in-out
          pointer-events-none
          ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'}
        `}
      >
        Chat dengan kami
        {/* Tooltip Arrow */}
        <div className="absolute top-1/2 -right-1 transform -translate-y-1/2 w-2 h-2 bg-gray-800 rotate-45" />
      </div>
    </>
  );
}