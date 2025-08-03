# Orders System Setup Guide

Panduan untuk mengatur sistem orders/transaksi real di Goodstock-X.

## 📋 Overview

Sistem orders terdiri dari:
- **Tabel `orders`**: Menyimpan informasi utama pesanan
- **Tabel `order_items`**: Menyimpan detail item dalam setiap pesanan
- **Halaman Riwayat Pesanan**: Menampilkan data real dari database

## 🗄️ Database Schema

### Tabel Orders
```sql
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id),
  order_number text UNIQUE NOT NULL,
  status text CHECK (status IN ('processing', 'shipped', 'delivered', 'cancelled')),
  total_amount numeric NOT NULL,
  shipping_address text,
  phone text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### Tabel Order Items
```sql
CREATE TABLE order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id),
  product_id uuid REFERENCES products(id),
  product_name text NOT NULL,
  product_brand text NOT NULL,
  product_price numeric NOT NULL,
  selected_size text,
  selected_color text,
  quantity integer NOT NULL,
  subtotal numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);
```

## 🚀 Setup Instructions

### 1. Jalankan Migration

Buka Supabase SQL Editor dan jalankan file migration:

```sql
-- Copy dan paste isi file: supabase/migrations/create_orders_table.sql
```

### 2. Tambahkan Sample Data

Untuk testing, jalankan sample data:

```sql
-- Copy dan paste isi file: insert_sample_orders.sql
```

### 3. Verifikasi Setup

Cek apakah tabel sudah dibuat:

```sql
-- Cek struktur tabel
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('orders', 'order_items')
ORDER BY table_name, ordinal_position;

-- Cek sample data
SELECT 
  o.order_number,
  o.status,
  o.total_amount,
  COUNT(oi.id) as item_count
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, o.order_number, o.status, o.total_amount
ORDER BY o.created_at DESC;
```

## 🔐 Security (RLS Policies)

Sistem menggunakan Row Level Security:

- **Users**: Hanya bisa melihat pesanan mereka sendiri
- **Admins**: Bisa melihat semua pesanan
- **Insert/Update**: Users hanya bisa membuat/update pesanan mereka sendiri

## 📱 Frontend Integration

Halaman Riwayat Pesanan (`/app/akun/pesanan/page.tsx`) sudah diupdate untuk:

- ✅ Fetch data real dari Supabase
- ✅ Menampilkan loading state
- ✅ Error handling dengan toast notifications
- ✅ Menampilkan detail lengkap pesanan:
  - Order number
  - Status dengan badge berwarna
  - Tanggal pemesanan
  - Alamat pengiriman
  - Detail produk (nama, brand, size, color, quantity)
  - Harga per item dan subtotal
  - Total amount
  - Catatan pesanan

## 🎯 Features

### Status Pesanan
- `processing`: Sedang diproses
- `shipped`: Sudah dikirim
- `delivered`: Sudah diterima
- `cancelled`: Dibatalkan

### Order Number Generation
Otomatis generate dengan format: `ORD-YYYYMMDD-XXX`
Contoh: `ORD-20240125-001`

### Auto Timestamps
- `created_at`: Otomatis saat insert
- `updated_at`: Otomatis update saat ada perubahan

## 🔧 Troubleshooting

### Jika halaman pesanan kosong:
1. Pastikan user sudah login
2. Cek apakah ada data orders untuk user tersebut
3. Cek console browser untuk error messages

### Jika error "table doesn't exist":
1. Pastikan migration sudah dijalankan di Supabase
2. Refresh schema di Supabase dashboard

### Jika error permission:
1. Cek RLS policies sudah aktif
2. Pastikan user memiliki profile di tabel `profiles`

## 📝 Next Steps

Untuk development selanjutnya:

1. **Admin Dashboard**: Tambah halaman untuk manage orders
2. **Order Detail Page**: Halaman detail pesanan
3. **Order Status Update**: Fitur update status pesanan
4. **Order Creation**: Integrasi dengan checkout process
5. **Email Notifications**: Notifikasi email saat status berubah
6. **Order Tracking**: Sistem tracking pengiriman

## 🎉 Testing

Setelah setup:

1. Login ke aplikasi
2. Buka halaman "Riwayat Pesanan" dari menu akun
3. Verifikasi data sample orders muncul
4. Cek detail pesanan ditampilkan dengan benar

---

**Note**: Pastikan untuk backup database sebelum menjalankan migration di production!