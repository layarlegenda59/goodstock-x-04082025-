# Setup Fitur Harga Diskon - Goodstock-X

## 📋 Overview
Fitur ini memungkinkan admin untuk:
- Memasukkan **Harga Asal** produk
- Memasukkan **Persentase Diskon**
- **Harga Setelah Diskon** akan dihitung otomatis secara real-time

## 🗄️ Database Setup

### Langkah 1: Jalankan Script SQL
1. Buka [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project Goodstock-X Anda
3. Klik **SQL Editor** di sidebar kiri
4. Buka file `supabase_sql_editor_script.sql` dari project ini
5. Copy semua isi file tersebut
6. Paste ke SQL Editor di Supabase
7. Klik tombol **Run** untuk menjalankan script

### Langkah 2: Verifikasi Database
Setelah menjalankan script, pastikan:
- Kolom `originalPrice` sudah ditambahkan ke tabel `products`
- Data existing products sudah memiliki nilai `originalPrice`

## 🎯 Cara Kerja Fitur

### Formula Perhitungan
```
Harga Setelah Diskon = Harga Asal - (Harga Asal × Diskon/100)
```

### Contoh Perhitungan
- **Harga Asal**: Rp 500.000
- **Diskon**: 20%
- **Harga Setelah Diskon**: Rp 400.000

### Auto-Calculate Logic
- Perhitungan terjadi secara **real-time**
- Tidak perlu klik tombol atau submit form
- Hasil otomatis dibulatkan ke angka terdekat

## 📱 UI/UX Features

### Form Add Product (`/admin/products/add`)
- Grid layout 4 kolom untuk pricing section
- Field "Origin Price (IDR)" - input manual
- Field "Diskon (%)" - input manual
- Field "Price after Discount (IDR)" - calculated otomatis

### Form Edit Product (`/admin/products/edit/[id]`)
- Layout dan fitur sama dengan form add
- Data existing akan ter-load dengan benar
- Auto-calculate tetap berfungsi saat edit

## 🔧 Technical Implementation

### Frontend Changes
- **React Hook Form** dengan Zod validation
- **useEffect** untuk real-time calculation
- **form.watch()** untuk monitoring field changes
- **form.setValue()** untuk update calculated field

### Database Schema
```sql
products {
  id: uuid
  name: text
  originalPrice: numeric  -- NEW COLUMN
  price: numeric          -- Calculated price after discount
  discount: numeric       -- Discount percentage
  ...
}
```

## 🚀 Deployment Checklist

- [ ] Jalankan script SQL di Supabase
- [ ] Verifikasi kolom `originalPrice` sudah ada
- [ ] Test form add product
- [ ] Test form edit product
- [ ] Test auto-calculate functionality
- [ ] Verify existing products data

## 🐛 Troubleshooting

### Jika Auto-Calculate Tidak Berfungsi
1. Check browser console untuk error JavaScript
2. Pastikan `useEffect` dan `form.watch` sudah diimport
3. Verify field names sesuai dengan schema

### Jika Database Error
1. Pastikan script SQL sudah dijalankan dengan benar
2. Check apakah kolom `originalPrice` sudah ada
3. Verify data type kolom adalah `NUMERIC`

### Jika Form Validation Error
1. Check Zod schema sudah include `originalPrice`
2. Verify default values sudah diset
3. Pastikan form reset logic sudah diupdate

## 📞 Support
Jika ada masalah dengan setup ini, check:
1. Terminal logs untuk error messages
2. Browser console untuk JavaScript errors
3. Supabase logs untuk database errors

---
**Status**: ✅ Ready for Production
**Last Updated**: January 2025