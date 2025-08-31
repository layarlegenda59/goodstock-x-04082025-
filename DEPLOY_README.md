# 🚀 Quick Deploy ke Vercel

## Cara Tercepat (3 Langkah)

### 1. Persiapan
```bash
# Pastikan build berhasil
npm run build
```

### 2. Deploy Otomatis
```bash
# Jalankan script deployment otomatis
npm run deploy
```

### 3. Manual (jika script gagal)
```bash
# Install Vercel CLI
npm install -g vercel

# Login ke Vercel
vercel login

# Deploy
vercel --prod
```

## Environment Variables di Vercel

Setelah deploy, tambahkan di Vercel Dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL = https://eldhtxtnwdanyavkikap.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Konfigurasi Supabase

Di Supabase Dashboard → Settings → API:
- **Site URL**: `https://your-app-name.vercel.app`
- **Redirect URLs**: 
  - `https://your-app-name.vercel.app/auth/callback`
  - `https://your-app-name.vercel.app/admin/login`

## Test Deployment

✅ **Checklist:**
- [ ] Homepage loading
- [ ] Login customer: `/auth/login`
- [ ] Login admin: `/admin/login` (admin@example.com / password123)
- [ ] Produk ditampilkan
- [ ] Cart & wishlist berfungsi

---

📚 **Dokumentasi lengkap**: `DEPLOYMENT_GUIDE.md`
🔗 **Vercel Dashboard**: https://vercel.com/dashboard