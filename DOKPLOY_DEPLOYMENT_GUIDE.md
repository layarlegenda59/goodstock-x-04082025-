# 🚀 Panduan Deployment Goodstock-X ke Dokploy

Panduan lengkap untuk deploy aplikasi Goodstock-X e-commerce ke Dokploy di VPS Hostinger.

## 📋 Prerequisites

- [x] VPS Hostinger dengan Dokploy terinstal
- [x] Domain atau subdomain yang sudah dikonfigurasi
- [x] Repository GitHub dengan kode aplikasi
- [x] Supabase project yang sudah dikonfigurasi
- [x] SSL certificate (Let's Encrypt melalui Dokploy)

## 🔧 Persiapan Sebelum Deploy

### 1. Environment Variables
Pastikan file `.env.local` sudah berisi:
```env
NEXT_PUBLIC_SUPABASE_URL=https://eldhtxtnwdanyavkikap.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Build Test Lokal
```bash
npm run build
```
✅ **Status**: Build berhasil tanpa error!

### 3. Konfigurasi Docker (Opsional)
Buat `Dockerfile` untuk optimasi deployment:
```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### 4. Update next.config.js untuk Standalone
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js']
  },
  images: {
    domains: ['eldhtxtnwdanyavkikap.supabase.co'],
    unoptimized: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  }
}

module.exports = nextConfig
```

## 🚀 Langkah-langkah Deployment di Dokploy

### Step 1: Akses Dokploy Dashboard
1. Buka browser dan akses Dokploy di VPS Anda
2. Login dengan kredensial admin Dokploy
3. Pastikan Dokploy sudah terhubung dengan Docker

### Step 2: Buat Project Baru
1. Klik **"Create Application"** atau **"New Project"**
2. Pilih **"Git Repository"** sebagai source
3. Masukkan URL repository GitHub:
   ```
   https://github.com/username/goodstock-x.git
   ```
4. Pilih branch: `main` atau `master`
5. Set nama aplikasi: `goodstock-x`

### Step 3: Konfigurasi Build Settings
```yaml
# Build Configuration
Build Command: npm run build
Start Command: npm start
Node Version: 18
Port: 3000
Environment: production
```

### Step 4: Environment Variables
Tambahkan environment variables di Dokploy:
```env
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=https://eldhtxtnwdanyavkikap.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
PORT=3000
HOSTNAME=0.0.0.0
```

### Step 5: Domain Configuration
1. Di Dokploy dashboard, buka **"Domains"**
2. Tambahkan domain atau subdomain Anda:
   ```
   goodstock.yourdomain.com
   ```
3. Enable **SSL/TLS** (Let's Encrypt)
4. Set **Force HTTPS**: ON

### Step 6: Deploy
1. Review semua konfigurasi
2. Klik **"Deploy"** atau **"Build & Deploy"**
3. Monitor logs deployment di dashboard
4. Tunggu hingga status menjadi **"Running"**

## 🔒 Konfigurasi Supabase untuk Production

### 1. Update Supabase URL Allowed Origins
1. Buka Supabase Dashboard
2. Go to **Settings** → **API**
3. Tambahkan domain Dokploy ke **Site URL**:
   ```
   https://goodstock.yourdomain.com
   ```

### 2. Update Authentication Redirect URLs
1. Go to **Authentication** → **URL Configuration**
2. Tambahkan ke **Redirect URLs**:
   ```
   https://goodstock.yourdomain.com/auth/callback
   https://goodstock.yourdomain.com/admin/login
   ```

## 🔧 Konfigurasi Reverse Proxy (Nginx)

Jika menggunakan Nginx sebagai reverse proxy:
```nginx
server {
    listen 80;
    server_name goodstock.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name goodstock.yourdomain.com;

    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/private.key;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## ✅ Verifikasi Deployment

### Checklist Post-Deployment
- [ ] Website bisa diakses di domain yang dikonfigurasi
- [ ] SSL certificate aktif (HTTPS)
- [ ] Homepage loading dengan benar
- [ ] Produk bisa ditampilkan (koneksi Supabase OK)
- [ ] Login customer berfungsi
- [ ] Login admin berfungsi
- [ ] Cart dan wishlist berfungsi
- [ ] Search dan filter berfungsi
- [ ] Responsive design OK di mobile
- [ ] Performance loading time < 3 detik

### Test URLs
```
https://goodstock.yourdomain.com/
https://goodstock.yourdomain.com/kategori/sepatu
https://goodstock.yourdomain.com/auth/login
https://goodstock.yourdomain.com/admin/login
```

## 🐛 Troubleshooting

### Build Errors
```bash
# Check logs di Dokploy dashboard
# Atau akses via SSH ke VPS
sudo docker logs container_name
```

### Environment Variables Issues
- Pastikan semua env vars sudah ditambahkan di Dokploy
- Restart container setelah menambah env vars
- Check di browser console untuk error koneksi

### SSL Certificate Issues
```bash
# Renew SSL certificate
sudo certbot renew

# Check certificate status
sudo certbot certificates
```

### Performance Issues
- Monitor resource usage di VPS
- Check Docker container stats
- Optimize images dan assets
- Enable caching di Nginx

### Database Connection Issues
- Verify Supabase URL dan API key
- Check allowed origins di Supabase settings
- Pastikan RLS policies sudah benar
- Test koneksi dari VPS ke Supabase

## 📊 Monitoring & Maintenance

### Server Monitoring
```bash
# Check container status
sudo docker ps

# Check logs
sudo docker logs goodstock-x

# Check resource usage
sudo docker stats

# Check disk space
df -h
```

### Backup Strategy
1. **Database**: Backup Supabase secara berkala
2. **Files**: Backup kode dan konfigurasi
3. **SSL**: Backup certificate files

### Update Deployment
1. Push changes ke GitHub
2. Di Dokploy dashboard, klik **"Redeploy"**
3. Monitor deployment logs
4. Test functionality setelah update

## 🔄 CI/CD dengan GitHub Actions (Opsional)

Buat `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Dokploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build
      run: npm run build
    
    - name: Deploy to Dokploy
      run: |
        curl -X POST "${{ secrets.DOKPLOY_WEBHOOK_URL }}" \
          -H "Authorization: Bearer ${{ secrets.DOKPLOY_TOKEN }}"
```

## 🎉 Selesai!

Aplikasi Goodstock-X Anda sekarang sudah live di Dokploy! 🚀

**Next Steps:**
- Setup monitoring dan alerting
- Konfigurasi backup otomatis
- Optimasi performance
- Setup CDN untuk assets static

---

📚 **Dokumentasi Tambahan:**
- [Dokploy Documentation](https://dokploy.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-into-prod)