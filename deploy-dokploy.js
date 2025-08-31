#!/usr/bin/env node

/**
 * Script otomatis untuk deployment Goodstock-X ke Dokploy
 * Usage: node deploy-dokploy.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, description) {
  log(`\n🔄 ${description}...`, 'cyan');
  try {
    execSync(command, { stdio: 'inherit' });
    log(`✅ ${description} berhasil!`, 'green');
    return true;
  } catch (error) {
    log(`❌ ${description} gagal!`, 'red');
    console.error(error.message);
    return false;
  }
}

function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    log(`✅ ${description} ditemukan`, 'green');
    return true;
  } else {
    log(`❌ ${description} tidak ditemukan`, 'red');
    return false;
  }
}

function createDockerComposeFile() {
  const dockerCompose = `version: '3.8'

services:
  goodstock-x:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_SUPABASE_URL=\${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=\${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - PORT=3000
      - HOSTNAME=0.0.0.0
    restart: unless-stopped
    networks:
      - goodstock-network

networks:
  goodstock-network:
    driver: bridge
`;

  fs.writeFileSync('docker-compose.yml', dockerCompose);
  log('✅ docker-compose.yml dibuat', 'green');
}

function main() {
  log('🚀 Memulai deployment Goodstock-X ke Dokploy...', 'bright');
  
  // Pre-deployment checks
  log('\n📋 Melakukan pengecekan pre-deployment...', 'yellow');
  
  const checks = [
    checkFile('.env.local', 'Environment variables (.env.local)'),
    checkFile('package.json', 'Package.json'),
    checkFile('next.config.js', 'Next.js config'),
    checkFile('Dockerfile', 'Dockerfile')
  ];
  
  if (!checks.every(check => check)) {
    log('\n❌ Pre-deployment checks gagal. Silakan perbaiki masalah di atas.', 'red');
    process.exit(1);
  }
  
  // Create docker-compose.yml if not exists
  if (!fs.existsSync('docker-compose.yml')) {
    log('\n📝 Membuat docker-compose.yml...', 'cyan');
    createDockerComposeFile();
  }
  
  // Build test
  if (!runCommand('npm run build', 'Build test')) {
    log('\n❌ Build gagal. Silakan perbaiki error build terlebih dahulu.', 'red');
    process.exit(1);
  }
  
  // TypeScript check
  if (!runCommand('npx tsc --noEmit', 'TypeScript check')) {
    log('\n⚠️  TypeScript check gagal, tapi deployment akan dilanjutkan.', 'yellow');
  }
  
  // Git status check
  log('\n📝 Memeriksa status Git...', 'cyan');
  try {
    const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
    if (gitStatus.trim()) {
      log('\n📦 Ada perubahan yang belum di-commit. Melakukan commit...', 'yellow');
      
      if (!runCommand('git add .', 'Git add')) {
        process.exit(1);
      }
      
      const commitMessage = `Deploy: ${new Date().toISOString().split('T')[0]} - Ready for Dokploy`;
      if (!runCommand(`git commit -m "${commitMessage}"`, 'Git commit')) {
        process.exit(1);
      }
    } else {
      log('✅ Tidak ada perubahan yang perlu di-commit', 'green');
    }
  } catch (error) {
    log('⚠️  Git repository belum diinisialisasi', 'yellow');
    log('\n📝 Menginisialisasi Git repository...', 'cyan');
    
    if (!runCommand('git init', 'Git init')) process.exit(1);
    if (!runCommand('git add .', 'Git add')) process.exit(1);
    if (!runCommand('git commit -m "Initial commit - Ready for Dokploy deployment"', 'Git commit')) process.exit(1);
    
    log('\n⚠️  Jangan lupa untuk menambahkan remote repository:', 'yellow');
    log('git remote add origin https://github.com/username/goodstock-x.git', 'cyan');
    log('git push -u origin main', 'cyan');
  }
  
  // Docker build test (optional)
  log('\n🐳 Testing Docker build...', 'cyan');
  if (runCommand('docker build -t goodstock-x-test .', 'Docker build test')) {
    log('✅ Docker build berhasil!', 'green');
    // Clean up test image
    try {
      execSync('docker rmi goodstock-x-test', { stdio: 'pipe' });
    } catch (e) {
      // Ignore cleanup errors
    }
  } else {
    log('⚠️  Docker build gagal, tapi deployment bisa dilanjutkan', 'yellow');
  }
  
  // Success message with instructions
  log('\n🎉 Pre-deployment checks selesai!', 'green');
  log('\n📋 Langkah selanjutnya di Dokploy Dashboard:', 'yellow');
  log('\n1. 🌐 Akses Dokploy Dashboard di VPS Anda', 'cyan');
  log('2. ➕ Klik "Create Application" atau "New Project"', 'cyan');
  log('3. 📂 Pilih "Git Repository" sebagai source', 'cyan');
  log('4. 🔗 Masukkan URL repository GitHub Anda', 'cyan');
  log('5. ⚙️  Set konfigurasi build:', 'cyan');
  log('   - Build Command: npm run build', 'blue');
  log('   - Start Command: npm start', 'blue');
  log('   - Node Version: 18', 'blue');
  log('   - Port: 3000', 'blue');
  log('6. 🔐 Tambahkan Environment Variables:', 'cyan');
  log('   - NODE_ENV=production', 'blue');
  log('   - NEXT_PUBLIC_SUPABASE_URL=your_supabase_url', 'blue');
  log('   - NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key', 'blue');
  log('   - PORT=3000', 'blue');
  log('   - HOSTNAME=0.0.0.0', 'blue');
  log('7. 🌍 Konfigurasi domain dan SSL', 'cyan');
  log('8. 🚀 Klik "Deploy"', 'cyan');
  
  log('\n📚 Dokumentasi lengkap ada di DOKPLOY_DEPLOYMENT_GUIDE.md', 'blue');
  
  log('\n🔗 Useful links:', 'yellow');
  log('  - Dokploy Documentation: https://dokploy.com/docs', 'cyan');
  log('  - Supabase Dashboard: https://supabase.com/dashboard', 'cyan');
  log('  - Next.js Deployment Docs: https://nextjs.org/docs/deployment', 'cyan');
  
  log('\n✅ Repository siap untuk deployment ke Dokploy!', 'green');
}

if (require.main === module) {
  main();
}

module.exports = { main };