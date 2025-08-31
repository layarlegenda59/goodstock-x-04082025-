# 🚀 Panduan Deployment Goodstock-X ke Vercel

Panduan lengkap untuk deploy aplikasi Goodstock-X e-commerce ke Vercel.

## 📋 Prerequisites

- [x] Akun GitHub
- [x] Akun Vercel (bisa login dengan GitHub)
- [x] Repository GitHub dengan kode aplikasi
- [x] Supabase project yang sudah dikonfigurasi

## 🔧 Persiapan Sebelum Deploy

### 1. Environment Variables
Pastikan file `.env.local` sudah berisi:
```env
NEXT_PUBLIC_SUPABASE_URL=https://eldhtxtnwdanyavkikap.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Build Test
Jalankan build test lokal:
```bash
npm run build
```
✅ **Status**: Build berhasil tanpa error!

### 3. Konfigurasi Vercel
File `vercel.json` sudah dibuat dengan konfigurasi optimal:
- Framework: Next.js
- Region: Singapore (sin1) untuk performa optimal di Asia
- Security headers
- Function timeout: 30 detik

## 🚀 Langkah-langkah Deployment

### Step 1: Push ke GitHub
```bash
# Inisialisasi git (jika belum)
git init

# Add semua file
git add .

# Commit
git commit -m "Initial commit - Ready for Vercel deployment"

# Add remote repository
git remote add origin https://github.com/username/goodstock-x.git

# Push ke GitHub
git push -u origin main
```

### Step 2: Deploy ke Vercel

#### Opsi A: Via Vercel Dashboard
1. Buka [vercel.com](https://vercel.com)
2. Login dengan akun GitHub
3. Klik "New Project"
4. Import repository GitHub Anda
5. Vercel akan otomatis detect Next.js
6. **PENTING**: Tambahkan Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
7. Klik "Deploy"

#### Opsi B: Via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login ke Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Y
# - Which scope? (pilih akun Anda)
# - Link to existing project? N
# - Project name: goodstock-x
# - Directory: ./
# - Override settings? N
```

### Step 3: Konfigurasi Environment Variables di Vercel

1. Buka project di Vercel Dashboard
2. Go to **Settings** → **Environment Variables**
3. Tambahkan:
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://eldhtxtnwdanyavkikap.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
4. Pilih environment: **Production**, **Preview**, **Development**
5. Klik **Save**

### Step 4: Redeploy
Setelah menambah environment variables:
1. Go to **Deployments** tab
2. Klik **Redeploy** pada deployment terakhir
3. Atau push commit baru ke GitHub untuk trigger auto-deploy

## 🔧 Konfigurasi Domain (Opsional)

### Custom Domain
1. Di Vercel Dashboard → **Settings** → **Domains**
2. Add domain Anda
3. Update DNS records sesuai instruksi Vercel
4. Tunggu propagasi DNS (5-10 menit)

## 🔒 Konfigurasi Supabase untuk Production

### 1. Update Supabase URL Allowed Origins
1. Buka Supabase Dashboard
2. Go to **Settings** → **API**
3. Tambahkan domain Vercel ke **Site URL**:
   ```
   https://your-app-name.vercel.app
   ```

### 2. Update Authentication Redirect URLs
1. Go to **Authentication** → **URL Configuration**
2. Tambahkan ke **Redirect URLs**:
   ```
   https://your-app-name.vercel.app/auth/callback
   https://your-app-name.vercel.app/admin/login
   ```

## ✅ Verifikasi Deployment

### Checklist Post-Deployment
- [ ] Website bisa diakses di URL Vercel
- [ ] Homepage loading dengan benar
- [ ] Produk bisa ditampilkan (koneksi Supabase OK)
- [ ] Login customer berfungsi
- [ ] Login admin berfungsi
- [ ] Cart dan wishlist berfungsi
- [ ] Search dan filter berfungsi
- [ ] Responsive design OK di mobile

### Test URLs
```
https://your-app-name.vercel.app/
https://your-app-name.vercel.app/kategori/sepatu
https://your-app-name.vercel.app/auth/login
https://your-app-name.vercel.app/admin/login
```

## 🐛 Troubleshooting

### Build Errors
```bash
# Jika ada error saat build
npm run build
# Fix errors, lalu push lagi
```

### Environment Variables Issues
- Pastikan semua env vars sudah ditambahkan di Vercel
- Restart deployment setelah menambah env vars
- Check di browser console untuk error koneksi

### Supabase Connection Issues
- Verify Supabase URL dan API key
- Check allowed origins di Supabase settings
- Pastikan RLS policies sudah benar

### Performance Issues
- Enable Vercel Analytics
- Check Core Web Vitals
- Optimize images jika perlu

## 📊 Monitoring & Analytics

### Vercel Analytics
1. Enable di project settings
2. Monitor Core Web Vitals
3. Track page performance

### Error Monitoring
- Check Vercel Functions logs
- Monitor Supabase logs
- Setup error tracking (Sentry, LogRocket)

## 🔄 Continuous Deployment

Setelah setup awal:
1. **Auto-deploy**: Setiap push ke `main` branch akan auto-deploy
2. **Preview deployments**: Setiap PR akan dapat preview URL
3. **Rollback**: Bisa rollback ke deployment sebelumnya dengan 1 klik

## 🎉 Selesai!

Aplikasi Goodstock-X Anda sekarang sudah live di Vercel! 🚀

**Next Steps:**
- Setup custom domain
- Enable analytics
- Monitor performance
- Setup error tracking
- Configure CDN untuk assets

---

**Support:**
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-into-prod)