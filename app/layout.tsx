import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import AuthProvider from '@/components/auth/AuthProvider';
import { LanguageProvider } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import CartSummary from '@/components/CartSummary';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Goodstock-X - Premium Fashion E-Commerce',
  description: 'Temukan koleksi sepatu, tas, dan pakaian premium terbaik di Goodstock-X',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
          storageKey="goodstock-theme"
        >
          <LanguageProvider>
            <AuthProvider>
              <div className="min-h-screen bg-background" suppressHydrationWarning>
                <Header />
                <main className="pb-20 md:pb-0">
                  {children}
                </main>
                <CartSummary />
                <BottomNav />
                <FloatingWhatsApp />
                <Toaster />
              </div>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}