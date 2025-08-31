# 🔧 Fix Error Dokploy Deployment

## ❌ Error yang Terjadi
```
open /etc/dokploy/compose/goodstockx-khaliefdev-qcpssr/code/docker-compose.yml: no such file or directory
```

## 🔍 Penyebab Error
1. File `docker-compose.yml` belum di-push ke GitHub repository
2. Dokploy mencoba menggunakan docker-compose mode tapi file tidak ditemukan
3. Konfigurasi deployment type tidak sesuai

## ✅ Solusi yang Sudah Dilakukan
1. ✅ File `docker-compose.yml` sudah dibuat
2. ✅ File sudah di-commit dan di-push ke GitHub
3. ✅ Repository sudah terupdate dengan semua file deployment

## 🚀 Cara Fix di Dokploy Dashboard

### Opsi 1: Gunakan Dockerfile (Recommended)
1. **Delete aplikasi yang error** di Dokploy Dashboard
2. **Create New Application** dengan konfigurasi:
   ```
   Source Type: Git Repository
   Repository: https://github.com/layarlegenda59/goodstock-x-04082025-.git
   Branch: main
   Build Type: Dockerfile (bukan docker-compose)
   Dockerfile Path: ./Dockerfile
   ```

3. **Build Configuration:**
   ```
   Build Command: (kosongkan, akan menggunakan Dockerfile)
   Start Command: (kosongkan, akan menggunakan Dockerfile)
   Port: 3000
   ```

4. **Environment Variables:**
   ```
   NODE_ENV=production
   NEXT_PUBLIC_SUPABASE_URL=https://eldhtxtnwdanyavkikap.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   PORT=3000
   HOSTNAME=0.0.0.0
   ```

### Opsi 2: Gunakan Node.js Build
1. **Create New Application** dengan konfigurasi:
   ```
   Source Type: Git Repository
   Repository: https://github.com/layarlegenda59/goodstock-x-04082025-.git
   Branch: main
   Build Type: Node.js
   ```

2. **Build Configuration:**
   ```
   Build Command: npm ci && npm run build
   Start Command: npm start
   Node Version: 18
   Port: 3000
   ```

3. **Environment Variables:** (sama seperti opsi 1)

### Opsi 3: Fix Docker Compose (Advanced)
Jika tetap ingin menggunakan docker-compose:

1. **Pastikan file ada di root repository:**
   - ✅ `docker-compose.yml` sudah ada
   - ✅ `Dockerfile` sudah ada
   - ✅ `.dockerignore` sudah ada

2. **Konfigurasi di Dokploy:**
   ```
   Source Type: Git Repository
   Build Type: Docker Compose
   Compose File: ./docker-compose.yml
   Service Name: goodstock-x
   ```

## 🔄 Langkah-langkah Deployment Ulang

### 1. Hapus Aplikasi yang Error
```
1. Buka Dokploy Dashboard
2. Pilih aplikasi "goodstockx-khaliefdev-qcpssr"
3. Klik "Delete" atau "Remove"
4. Konfirmasi penghapusan
```

### 2. Create New Application (Recommended: Dockerfile)
```
1. Klik "Create Application"
2. Application Name: goodstock-x
3. Source Type: Git Repository
4. Repository URL: https://github.com/layarlegenda59/goodstock-x-04082025-.git
5. Branch: main
6. Build Type: Dockerfile
7. Dockerfile Path: ./Dockerfile
```

### 3. Configure Environment
```
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=https://eldhtxtnwdanyavkikap.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
PORT=3000
HOSTNAME=0.0.0.0
```

### 4. Deploy
```
1. Review konfigurasi
2. Klik "Deploy"
3. Monitor logs untuk memastikan build berhasil
```

## 🐛 Troubleshooting Tambahan

### Jika Build Gagal
```bash
# Check logs di Dokploy dashboard
# Pastikan environment variables sudah benar
# Verify Dockerfile syntax
```

### Jika Port Conflict
```
# Ganti port di Dokploy dashboard
# Update environment variable PORT
# Restart deployment
```

### Jika Memory Issues
```
# Increase memory limit di Dokploy
# Optimize Docker image size
# Check VPS resources
```

## ✅ Verifikasi Deployment Berhasil

1. **Check Application Status:**
   - Status: Running ✅
   - Health Check: Passing ✅
   - Logs: No errors ✅

2. **Test Website:**
   ```
   https://your-domain.com/
   https://your-domain.com/auth/login
   https://your-domain.com/admin/login
   ```

3. **Check Functionality:**
   - [ ] Homepage loads
   - [ ] Products display
   - [ ] Login works
   - [ ] Cart functions
   - [ ] Admin panel accessible

## 📞 Support

Jika masih ada masalah:
1. Check Dokploy logs untuk error details
2. Verify GitHub repository access
3. Confirm VPS resources sufficient
4. Review environment variables

---

**Status Update:** ✅ Repository sudah terupdate dengan semua file deployment. Silakan coba deployment ulang dengan Dockerfile method.