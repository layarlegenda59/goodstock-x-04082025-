'use client';

import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { HelpCircle, MessageCircle, Phone, Mail, Clock, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';


export default function BantuanPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();


  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  const faqItems = [
    {
      question: 'Bagaimana cara memesan produk?',
      answer: 'Anda dapat memesan produk dengan memilih produk yang diinginkan, menambahkannya ke keranjang, dan melanjutkan ke checkout untuk menyelesaikan pembayaran.'
    },
    {
      question: 'Metode pembayaran apa saja yang tersedia?',
      answer: 'Kami menerima berbagai metode pembayaran termasuk transfer bank, kartu kredit, e-wallet, dan COD (Cash on Delivery) untuk area tertentu.'
    },
    {
      question: 'Berapa lama waktu pengiriman?',
      answer: 'Waktu pengiriman bervariasi tergantung lokasi. Untuk area Jakarta dan sekitarnya 1-2 hari kerja, untuk luar Jakarta 2-5 hari kerja.'
    },
    {
      question: 'Bagaimana cara melacak pesanan saya?',
      answer: 'Anda dapat melacak pesanan melalui halaman "Riwayat Pesanan" di akun Anda atau menggunakan nomor resi yang dikirimkan via email/SMS.'
    },
    {
      question: 'Bagaimana kebijakan pengembalian produk?',
      answer: 'Produk dapat dikembalikan dalam 7 hari setelah diterima dengan kondisi masih baru dan kemasan asli. Biaya return ditanggung pembeli kecuali ada kesalahan dari kami.'
    },
    {
      question: 'Bisakah saya membatalkan atau mengubah pesanan?',
      answer: 'Pesanan dapat dibatalkan atau diubah selama status masih "Diproses". Setelah dikirim, pesanan tidak dapat dibatalkan atau diubah.'
    }
  ];

  const contactMethods = [
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Chat langsung dengan tim customer service kami',
      action: 'Mulai Chat',
      available: '24/7'
    },
    {
      icon: Phone,
      title: 'Telepon',
      description: '+62 21 1234 5678',
      action: 'Hubungi Sekarang',
      available: 'Senin-Jumat 09:00-17:00'
    },
    {
      icon: Mail,
      title: 'Email',
      description: 'support@goodstock.com',
      action: 'Kirim Email',
      available: 'Respon dalam 24 jam'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/akun" className="text-muted-foreground hover:text-foreground">
          ← Kembali
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold">Bantuan</h1>
      </div>

      {/* Contact Methods */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {contactMethods.map((method, index) => {
          const IconComponent = method.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <IconComponent className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{method.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{method.description}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                      <Clock className="w-3 h-3" />
                      {method.available}
                    </div>
                    <Button size="sm" className="w-full">
                      {method.action}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            Pertanyaan yang Sering Diajukan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Additional Help */}
      <Card className="mt-6">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="font-semibold mb-2">Butuh Bantuan Lebih Lanjut?</h3>
            <p className="text-muted-foreground mb-4">
              Tim customer service kami siap membantu Anda 24/7
            </p>
            <Button>
              Hubungi Customer Service
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}