# Goodstock-X E-commerce Platform - Deployment Guide

## 🚀 Overview

This repository contains a complete Next.js + Supabase e-commerce platform with comprehensive deployment scripts for Hostinger VPS with CloudPanel.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Deployment Scripts](#deployment-scripts)
- [Prerequisites](#prerequisites)
- [Step-by-Step Deployment](#step-by-step-deployment)
- [Configuration](#configuration)
- [Management Scripts](#management-scripts)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Troubleshooting](#troubleshooting)
- [Support](#support)

## 🚀 Quick Start

### For Hostinger VPS with CloudPanel:

1. **Run the main deployment script:**
   ```bash
   chmod +x deploy-to-hostinger.sh
   ./deploy-to-hostinger.sh
   ```

2. **Configure CloudPanel reverse proxy** (see [CloudPanel Configuration](#cloudpanel-configuration))

3. **Your application will be running at:** `https://www.goodstock-x.com`

## 📦 Deployment Scripts

### Core Deployment Files

| File | Purpose | Description |
|------|---------|-------------|
| `deploy-to-hostinger.sh` | Main deployment script | Complete automated deployment for Hostinger VPS |
| `server-setup.sh` | VPS initial setup | System configuration, Node.js, PM2, Nginx setup |
| `ecosystem.config.js` | PM2 configuration | Process management and monitoring |
| `deploy.sh` | Quick updates | Fast deployment for code updates |

### Docker Support

| File | Purpose | Description |
|------|---------|-------------|
| `Dockerfile` | Container definition | Docker image configuration |
| `docker-compose.yml` | Container orchestration | Multi-service Docker setup |

### Monitoring & Maintenance

| File | Purpose | Description |
|------|---------|-------------|
| `monitor.sh` | Health monitoring | Application and system monitoring |
| `backup.sh` | Backup management | Automated backup and restore |

### Documentation

| File | Purpose | Description |
|------|---------|-------------|
| `DEPLOYMENT.md` | Detailed deployment guide | Comprehensive deployment instructions |
| `cloudpanel-config.md` | CloudPanel setup | CloudPanel configuration guide |

## 🔧 Prerequisites

### Server Requirements
- **VPS:** Hostinger VPS or similar
- **OS:** Ubuntu 20.04+ or CentOS 7+
- **RAM:** Minimum 2GB (4GB recommended)
- **Storage:** Minimum 20GB SSD
- **Control Panel:** CloudPanel installed

### Required Services
- **Node.js:** 18.x or higher
- **PM2:** Process manager
- **Nginx:** Web server (via CloudPanel)
- **Git:** Version control
- **Supabase:** Database and authentication

### Domain & DNS
- Domain: `www.goodstock-x.com`
- DNS pointing to your VPS IP
- SSL certificate (Let's Encrypt via CloudPanel)

## 🛠 Step-by-Step Deployment

### 1. Initial Server Setup

```bash
# Download and run server setup script
wget https://raw.githubusercontent.com/layarlegenda59/goodstock-x-04082025-/main/server-setup.sh
chmod +x server-setup.sh
sudo ./server-setup.sh
```

### 2. Deploy Application

```bash
# Clone repository
git clone https://github.com/layarlegenda59/goodstock-x-04082025-.git goodstock-x
cd goodstock-x

# Run deployment script
chmod +x deploy-to-hostinger.sh
./deploy-to-hostinger.sh
```

### 3. Configure Environment Variables

Edit the `.env` file with your Supabase credentials:

```bash
cd /home/goodstock-x/htdocs/goodstock-x
nano .env
```

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database
DATABASE_URL=postgresql://postgres:[password]@db.your-project.supabase.co:5432/postgres

# Authentication
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://www.goodstock-x.com

# Application
NODE_ENV=production
PORT=3000
```

### 4. CloudPanel Configuration

Follow the detailed guide in `cloudpanel-config.md` or:

1. Access CloudPanel: `https://your-server-ip:8443`
2. Create site: `www.goodstock-x.com`
3. Set reverse proxy: `http://127.0.0.1:3000`
4. Enable SSL with Let's Encrypt

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | ✅ |
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `NEXTAUTH_SECRET` | NextAuth.js secret | ✅ |
| `NEXTAUTH_URL` | Application URL | ✅ |
| `NODE_ENV` | Environment (production) | ✅ |
| `PORT` | Application port (3000) | ✅ |

### Supabase Setup

1. **Create Supabase Project:**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Note down URL and API keys

2. **Database Schema:**
   ```sql
   -- Enable RLS
   ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
   ALTER TABLE products ENABLE ROW LEVEL SECURITY;
   
   -- Create policies
   CREATE POLICY "Users can view own profile" ON profiles
     FOR SELECT USING (auth.uid() = id);
   
   CREATE POLICY "Anyone can view products" ON products
     FOR SELECT USING (true);
   ```

3. **Storage Buckets:**
   - Create `product-images` bucket
   - Set appropriate policies

## 🔧 Management Scripts

### Quick Deployment Updates

```bash
# Update application with latest code
./deploy.sh
```

### Application Management

```bash
# Check application status
pm2 status goodstock-x

# View logs
pm2 logs goodstock-x

# Restart application
pm2 restart goodstock-x

# Stop application
pm2 stop goodstock-x
```

### System Monitoring

```bash
# Run health check
./monitor.sh --health

# Check system status
./monitor.sh --status

# Run maintenance
./monitor.sh --maintenance
```

### Backup Management

```bash
# Create full backup
./backup.sh --full

# Create application backup only
./backup.sh --app

# List existing backups
./backup.sh --list

# Restore from backup
./backup.sh --restore /path/to/backup.tar.gz
```

## 📊 Monitoring & Maintenance

### Health Monitoring

The `monitor.sh` script provides:
- **Application health checks**
- **System resource monitoring**
- **SSL certificate monitoring**
- **Automated alerts**
- **Performance metrics**

### Automated Backups

Set up automated backups with cron:

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /home/goodstock-x/htdocs/goodstock-x/backup.sh --full

# Add weekly cleanup
0 3 * * 0 /home/goodstock-x/htdocs/goodstock-x/backup.sh --cleanup
```

### Log Management

Logs are stored in:
- **Application logs:** `/home/goodstock-x/logs/`
- **PM2 logs:** `~/.pm2/logs/`
- **Nginx logs:** `/var/log/nginx/`

## 🐛 Troubleshooting

### Common Issues

#### Application Won't Start
```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs goodstock-x

# Restart application
pm2 restart goodstock-x
```

#### Database Connection Issues
```bash
# Verify environment variables
cat .env

# Test database connection
npm run db:test
```

#### SSL Certificate Issues
```bash
# Check certificate status
./monitor.sh --ssl

# Renew certificate via CloudPanel
# Or manually with certbot
sudo certbot renew
```

#### Performance Issues
```bash
# Check system resources
./monitor.sh --status

# Monitor application metrics
pm2 monit

# Check database performance
# Use Supabase dashboard
```

### Debug Mode

Enable debug mode for troubleshooting:

```bash
# Set debug environment
export DEBUG=*

# Restart with debug
pm2 restart goodstock-x --update-env
```

### Log Analysis

```bash
# View recent application logs
tail -f ~/.pm2/logs/goodstock-x-out.log

# View error logs
tail -f ~/.pm2/logs/goodstock-x-error.log

# Search for specific errors
grep -r "ERROR" /home/goodstock-x/logs/
```

## 🔒 Security

### Security Checklist

- ✅ **Firewall configured** (UFW)
- ✅ **SSL certificate installed**
- ✅ **Environment variables secured**
- ✅ **Database RLS enabled**
- ✅ **Regular security updates**
- ✅ **Backup encryption**

### Security Updates

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Node.js dependencies
npm audit fix

# Update PM2
npm install -g pm2@latest
pm2 update
```

## 📈 Performance Optimization

### Application Optimization

1. **Enable caching:**
   ```javascript
   // next.config.js
   module.exports = {
     experimental: {
       appDir: true,
     },
     images: {
       domains: ['your-supabase-project.supabase.co'],
     },
   }
   ```

2. **Database optimization:**
   - Use database indexes
   - Implement query optimization
   - Use Supabase Edge Functions

3. **CDN setup:**
   - Configure CloudFlare
   - Optimize images
   - Enable compression

### Server Optimization

```bash
# Optimize PM2 cluster mode
pm2 start ecosystem.config.js

# Enable Nginx compression
# (Configured via CloudPanel)

# Monitor performance
./monitor.sh --performance
```

## 🆘 Support

### Getting Help

1. **Check logs first:**
   ```bash
   ./monitor.sh --status
   pm2 logs goodstock-x
   ```

2. **Review documentation:**
   - `DEPLOYMENT.md` - Detailed deployment guide
   - `cloudpanel-config.md` - CloudPanel setup
   - This README - General overview

3. **Common commands:**
   ```bash
   # Application status
   pm2 status
   
   # System health
   ./monitor.sh --health
   
   # Quick restart
   pm2 restart goodstock-x
   
   # Update application
   ./deploy.sh
   ```

### Emergency Procedures

#### Application Down
```bash
# Quick recovery
pm2 restart goodstock-x

# If that fails, redeploy
./deploy.sh

# If still failing, restore from backup
./backup.sh --restore /path/to/latest/backup.tar.gz
```

#### Database Issues
```bash
# Check Supabase status
# Visit: https://status.supabase.com

# Verify connection
npm run db:test

# Check environment variables
cat .env
```

### Contact Information

- **Repository:** https://github.com/layarlegenda59/goodstock-x-04082025-
- **Issues:** Create GitHub issue for bugs
- **Documentation:** Check `/docs` folder for detailed guides

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Made with ❤️ for Goodstock-X E-commerce Platform**