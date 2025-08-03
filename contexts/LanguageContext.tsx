'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'id' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  id: {
    // Header
    'header.search': 'Cari produk...',
    'header.account': 'Akun Saya',
    'header.orderHistory': 'Riwayat Pesanan',
    'header.logout': 'Keluar',
    'header.login': 'Masuk',
    'header.register': 'Daftar',
    'header.loginRegister': 'Masuk / Daftar',
    
    // Settings Page
    'settings.title': 'Pengaturan',
    'settings.appearance': 'Tampilan',
    'settings.appearanceDesc': 'Sesuaikan tampilan aplikasi sesuai preferensi Anda',
    'settings.darkMode': 'Mode Gelap',
    'settings.darkModeDesc': 'Aktifkan mode gelap untuk pengalaman yang lebih nyaman di mata',
    'settings.notifications': 'Notifikasi',
    'settings.notificationsDesc': 'Kelola preferensi notifikasi Anda',
    'settings.pushNotifications': 'Notifikasi Push',
    'settings.pushNotificationsDesc': 'Terima notifikasi tentang pesanan dan promo',
    'settings.emailUpdates': 'Update Email',
    'settings.emailUpdatesDesc': 'Terima update produk dan penawaran via email',
    'settings.security': 'Keamanan',
    'settings.securityDesc': 'Pengaturan keamanan akun Anda',
    'settings.twoFactor': 'Autentikasi Dua Faktor',
    'settings.twoFactorDesc': 'Tambahkan lapisan keamanan ekstra untuk akun Anda',
    'settings.changePassword': 'Ubah Password',
    'settings.languageRegion': 'Bahasa & Wilayah',
    'settings.languageRegionDesc': 'Pengaturan bahasa dan lokasi',
    'settings.language': 'Bahasa',
    'settings.currency': 'Mata Uang',
    'settings.saveSettings': 'Simpan Pengaturan',
    'settings.saving': 'Menyimpan...',
    'settings.back': 'Kembali',
    'settings.saveSuccess': 'Pengaturan berhasil disimpan!',
    'settings.saveError': 'Gagal menyimpan pengaturan. Silakan coba lagi.',
    
    // Account Page
    'account.title': 'Akun Saya',
    'account.profile': 'Profil Saya',
    'account.orderHistory': 'Riwayat Pesanan',
    'account.wishlist': 'Wishlist',
    'account.settings': 'Pengaturan',
    'account.help': 'Bantuan',
    
    // Home Page
    'home.categories': 'Kategori',
    'home.newProducts': 'Produk Terbaru',
    'home.promoProducts': 'Produk Promo',
    'home.viewAll': 'Lihat Semua',
    
    // Product
    'product.addToCart': 'Tambah ke Keranjang',
    'product.buyNow': 'Beli Sekarang',
    'product.size': 'Ukuran',
    'product.color': 'Warna',
    'product.description': 'Deskripsi',
    'product.reviews': 'Ulasan',
    'product.relatedProducts': 'Produk Terkait',
    
    // Cart
    'cart.title': 'Keranjang Belanja',
    'cart.empty': 'Keranjang kosong',
    'cart.emptyDesc': 'Belum ada produk di keranjang Anda',
    'cart.continueShopping': 'Lanjut Belanja',
    'cart.checkout': 'Checkout',
    'cart.total': 'Total',
    'cart.subtotal': 'Subtotal',
    'cart.shipping': 'Ongkos Kirim',
    'cart.quantity': 'Jumlah',
    'cart.addToCart': 'Tambah ke Keranjang',
    'cart.emptyCart': 'Keranjang Kosong',
    'cart.emptyCartMessage': 'Belum ada produk yang ditambahkan ke keranjang Anda',
    'cart.shoppingCart': 'Keranjang Belanja',
    'cart.productsInCart': 'produk dalam keranjang',
    'cart.size': 'Ukuran',
    'cart.color': 'Warna',
    'cart.clearAll': 'Hapus Semua',
    'cart.orderSummary': 'Ringkasan Pesanan',
    'cart.items': 'item',
    'cart.toBeCalculated': 'Akan dihitung',
    'cart.processing': 'Memproses...',
    'cart.checkoutWhatsApp': 'Checkout via WhatsApp',
    'cart.whatsappRedirect': 'Anda akan diarahkan ke WhatsApp untuk menyelesaikan pesanan',
    'cart.whatsappGreeting': 'Halo Goodstock-X, saya ingin memesan produk berikut:',
    'cart.orderTotal': 'TOTAL PESANAN',
    'cart.confirmationRequest': 'Mohon konfirmasi ketersediaan dan total pembayaran. Terima kasih!',
    
    // Auth
    'auth.login': 'Masuk',
    'auth.register': 'Daftar',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Konfirmasi Password',
    'auth.fullName': 'Nama Lengkap',
    'auth.phone': 'Nomor Telepon',
    'auth.forgotPassword': 'Lupa password?',
    'auth.noAccount': 'Belum punya akun?',
    'auth.hasAccount': 'Sudah punya akun?',
    'auth.registerNow': 'Daftar sekarang',
    'auth.loginNow': 'Masuk sekarang',
    
    // Categories
    'category.shoes': 'Sepatu',
    'category.bags': 'Tas',
    'category.clothing': 'Pakaian',
    'category.men': 'Pria',
    'category.women': 'Wanita',
    'category.unisex': 'Unisex',
    'categories.allCategories': 'Semua Kategori',
    'categories.allProducts': 'Semua Produk',
    'categories.productsFound': 'produk ditemukan',
    'categories.newest': 'Terbaru',
    'categories.priceLow': 'Harga Terendah',
    'categories.priceHigh': 'Harga Tertinggi',
    'categories.biggestDiscount': 'Diskon Terbesar',
    'categories.noProductsFound': 'Tidak ada produk ditemukan',
    'categories.adjustFilters': 'Coba sesuaikan filter atau kata kunci pencarian Anda',
    
    // Common
    'common.search': 'Cari',
    'common.filter': 'Filter',
    'common.sort': 'Urutkan',
    'common.price': 'Harga',
    'common.brand': 'Merek',
    'common.loading': 'Memuat...',
    'common.error': 'Terjadi kesalahan',
    'common.retry': 'Coba Lagi',
    'common.save': 'Simpan',
    'common.cancel': 'Batal',
    'common.delete': 'Hapus',
    'common.edit': 'Edit',
    'common.view': 'Lihat',
    'common.close': 'Tutup',
    'common.next': 'Selanjutnya',
    'common.previous': 'Sebelumnya',
    'common.yes': 'Ya',
    'common.no': 'Tidak',
    
    // Search
    'search.searchResults': 'Hasil Pencarian',
    'search.relevance': 'Relevansi',
    'search.nameAZ': 'Nama A-Z',
    'search.noResults': 'Tidak ada hasil ditemukan',
    'search.noResultsMessage': 'Tidak ada produk yang cocok dengan pencarian',
    'search.suggestions': 'Saran',
    'search.checkSpelling': 'Periksa ejaan kata kunci',
    'search.useGeneral': 'Gunakan kata kunci yang lebih umum',
    'search.tryDifferent': 'Coba kata kunci yang berbeda',
    'search.reduceFilters': 'Kurangi jumlah filter yang diterapkan',
    
    // Filter
    'filter.categories': 'Kategori',
    'filter.sizes': 'Ukuran',
    'filter.shoesEU': 'Sepatu (EU)',
    'filter.clothing': 'Pakaian',
    'filter.gender': 'Gender',
    'filter.brand': 'Brand',
    'filter.allBrands': 'Semua Brand',
    'filter.priceRange': 'Rentang Harga',
    'filter.activePromo': 'Promo Aktif',
    'filter.reset': 'Reset',
    'filter.applyFilter': 'Terapkan Filter',
    
    // Authentication
    'auth.loginTitle': 'Masuk ke Akun',
    'auth.loginDescription': 'Masuk untuk mengakses akun Goodstock-X Anda',
    'auth.registerTitle': 'Daftar Akun Baru',
    'auth.registerDescription': 'Buat akun Goodstock-X untuk pengalaman belanja yang lebih baik',
    'auth.email': 'Email',
    'auth.emailPlaceholder': 'nama@email.com',
    'auth.password': 'Password',
    'auth.passwordPlaceholder': 'Masukkan password',
    'auth.passwordMinPlaceholder': 'Minimal 6 karakter',
    'auth.confirmPassword': 'Konfirmasi Password',
    'auth.confirmPasswordPlaceholder': 'Ulangi password',
    'auth.fullName': 'Nama Lengkap',
    'auth.fullNamePlaceholder': 'Masukkan nama lengkap',
    'auth.phone': 'Nomor Telepon',
    'auth.phonePlaceholder': '08xxxxxxxxxx',
    'auth.login': 'Masuk',
    'auth.loggingIn': 'Masuk...',
    'auth.register': 'Daftar',
    'auth.registering': 'Mendaftar...',
    'auth.forgotPassword': 'Lupa password?',
    'auth.noAccount': 'Belum punya akun?',
    'auth.registerNow': 'Daftar sekarang',
    'auth.haveAccount': 'Sudah punya akun?',
    'auth.loginHere': 'Masuk di sini',
    'auth.loginSuccess': 'Login berhasil!',
    'auth.registerSuccess': 'Registrasi berhasil! Silakan cek email untuk verifikasi.',
    'auth.registerSuccessTitle': 'Registrasi Berhasil!',
    'auth.registerSuccessMessage': 'Akun Anda telah berhasil dibuat. Silakan cek email untuk verifikasi akun.',
    'auth.passwordMismatch': 'Password dan konfirmasi password tidak cocok',
    'auth.passwordMinLength': 'Password minimal 6 karakter',
    'auth.unexpectedError': 'Terjadi kesalahan yang tidak terduga',
    
    // Help
    'help.title': 'Bantuan',
    'help.faqTitle': 'Pertanyaan yang Sering Diajukan (FAQ)',
    'help.needMoreHelp': 'Masih butuh bantuan?',
    'help.customerServiceDesc': 'Tim customer service kami siap membantu Anda 24/7',
    'help.contactCustomerService': 'Hubungi Customer Service',
    'help.contact.liveChat': 'Live Chat',
    'help.contact.liveChatDesc': 'Chat langsung dengan customer service',
    'help.contact.startChat': 'Mulai Chat',
    'help.contact.phone': 'Telepon',
    'help.contact.call': 'Hubungi',
    'help.contact.phoneHours': 'Sen-Jum 09:00-17:00',
    'help.contact.email': 'Email',
    'help.contact.sendEmail': 'Kirim Email',
    'help.contact.emailResponse': 'Respon dalam 24 jam',
    'help.faq.orderQuestion': 'Bagaimana cara melakukan pemesanan?',
    'help.faq.orderAnswer': 'Anda dapat melakukan pemesanan dengan memilih produk yang diinginkan, menambahkannya ke keranjang, lalu melanjutkan ke proses checkout. Pastikan Anda sudah login ke akun Anda.',
    'help.faq.paymentQuestion': 'Metode pembayaran apa saja yang tersedia?',
    'help.faq.paymentAnswer': 'Kami menerima berbagai metode pembayaran termasuk transfer bank, e-wallet (GoPay, OVO, DANA), dan kartu kredit/debit.',
    'help.faq.shippingQuestion': 'Berapa lama waktu pengiriman?',
    'help.faq.shippingAnswer': 'Waktu pengiriman bervariasi tergantung lokasi. Untuk area Jakarta dan sekitarnya 1-2 hari kerja, untuk luar Jakarta 2-5 hari kerja.',
    'help.faq.trackingQuestion': 'Bagaimana cara melacak pesanan saya?',
    'help.faq.trackingAnswer': 'Anda dapat melacak pesanan melalui halaman "Riwayat Pesanan" di akun Anda. Nomor resi akan dikirimkan via email setelah barang dikirim.',
    'help.faq.returnQuestion': 'Apakah bisa melakukan retur atau tukar barang?',
    'help.faq.returnAnswer': 'Ya, kami menerima retur dalam 7 hari setelah barang diterima dengan kondisi barang masih baru dan tidak rusak. Hubungi customer service untuk proses retur.',
    'help.faq.cancelQuestion': 'Bagaimana cara mengubah atau membatalkan pesanan?',
    'help.faq.cancelAnswer': 'Pesanan hanya dapat diubah atau dibatalkan sebelum status berubah menjadi "Dikirim". Hubungi customer service segera untuk bantuan.',
    
    // Orders
    'orders.title': 'Riwayat Pesanan',
    'orders.noOrders': 'Belum Ada Pesanan',
    'orders.noOrdersMessage': 'Anda belum memiliki riwayat pesanan. Mulai berbelanja sekarang!',
    'orders.startShopping': 'Mulai Belanja',
    'orders.orderNumber': 'Pesanan #{{id}}',
    'orders.quantity': 'Qty',
    'orders.total': 'Total',
    'orders.viewDetails': 'Lihat Detail',
    'orders.buyAgain': 'Beli Lagi',
    'orders.status.delivered': 'Terkirim',
    'orders.status.shipped': 'Dikirim',
    'orders.status.processing': 'Diproses',
    'orders.status.cancelled': 'Dibatalkan',
    
    // Admin
    'admin.dashboard.title': 'Dashboard Admin',
    'admin.dashboard.addProduct': 'Tambah Produk',
    'admin.dashboard.totalProducts': 'Total Produk',
    'admin.dashboard.activeProducts': 'Produk aktif dalam katalog',
    'admin.dashboard.promoProducts': 'Produk Promo',
    'admin.dashboard.activePromoProducts': 'Produk dengan promo aktif',
    'admin.dashboard.conversionRate': 'Tingkat Konversi',
    'admin.dashboard.conversionChange': '+2.1% dari bulan lalu',
    'admin.dashboard.recentProducts': 'Produk Terbaru',
    'admin.dashboard.recentProductsDescription': '5 produk terakhir yang ditambahkan ke katalog',
    'admin.dashboard.noProducts': 'Belum ada produk.',
    'admin.dashboard.addFirstProduct': 'Tambah produk pertama',
    'admin.dashboard.promo': 'Promo',
    'admin.dashboard.quickActions': 'Aksi Cepat',
    'admin.dashboard.manageProducts': 'Kelola Produk',
    'admin.dashboard.addNewProduct': 'Tambah Produk Baru',
    'admin.dashboard.managePromos': 'Kelola Promo',
    'admin.dashboard.systemStatus': 'Status Sistem',
    'admin.dashboard.database': 'Database',
    'admin.dashboard.connected': 'Terhubung',
    'admin.dashboard.storage': 'Storage',
    'admin.dashboard.active': 'Aktif',
    'admin.dashboard.authentication': 'Autentikasi',
    'admin.dashboard.secure': 'Aman',
    
    // WhatsApp
    'whatsapp.defaultMessage': 'Halo Goodstock-X! Saya ingin bertanya tentang produk Anda.',
    'whatsapp.contactLabel': 'Hubungi kami di WhatsApp',
    'whatsapp.chatTitle': 'Chat dengan kami di WhatsApp',
    'whatsapp.chatWithUs': 'Chat dengan kami'
  },
  en: {
    // Header
    'header.search': 'Search products...',
    'header.account': 'My Account',
    'header.orderHistory': 'Order History',
    'header.logout': 'Logout',
    'header.login': 'Login',
    'header.register': 'Register',
    'header.loginRegister': 'Login / Register',
    
    // Settings Page
    'settings.title': 'Settings',
    'settings.appearance': 'Appearance',
    'settings.appearanceDesc': 'Customize the app appearance according to your preferences',
    'settings.darkMode': 'Dark Mode',
    'settings.darkModeDesc': 'Enable dark mode for a more comfortable viewing experience',
    'settings.notifications': 'Notifications',
    'settings.notificationsDesc': 'Manage your notification preferences',
    'settings.pushNotifications': 'Push Notifications',
    'settings.pushNotificationsDesc': 'Receive notifications about orders and promotions',
    'settings.emailUpdates': 'Email Updates',
    'settings.emailUpdatesDesc': 'Receive product updates and offers via email',
    'settings.security': 'Security',
    'settings.securityDesc': 'Your account security settings',
    'settings.twoFactor': 'Two-Factor Authentication',
    'settings.twoFactorDesc': 'Add an extra layer of security to your account',
    'settings.changePassword': 'Change Password',
    'settings.languageRegion': 'Language & Region',
    'settings.languageRegionDesc': 'Language and location settings',
    'settings.language': 'Language',
    'settings.currency': 'Currency',
    'settings.saveSettings': 'Save Settings',
    'settings.saving': 'Saving...',
    'settings.back': 'Back',
    'settings.saveSuccess': 'Settings saved successfully!',
    'settings.saveError': 'Failed to save settings. Please try again.',
    
    // Account Page
    'account.title': 'My Account',
    'account.profile': 'My Profile',
    'account.orderHistory': 'Order History',
    'account.wishlist': 'Wishlist',
    'account.settings': 'Settings',
    'account.help': 'Help',
    
    // Home Page
    'home.categories': 'Categories',
    'home.newProducts': 'New Products',
    'home.promoProducts': 'Promo Products',
    'home.viewAll': 'View All',
    
    // Product
    'product.addToCart': 'Add to Cart',
    'product.buyNow': 'Buy Now',
    'product.size': 'Size',
    'product.color': 'Color',
    'product.description': 'Description',
    'product.reviews': 'Reviews',
    'product.relatedProducts': 'Related Products',
    
    // Cart
    'cart.title': 'Shopping Cart',
    'cart.empty': 'Cart is empty',
    'cart.emptyDesc': 'No products in your cart yet',
    'cart.continueShopping': 'Continue Shopping',
    'cart.checkout': 'Checkout',
    'cart.total': 'Total',
    'cart.subtotal': 'Subtotal',
    'cart.shipping': 'Shipping',
    'cart.quantity': 'Quantity',
    'cart.addToCart': 'Add to Cart',
    'cart.emptyCart': 'Empty Cart',
    'cart.emptyCartMessage': 'No products have been added to your cart yet',
    'cart.shoppingCart': 'Shopping Cart',
    'cart.productsInCart': 'products in cart',
    'cart.size': 'Size',
    'cart.color': 'Color',
    'cart.clearAll': 'Clear All',
    'cart.orderSummary': 'Order Summary',
    'cart.items': 'items',
    'cart.toBeCalculated': 'To be calculated',
    'cart.processing': 'Processing...',
    'cart.checkoutWhatsApp': 'Checkout via WhatsApp',
    'cart.whatsappRedirect': 'You will be redirected to WhatsApp to complete your order',
    'cart.whatsappGreeting': 'Hello Goodstock-X, I would like to order the following products:',
    'cart.orderTotal': 'ORDER TOTAL',
    'cart.confirmationRequest': 'Please confirm availability and total payment. Thank you!',
    
    // Auth
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.fullName': 'Full Name',
    'auth.phone': 'Phone Number',
    'auth.forgotPassword': 'Forgot password?',
    'auth.noAccount': "Don't have an account?",
    'auth.hasAccount': 'Already have an account?',
    'auth.registerNow': 'Register now',
    'auth.loginNow': 'Login now',
    
    // Categories
    'category.shoes': 'Shoes',
    'category.bags': 'Bags',
    'category.clothing': 'Clothing',
    'category.men': 'Men',
    'category.women': 'Women',
    'category.unisex': 'Unisex',
    'categories.allCategories': 'All Categories',
    'categories.allProducts': 'All Products',
    'categories.productsFound': 'products found',
    'categories.newest': 'Newest',
    'categories.priceLow': 'Lowest Price',
    'categories.priceHigh': 'Highest Price',
    'categories.biggestDiscount': 'Biggest Discount',
    'categories.noProductsFound': 'No products found',
    'categories.adjustFilters': 'Try adjusting your filters or search keywords',
    
    // Common
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.sort': 'Sort',
    'common.price': 'Price',
    'common.brand': 'Brand',
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.retry': 'Try Again',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.close': 'Close',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.yes': 'Yes',
    'common.no': 'No',
    
    // Search
    'search.searchResults': 'Search Results',
    'search.relevance': 'Relevance',
    'search.nameAZ': 'Name A-Z',
    'search.noResults': 'No results found',
    'search.noResultsMessage': 'No products match your search for',
    'search.suggestions': 'Suggestions',
    'search.checkSpelling': 'Check your spelling',
    'search.useGeneral': 'Use more general keywords',
    'search.tryDifferent': 'Try different keywords',
    'search.reduceFilters': 'Reduce the number of applied filters',
    
    // Filter
    'filter.categories': 'Categories',
    'filter.sizes': 'Sizes',
    'filter.shoesEU': 'Shoes (EU)',
    'filter.clothing': 'Clothing',
    'filter.gender': 'Gender',
    'filter.brand': 'Brand',
    'filter.allBrands': 'All Brands',
    'filter.priceRange': 'Price Range',
    'filter.activePromo': 'Active Promo',
    'filter.reset': 'Reset',
    'filter.applyFilter': 'Apply Filter',
    
    // Authentication
    'auth.loginTitle': 'Login to Account',
    'auth.loginDescription': 'Login to access your Goodstock-X account',
    'auth.registerTitle': 'Create New Account',
    'auth.registerDescription': 'Create a Goodstock-X account for a better shopping experience',
    'auth.email': 'Email',
    'auth.emailPlaceholder': 'name@email.com',
    'auth.password': 'Password',
    'auth.passwordPlaceholder': 'Enter password',
    'auth.passwordMinPlaceholder': 'Minimum 6 characters',
    'auth.confirmPassword': 'Confirm Password',
    'auth.confirmPasswordPlaceholder': 'Repeat password',
    'auth.fullName': 'Full Name',
    'auth.fullNamePlaceholder': 'Enter full name',
    'auth.phone': 'Phone Number',
    'auth.phonePlaceholder': '08xxxxxxxxxx',
    'auth.login': 'Login',
    'auth.loggingIn': 'Logging in...',
    'auth.register': 'Register',
    'auth.registering': 'Registering...',
    'auth.forgotPassword': 'Forgot password?',
    'auth.noAccount': 'Don\'t have an account?',
    'auth.registerNow': 'Register now',
    'auth.haveAccount': 'Already have an account?',
    'auth.loginHere': 'Login here',
    'auth.loginSuccess': 'Login successful!',
    'auth.registerSuccess': 'Registration successful! Please check your email for verification.',
    'auth.registerSuccessTitle': 'Registration Successful!',
    'auth.registerSuccessMessage': 'Your account has been successfully created. Please check your email to verify your account.',
    'auth.passwordMismatch': 'Password and confirm password do not match',
    'auth.passwordMinLength': 'Password must be at least 6 characters',
    'auth.unexpectedError': 'An unexpected error occurred',
    
    // Help
    'help.title': 'Help',
    'help.faqTitle': 'Frequently Asked Questions (FAQ)',
    'help.needMoreHelp': 'Still need help?',
    'help.customerServiceDesc': 'Our customer service team is ready to help you 24/7',
    'help.contactCustomerService': 'Contact Customer Service',
    'help.contact.liveChat': 'Live Chat',
    'help.contact.liveChatDesc': 'Chat directly with customer service',
    'help.contact.startChat': 'Start Chat',
    'help.contact.phone': 'Phone',
    'help.contact.call': 'Call',
    'help.contact.phoneHours': 'Mon-Fri 09:00-17:00',
    'help.contact.email': 'Email',
    'help.contact.sendEmail': 'Send Email',
    'help.contact.emailResponse': 'Response within 24 hours',
    'help.faq.orderQuestion': 'How do I place an order?',
    'help.faq.orderAnswer': 'You can place an order by selecting the desired product, adding it to your cart, then proceeding to checkout. Make sure you are logged into your account.',
    'help.faq.paymentQuestion': 'What payment methods are available?',
    'help.faq.paymentAnswer': 'We accept various payment methods including bank transfer, e-wallet (GoPay, OVO, DANA), and credit/debit cards.',
    'help.faq.shippingQuestion': 'How long is the delivery time?',
    'help.faq.shippingAnswer': 'Delivery time varies depending on location. For Jakarta and surrounding areas 1-2 working days, for outside Jakarta 2-5 working days.',
    'help.faq.trackingQuestion': 'How do I track my order?',
    'help.faq.trackingAnswer': 'You can track your order through the "Order History" page in your account. The tracking number will be sent via email after the item is shipped.',
    'help.faq.returnQuestion': 'Can I return or exchange items?',
    'help.faq.returnAnswer': 'Yes, we accept returns within 7 days after the item is received with the condition that the item is still new and not damaged. Contact customer service for the return process.',
    'help.faq.cancelQuestion': 'How do I change or cancel my order?',
    'help.faq.cancelAnswer': 'Orders can only be changed or canceled before the status changes to "Shipped". Contact customer service immediately for assistance.',
    
    // Orders
    'orders.title': 'Order History',
    'orders.noOrders': 'No Orders Yet',
    'orders.noOrdersMessage': 'You don\'t have any order history yet. Start shopping now!',
    'orders.startShopping': 'Start Shopping',
    'orders.orderNumber': 'Order #{{id}}',
    'orders.quantity': 'Qty',
    'orders.total': 'Total',
    'orders.viewDetails': 'View Details',
    'orders.buyAgain': 'Buy Again',
    'orders.status.delivered': 'Delivered',
    'orders.status.shipped': 'Shipped',
    'orders.status.processing': 'Processing',
    'orders.status.cancelled': 'Cancelled',
    
    // Admin
    'admin.dashboard.title': 'Admin Dashboard',
    'admin.dashboard.addProduct': 'Add Product',
    'admin.dashboard.totalProducts': 'Total Products',
    'admin.dashboard.activeProducts': 'Active products in catalog',
    'admin.dashboard.promoProducts': 'Promo Products',
    'admin.dashboard.activePromoProducts': 'Products with active promos',
    'admin.dashboard.conversionRate': 'Conversion Rate',
    'admin.dashboard.conversionChange': '+2.1% from last month',
    'admin.dashboard.recentProducts': 'Recent Products',
    'admin.dashboard.recentProductsDescription': 'Last 5 products added to catalog',
    'admin.dashboard.noProducts': 'No products yet.',
    'admin.dashboard.addFirstProduct': 'Add first product',
    'admin.dashboard.promo': 'Promo',
    'admin.dashboard.quickActions': 'Quick Actions',
    'admin.dashboard.manageProducts': 'Manage Products',
    'admin.dashboard.addNewProduct': 'Add New Product',
    'admin.dashboard.managePromos': 'Manage Promos',
    'admin.dashboard.systemStatus': 'System Status',
    'admin.dashboard.database': 'Database',
    'admin.dashboard.connected': 'Connected',
    'admin.dashboard.storage': 'Storage',
    'admin.dashboard.active': 'Active',
    'admin.dashboard.authentication': 'Authentication',
    'admin.dashboard.secure': 'Secure',
    
    // WhatsApp
    'whatsapp.defaultMessage': 'Hello Goodstock-X! I would like to ask about your products.',
    'whatsapp.contactLabel': 'Contact us on WhatsApp',
    'whatsapp.chatTitle': 'Chat with us on WhatsApp',
    'whatsapp.chatWithUs': 'Chat with us'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('id');

  useEffect(() => {
    // Load language from localStorage
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      if (settings.language) {
        setLanguageState(settings.language);
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    // Save to localStorage
    const savedSettings = localStorage.getItem('userSettings');
    const settings = savedSettings ? JSON.parse(savedSettings) : {};
    settings.language = lang;
    localStorage.setItem('userSettings', JSON.stringify(settings));
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}