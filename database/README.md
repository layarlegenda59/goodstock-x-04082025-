# Database Setup untuk Fitur Manajemen Gambar

File ini berisi instruksi untuk mengatur database yang diperlukan untuk fitur manajemen gambar di Dashboard Admin.

## 📋 Tabel yang Dibuat

### 1. `hero_slides`
Tabel untuk menyimpan data slide hero section:
- `id` - UUID primary key
- `title` - Judul slide (required)
- `subtitle` - Subjudul slide (optional)
- `image_url` - URL gambar slide (required)
- `link_url` - URL tujuan ketika slide diklik (optional)
- `button_text` - Teks tombol CTA (optional)
- `is_active` - Status aktif slide (default: true)
- `sort_order` - Urutan tampilan slide (default: 0)
- `created_at` - Timestamp pembuatan
- `updated_at` - Timestamp update terakhir

### 2. `category_images`
Tabel untuk menyimpan data gambar kategori:
- `id` - UUID primary key
- `category_key` - Key kategori (unique, required)
- `category_name` - Nama kategori (required)
- `image_url` - URL gambar kategori (required)
- `created_at` - Timestamp pembuatan
- `updated_at` - Timestamp update terakhir

## 🚀 Cara Setup Database

### Langkah 1: Jalankan Script SQL
1. Buka Supabase Dashboard
2. Pilih project Anda
3. Navigasi ke **SQL Editor**
4. Copy dan paste isi file `image-management.sql`
5. Klik **Run** untuk menjalankan script

### Langkah 2: Setup Storage Bucket
1. Navigasi ke **Storage** di Supabase Dashboard
2. Jika bucket `material` belum ada, buat bucket baru:
   - Name: `material`
   - Public: `true`
3. Atur policies untuk bucket (sudah disediakan dalam script SQL)

### Langkah 3: Verifikasi Setup
Setelah menjalankan script, verifikasi bahwa:
- ✅ Tabel `hero_slides` dan `category_images` telah dibuat
- ✅ Data default telah diinsert
- ✅ Index dan trigger telah dibuat
- ✅ RLS policies telah diatur
- ✅ Storage bucket `material` tersedia

## 🔐 Security & Permissions

### Row Level Security (RLS)
- **Public Access**: Semua user dapat membaca data slides dan kategori
- **Admin Access**: Hanya admin yang dapat melakukan CRUD operations
- **Authentication**: Menggunakan Supabase Auth dengan email pattern admin

### Storage Policies
- **Read**: Public access untuk semua gambar
- **Upload/Update/Delete**: Hanya untuk authenticated users (admin)

## 📊 Data Default

Script akan menginsert data default:

### Hero Slides
1. **Koleksi Sepatu Terbaru** - Link ke `/kategori/sepatu`
2. **Tas Berkualitas Premium** - Link ke `/kategori/tas`
3. **Fashion Terkini** - Link ke `/kategori/pakaian`

### Category Images
1. **Sepatu** - Gambar sepatu dari Pexels
2. **Tas** - Gambar tas dari Pexels
3. **Pakaian** - Gambar pakaian dari Pexels

## 🛠️ Maintenance

### Update Timestamp Otomatis
Trigger `update_updated_at_column()` akan otomatis mengupdate field `updated_at` setiap kali ada perubahan data.

### Backup Data
Pastikan untuk melakukan backup data secara berkala:
```sql
-- Backup hero slides
SELECT * FROM hero_slides;

-- Backup category images
SELECT * FROM category_images;
```

### Monitoring
Monitor penggunaan storage dan performa query:
```sql
-- Cek jumlah slides aktif
SELECT COUNT(*) FROM hero_slides WHERE is_active = true;

-- Cek ukuran tabel
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats
WHERE tablename IN ('hero_slides', 'category_images');
```

## 🔧 Troubleshooting

### Error: Table already exists
Jika tabel sudah ada, script akan menggunakan `IF NOT EXISTS` sehingga aman dijalankan berulang kali.

### Error: Permission denied
Pastikan user yang menjalankan script memiliki permission untuk:
- Membuat tabel
- Membuat index
- Membuat trigger
- Mengatur RLS policies

### Error: Storage bucket not found
Pastikan bucket `material` telah dibuat di Storage dashboard dengan setting public = true.

### Error: RLS policy conflict
Jika ada conflict dengan existing policies, drop policies lama terlebih dahulu:
```sql
DROP POLICY IF EXISTS "existing_policy_name" ON table_name;
```

## 📞 Support

Jika mengalami masalah dalam setup database, periksa:
1. Supabase project settings
2. User permissions
3. Network connectivity
4. Supabase service status

Untuk bantuan lebih lanjut, konsultasikan dengan dokumentasi Supabase atau tim development.