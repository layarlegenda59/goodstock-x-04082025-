'use client';

import { MessageCircle } from 'lucide-react';
import { useState } from 'react';

interface FloatingWhatsAppProps {
  phoneNumber?: string;
  message?: string;
}

export default function FloatingWhatsApp({ 
  phoneNumber = "6281234567890", // Default Indonesian number format
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
          bg-[#25D366] hover:bg-[#20BA5A]
          rounded-full
          flex items-center justify-center
          shadow-lg hover:shadow-xl
          transition-all duration-300 ease-in-out
          transform hover:scale-110
          focus:outline-none focus:ring-4 focus:ring-[#25D366]/30
          active:scale-95
          animate-float
        `}
        aria-label="Hubungi via WhatsApp"
        title="Chat dengan kami"
      >
        {/* WhatsApp Icon */}
        <MessageCircle 
          className="w-7 h-7 md:w-8 md:h-8 text-white" 
          fill="currentColor"
        />
        
        {/* Ripple Effect on Click */}
        <div className="absolute inset-0 rounded-full bg-white/20 scale-0 animate-ping opacity-0 pointer-events-none" />
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