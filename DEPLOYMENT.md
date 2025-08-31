# Goodstock-X Deployment Guide

## Next.js Standalone Deployment to VPS

This guide provides comprehensive instructions for deploying the Goodstock-X e-commerce platform to a VPS using Next.js standalone build with both manual and automated deployment options.

### 🏗️ Infrastructure Overview

- **Build Mode**: Next.js Standalone
- **VPS**: Hostinger Cloud Panel (or any VPS)
- **Node.js**: Version 18.x
- **Process Manager**: PM2
- **Deployment**: rsync + GitHub Actions
- **File Structure**: Optimized for minimal deployment size

### 📋 Prerequisites

#### Local Environment
- **Node.js 18.x** or higher
- **npm** or yarn package manager
- **Git** for version control
- **SSH access** to your VPS
- **rsync** for file synchronization

#### VPS Requirements
- **Node.js 18.x** installed
- **PM2** process manager (`npm install -g pm2`)
- **SSH access** configured
- **Sufficient disk space** for the application

#### Environment Variables
Set up the following environment variables:

```bash
# VPS Connection Details
export VPS_HOST="your-vps-ip-or-domain.com"
export VPS_USER="your-username"  # Usually 'root' for Hostinger
export VPS_PATH="/var/www/goodstock-x"  # Target directory on VPS
```

## 🚀 Deployment Methods

### Method 1: Manual Deployment (Local Script)

Use the provided `deploy.sh` script for manual deployment:

1. **Set Environment Variables**:
   ```bash
   export VPS_HOST="your-server.com"
   export VPS_USER="root"
   export VPS_PATH="/var/www/goodstock-x"
   ```

2. **Run Deployment Script**:
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

   The script automatically:
   - ✅ Verifies Node.js 18 installation
   - ✅ Installs dependencies
   - ✅ Builds application in standalone mode
   - ✅ Packages only required files
   - ✅ Uploads via rsync
   - ✅ Installs production dependencies on VPS
   - ✅ Restarts application with PM2

### Method 2: GitHub Actions (Automated)

1. **Set Repository Secrets**:
   Go to GitHub repository → Settings → Secrets and variables → Actions
   
   Add these secrets:
   ```
   VPS_HOST: your-server.com
   VPS_USER: root
   VPS_PATH: /var/www/goodstock-x
   VPS_SSH_KEY: [Your private SSH key content]
   ```

2. **Trigger Deployment**:
   - **Automatic**: Push to `main` branch
   - **Manual**: Actions tab → "Deploy to VPS" → "Run workflow"

### Method 3: Manual VPS Setup

For initial VPS setup or troubleshooting:

```bash
# Connect to VPS
ssh root@your-vps-ip

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
npm install -g pm2

# Create directories
mkdir -p /var/www/goodstock-x/current
mkdir -p /var/www/goodstock-x/logs

# Set permissions
chown -R $USER:$USER /var/www/goodstock-x
```

#### Step 4: Configure Environment Variables

Edit the `.env` file with your actual credentials:

```bash
cd /home/goodstock-x/htdocs/goodstock-x
nano .env
```

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://eldhtxtnwdanyavkikap.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_supabase_anon_key

# Database Configuration
DATABASE_URL=your_actual_database_url

# JWT Secret for authentication
JWT_SECRET=your_actual_jwt_secret

# Production Environment
NODE_ENV=production

# Next.js Configuration
NEXTAUTH_URL=https://www.goodstock-x.com
NEXTAUTH_SECRET=your_actual_nextauth_secret
```

#### Step 5: CloudPanel Configuration

1. **Access CloudPanel**:
   - Open: https://31.97.222.15:8443
   - Login with your admin credentials

2. **Configure Site**:
   - Navigate to **Sites** → **www.goodstock-x.com**
   - Go to **Reverse Proxy** section

3. **Set Reverse Proxy**:
   ```
   Source: /
   Destination: http://127.0.0.1:3000
   ```

4. **Enable SSL**:
   - Enable **Let's Encrypt SSL Certificate**
   - Save configuration

5. **Verify Configuration**:
   - Check that the site is accessible at https://www.goodstock-x.com

### 🔧 Application Management

#### PM2 Commands

```bash
# Check application status
pm2 status

# View logs
pm2 logs goodstock-x

# Restart application
pm2 restart goodstock-x

# Stop application
pm2 stop goodstock-x

# Monitor application
pm2 monit
```

#### Quick Deployment Updates

For future updates, use the deployment script:

```bash
cd /home/goodstock-x/htdocs/goodstock-x
./deploy.sh
```

### 🗄️ Database Setup

#### Supabase Configuration

1. **Create Tables**: Run the migration files in Supabase SQL editor:
   - `supabase/migrations/create_profiles_table.sql`
   - `supabase/migrations/create_products_table.sql`
   - `supabase/storage/create_buckets.sql`

2. **Create Admin User**:
   - Create a new user in Supabase Auth dashboard
   - Update the user's profile with `role = 'admin'`

3. **Configure RLS Policies**: Ensure Row Level Security policies are properly set

### 🔐 Security Considerations

1. **Environment Variables**: Never commit `.env` files to version control
2. **Firewall**: Ensure only necessary ports are open (80, 443, 22)
3. **SSL Certificate**: Always use HTTPS in production
4. **Database Security**: Use strong passwords and enable RLS
5. **Regular Updates**: Keep dependencies and system packages updated

### 📊 Monitoring & Logs

#### Application Logs

```bash
# PM2 logs
pm2 logs goodstock-x

# Application-specific logs
tail -f /home/goodstock-x/logs/goodstock-x-combined.log
```

#### System Monitoring

```bash
# Check system resources
htop

# Check disk usage
df -h

# Check memory usage
free -h
```

### 🚨 Troubleshooting

#### Common Issues

1. **Port 3000 in use**:
   ```bash
   sudo lsof -i :3000
   pm2 restart goodstock-x
   ```

2. **Build failures**:
   ```bash
   cd /home/goodstock-x/htdocs/goodstock-x
   npm install
   npm run build
   ```

3. **Environment variables not loaded**:
   ```bash
   pm2 restart goodstock-x --update-env
   ```

4. **SSL certificate issues**:
   - Check CloudPanel SSL configuration
   - Verify domain DNS settings
   - Renew Let's Encrypt certificate if expired

#### Health Checks

```bash
# Check if application is responding
curl http://localhost:3000

# Check SSL certificate
curl -I https://www.goodstock-x.com

# Check PM2 process
pm2 status goodstock-x
```

### 📞 Support

For deployment issues:
1. Check application logs: `pm2 logs goodstock-x`
2. Verify environment variables are set correctly
3. Ensure Supabase connection is working
4. Check CloudPanel reverse proxy configuration

### 🔄 Backup Strategy

```bash
# Create backup script
cat <<EOF > /home/goodstock-x/backup.sh
#!/bin/bash
DATE=$(date +%Y%m%d-%H%M%S)
tar -czf /home/goodstock-x/backups/goodstock-x-\$DATE.tar.gz /home/goodstock-x/htdocs/goodstock-x
EOF

chmod +x /home/goodstock-x/backup.sh

# Create backups directory
mkdir -p /home/goodstock-x/backups

# Run backup
./backup.sh
```

---

**🎉 Congratulations!** Your Goodstock-X e-commerce platform is now deployed and running on Hostinger VPS with CloudPanel.

**Access your application**: https://www.goodstock-x.com