# Setup Bucket Hero-Slides di Supabase

Panduan ini menjelaskan cara membuat dan mengkonfigurasi bucket `hero-slides` di Supabase Storage untuk menyimpan gambar-gambar hero slide.

## 📋 Persyaratan

- Akses ke Supabase Dashboard
- Role admin di aplikasi
- Bucket akan dibuat dengan nama `hero_slides` (ID) dan `hero-slides` (display name)

## 🚀 Langkah Setup

### 1. Jalankan SQL Script

1. Buka **Supabase Dashboard** → **SQL Editor**
2. Copy script dari file `database/setup-hero-slides-bucket.sql`
3. Paste dan jalankan script tersebut
4. Pastikan tidak ada error yang muncul

### 2. Verifikasi Setup

Jalankan script verifikasi:

```bash
node setup-hero-slides-bucket.js
```

Script ini akan:
- ✅ Memeriksa apakah bucket sudah dibuat
- ✅ Menguji akses bucket
- ✅ Menguji fungsi upload
- ✅ Membersihkan file test

## 📁 Struktur Bucket

```
hero_slides/
├── hero-slide-1234567890.jpg
├── hero-slide-1234567891.png
└── hero-slide-1234567892.webp
```

## 🔐 Kebijakan Akses

Bucket dikonfigurasi dengan kebijakan berikut:

### ✅ **Public Read Access**
- Semua orang dapat melihat/download gambar
- Policy: `hero_slides_public_read`

### ✅ **Authenticated Upload**
- Hanya user yang terautentikasi yang dapat upload
- Prioritas untuk admin user
- Policy: `hero_slides_authenticated_upload`

### ✅ **Authenticated Update**
- Hanya user yang terautentikasi yang dapat update
- Prioritas untuk admin user
- Policy: `hero_slides_authenticated_update`

### ❌ **No Delete Access**
- Tidak ada policy untuk delete
- Hanya superuser yang dapat menghapus file
- Sesuai dengan permintaan untuk keamanan data

## 🛠️ Konfigurasi Teknis

- **Bucket ID**: `hero_slides`
- **Bucket Name**: `hero-slides`
- **Public Access**: `true`
- **File Size Limit**: `10MB`
- **Allowed MIME Types**: 
  - `image/jpeg`
  - `image/jpg`
  - `image/png`
  - `image/webp`

## 🔧 Integrasi dengan Aplikasi

Setelah bucket dibuat, aplikasi akan otomatis:

1. **Upload gambar** ke bucket `hero_slides`
2. **Generate public URL** untuk akses gambar
3. **Fallback ke base64** jika upload gagal
4. **Display gambar** dengan error handling

## 🐛 Troubleshooting

### Bucket Not Found
```
❌ Error: Bucket not found
```
**Solusi**: Pastikan SQL script sudah dijalankan di Supabase Dashboard

### Upload Permission Denied
```
❌ Error: new row violates row-level security policy
```
**Solusi**: 
1. Pastikan user sudah login sebagai admin
2. Periksa tabel `profiles` memiliki role `admin`
3. Verifikasi RLS policies sudah dibuat

### Public URL Not Accessible
```
❌ Error: 400 Bad Request
```
**Solusi**:
1. Pastikan bucket dibuat dengan `public = true`
2. Verifikasi public read policy sudah aktif
3. Cek konfigurasi Supabase project

## 📝 File yang Terkait

- `database/setup-hero-slides-bucket.sql` - SQL script untuk setup
- `setup-hero-slides-bucket.js` - Script verifikasi
- `components/admin/HeroSlideManager.tsx` - Komponen yang menggunakan bucket

## ✅ Checklist Setup

- [ ] SQL script dijalankan di Supabase Dashboard
- [ ] Bucket `hero_slides` berhasil dibuat
- [ ] Policies berhasil dibuat (3 policies)
- [ ] Test upload berhasil
- [ ] Aplikasi dapat upload dan display gambar
- [ ] Error handling berfungsi dengan baik

---

**Catatan**: Setelah setup selesai, aplikasi akan menggunakan bucket `hero_slides` untuk semua operasi gambar hero slide, dengan fallback ke base64 jika terjadi masalah dengan Supabase Storage.