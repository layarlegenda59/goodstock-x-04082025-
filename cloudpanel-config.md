# CloudPanel Configuration Guide for Goodstock-X

This guide provides detailed instructions for configuring CloudPanel to serve the Goodstock-X e-commerce application.

## 🌐 CloudPanel Access

- **URL**: https://31.97.222.15:8443
- **Domain**: www.goodstock-x.com
- **Application Port**: 3000

## 📋 Prerequisites

1. CloudPanel installed and running on your Hostinger VPS
2. Domain `www.goodstock-x.com` pointed to your VPS IP address
3. Goodstock-X application deployed and running on port 3000
4. PM2 process manager running the application

## 🔧 Step-by-Step Configuration

### Step 1: Access CloudPanel

1. Open your web browser
2. Navigate to: `https://31.97.222.15:8443`
3. Login with your CloudPanel admin credentials

### Step 2: Create/Configure Site

1. **Navigate to Sites**:
   - Click on "Sites" in the left sidebar
   - Look for `www.goodstock-x.com` or create a new site

2. **Add New Site** (if not exists):
   - Click "Add Site"
   - Select "Node.js" as the site type
   - Enter domain: `www.goodstock-x.com`
   - Set document root: `/home/goodstock-x/htdocs/goodstock-x`
   - Select Node.js version: 18.x
   - Click "Add Site"

### Step 3: Configure Reverse Proxy

1. **Access Site Settings**:
   - Click on `www.goodstock-x.com` from the sites list
   - Navigate to the "Reverse Proxy" tab

2. **Add Reverse Proxy Rule**:
   ```
   Source Path: /
   Destination URL: http://127.0.0.1:3000
   ```

3. **Advanced Settings** (Optional):
   ```
   Proxy Headers:
   - Host: $host
   - X-Real-IP: $remote_addr
   - X-Forwarded-For: $proxy_add_x_forwarded_for
   - X-Forwarded-Proto: $scheme
   ```

4. **Save Configuration**:
   - Click "Save" to apply the reverse proxy settings

### Step 4: Configure SSL Certificate

1. **Navigate to SSL/TLS**:
   - In the site settings, click on "SSL/TLS" tab

2. **Enable Let's Encrypt**:
   - Check "Enable Let's Encrypt SSL Certificate"
   - Verify the domain: `www.goodstock-x.com`
   - Add additional domains if needed: `goodstock-x.com`
   - Click "Install Certificate"

3. **Force HTTPS** (Recommended):
   - Enable "Force HTTPS Redirect"
   - This will automatically redirect HTTP traffic to HTTPS

### Step 5: Configure Node.js Settings

1. **Navigate to Node.js**:
   - Click on "Node.js" tab in site settings

2. **Application Settings**:
   ```
   App Root: /home/goodstock-x/htdocs/goodstock-x
   Startup File: server.js (or as configured)
   Node.js Version: 18.x
   ```

3. **Environment Variables**:
   Add the following environment variables:
   ```
   NODE_ENV=production
   PORT=3000
   NEXT_PUBLIC_SUPABASE_URL=https://eldhtxtnwdanyavkikap.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### Step 6: Configure File Manager (Optional)

1. **Access File Manager**:
   - Navigate to "File Manager" tab
   - This allows you to manage files directly through CloudPanel

2. **Set Permissions**:
   - Ensure proper file permissions for the application
   - Owner: goodstock-x
   - Group: goodstock-x

## 🔍 Verification Steps

### 1. Check Application Status

```bash
# SSH into your server
ssh goodstock-x@your-vps-ip

# Check PM2 status
pm2 status

# Check application logs
pm2 logs goodstock-x
```

### 2. Test Reverse Proxy

```bash
# Test local application
curl http://localhost:3000

# Test through reverse proxy
curl http://www.goodstock-x.com

# Test HTTPS
curl https://www.goodstock-x.com
```

### 3. Verify SSL Certificate

```bash
# Check SSL certificate
openssl s_client -connect www.goodstock-x.com:443 -servername www.goodstock-x.com

# Or use online tools like SSL Labs
# https://www.ssllabs.com/ssltest/
```

## 🚨 Troubleshooting

### Common Issues

#### 1. 502 Bad Gateway Error

**Cause**: Application not running or wrong port

**Solution**:
```bash
# Check if application is running
pm2 status goodstock-x

# Restart application
pm2 restart goodstock-x

# Check port binding
netstat -tlnp | grep :3000
```

#### 2. SSL Certificate Issues

**Cause**: Domain not properly pointed or Let's Encrypt validation failed

**Solution**:
- Verify DNS settings point to correct IP
- Check domain propagation: `nslookup www.goodstock-x.com`
- Retry SSL certificate installation

#### 3. Reverse Proxy Not Working

**Cause**: Incorrect proxy configuration

**Solution**:
- Verify proxy destination: `http://127.0.0.1:3000`
- Check CloudPanel logs
- Restart CloudPanel services

### Log Locations

```bash
# CloudPanel logs
/var/log/cloudpanel/

# Nginx logs (if using CloudPanel's Nginx)
/var/log/nginx/

# Application logs
/home/goodstock-x/logs/

# PM2 logs
pm2 logs goodstock-x
```

## 📊 Performance Optimization

### 1. Enable Gzip Compression

In CloudPanel Nginx configuration:
```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
```

### 2. Configure Caching

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. Rate Limiting

```nginx
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req zone=api burst=20 nodelay;
```

## 🔐 Security Recommendations

1. **Firewall Configuration**:
   - Only allow necessary ports (80, 443, 22)
   - Block direct access to port 3000 from external sources

2. **Regular Updates**:
   - Keep CloudPanel updated
   - Update SSL certificates before expiration
   - Monitor security advisories

3. **Backup Strategy**:
   - Regular site backups through CloudPanel
   - Database backups
   - Configuration backups

## 📞 Support Resources

- **CloudPanel Documentation**: https://www.cloudpanel.io/docs/
- **CloudPanel Community**: https://community.cloudpanel.io/
- **Let's Encrypt Documentation**: https://letsencrypt.org/docs/

---

**✅ Configuration Complete!**

Your Goodstock-X e-commerce application should now be accessible at:
- **HTTP**: http://www.goodstock-x.com (redirects to HTTPS)
- **HTTPS**: https://www.goodstock-x.com

**Next Steps**:
1. Test all application functionality
2. Set up monitoring and alerting
3. Configure regular backups
4. Implement performance monitoring