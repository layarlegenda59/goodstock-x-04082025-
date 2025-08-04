#!/usr/bin/env node

/**
 * Script otomatis untuk deployment Goodstock-X ke Vercel
 * Usage: node deploy.js
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

function main() {
  log('🚀 Memulai deployment Goodstock-X ke Vercel...', 'bright');
  
  // Pre-deployment checks
  log('\n📋 Melakukan pengecekan pre-deployment...', 'yellow');
  
  const checks = [
    checkFile('.env.local', 'Environment variables (.env.local)'),
    checkFile('package.json', 'Package.json'),
    checkFile('next.config.js', 'Next.js config'),
    checkFile('vercel.json', 'Vercel config')
  ];
  
  if (!checks.every(check => check)) {
    log('\n❌ Pre-deployment checks gagal. Silakan perbaiki masalah di atas.', 'red');
    process.exit(1);
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
      
      const commitMessage = `Deploy: ${new Date().toISOString().split('T')[0]} - Ready for Vercel`;
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
    if (!runCommand('git commit -m "Initial commit - Ready for Vercel deployment"', 'Git commit')) process.exit(1);
    
    log('\n⚠️  Jangan lupa untuk menambahkan remote repository:', 'yellow');
    log('git remote add origin https://github.com/username/goodstock-x.git', 'cyan');
    log('git push -u origin main', 'cyan');
  }
  
  // Check if Vercel CLI is installed
  log('\n🔧 Memeriksa Vercel CLI...', 'cyan');
  try {
    execSync('vercel --version', { stdio: 'pipe' });
    log('✅ Vercel CLI sudah terinstall', 'green');
  } catch (error) {
    log('⚠️  Vercel CLI belum terinstall. Installing...', 'yellow');
    if (!runCommand('npm install -g vercel', 'Install Vercel CLI')) {
      log('\n❌ Gagal install Vercel CLI. Silakan install manual:', 'red');
      log('npm install -g vercel', 'cyan');
      process.exit(1);
    }
  }
  
  // Deploy to Vercel
  log('\n🚀 Deploying ke Vercel...', 'magenta');
  if (!runCommand('vercel --prod', 'Vercel deployment')) {
    log('\n❌ Deployment gagal. Silakan cek error di atas.', 'red');
    process.exit(1);
  }
  
  // Success message
  log('\n🎉 Deployment berhasil!', 'green');
  log('\n📋 Checklist post-deployment:', 'yellow');
  log('  1. Buka URL Vercel yang diberikan', 'cyan');
  log('  2. Test login customer dan admin', 'cyan');
  log('  3. Test fitur utama (cart, wishlist, search)', 'cyan');
  log('  4. Verifikasi koneksi Supabase', 'cyan');
  log('  5. Setup custom domain (opsional)', 'cyan');
  
  log('\n📚 Dokumentasi lengkap ada di DEPLOYMENT_GUIDE.md', 'blue');
  log('\n🔗 Useful links:', 'yellow');
  log('  - Vercel Dashboard: https://vercel.com/dashboard', 'cyan');
  log('  - Supabase Dashboard: https://supabase.com/dashboard', 'cyan');
  log('  - Next.js Docs: https://nextjs.org/docs/deployment', 'cyan');
}

if (require.main === module) {
  main();
}

module.exports = { main };