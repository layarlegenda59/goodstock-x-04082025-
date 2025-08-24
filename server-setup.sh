#!/bin/bash

# Server Setup Script for Goodstock-X Deployment
# This script prepares a fresh Ubuntu/Debian server for the application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo "🚀 Setting up server for Goodstock-X deployment..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "This script must be run as root"
    print_status "Please run: sudo $0"
    exit 1
fi

# Update system packages
print_status "Updating system packages..."
apt update && apt upgrade -y
print_success "System packages updated"

# Install essential packages
print_status "Installing essential packages..."
apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release
print_success "Essential packages installed"

# Install Node.js 18.x
print_status "Installing Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
print_success "Node.js $(node --version) installed"
print_success "npm $(npm --version) installed"

# Install PM2 globally
print_status "Installing PM2 process manager..."
npm install -g pm2
print_success "PM2 $(pm2 --version) installed"

# Install Nginx (if not using CloudPanel)
print_status "Installing Nginx..."
apt install -y nginx
systemctl enable nginx
systemctl start nginx
print_success "Nginx installed and started"

# Install Certbot for SSL certificates
print_status "Installing Certbot for SSL certificates..."
apt install -y certbot python3-certbot-nginx
print_success "Certbot installed"

# Create goodstock-x user if it doesn't exist
if ! id "goodstock-x" &>/dev/null; then
    print_status "Creating goodstock-x user..."
    useradd -m -s /bin/bash goodstock-x
    usermod -aG sudo goodstock-x
    
    # Create necessary directories
    mkdir -p /home/goodstock-x/htdocs
    mkdir -p /home/goodstock-x/logs
    chown -R goodstock-x:goodstock-x /home/goodstock-x
    
    print_success "User goodstock-x created"
else
    print_warning "User goodstock-x already exists"
fi

# Configure firewall
print_status "Configuring UFW firewall..."
ufw --force enable
ufw allow ssh
ufw allow 80
ufw allow 443
ufw allow 3000  # For direct access during setup
print_success "Firewall configured"

# Install Docker (optional)
print_status "Installing Docker (optional)..."
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
systemctl enable docker
systemctl start docker
usermod -aG docker goodstock-x
print_success "Docker installed"

# Configure Nginx for reverse proxy (if not using CloudPanel)
print_status "Creating Nginx configuration template..."
cat <<EOF > /etc/nginx/sites-available/goodstock-x
server {
    listen 80;
    server_name www.goodstock-x.com goodstock-x.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable the site (commented out by default since using CloudPanel)
# ln -sf /etc/nginx/sites-available/goodstock-x /etc/nginx/sites-enabled/
# nginx -t && systemctl reload nginx

print_success "Nginx configuration template created"

# Set up log rotation
print_status "Setting up log rotation..."
cat <<EOF > /etc/logrotate.d/goodstock-x
/home/goodstock-x/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 goodstock-x goodstock-x
    postrotate
        pm2 reloadLogs
    endscript
}
EOF

print_success "Log rotation configured"

# Create system service for PM2 (alternative to pm2 startup)
print_status "Creating systemd service for PM2..."
cat <<EOF > /etc/systemd/system/goodstock-x.service
[Unit]
Description=Goodstock-X E-commerce Application
After=network.target

[Service]
Type=simple
User=goodstock-x
WorkingDirectory=/home/goodstock-x/htdocs/goodstock-x
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
print_success "Systemd service created (disabled by default)"

# Install monitoring tools
print_status "Installing monitoring tools..."
apt install -y htop iotop nethogs ncdu
print_success "Monitoring tools installed"

# Create backup directory
print_status "Creating backup directory..."
mkdir -p /home/goodstock-x/backups
chown goodstock-x:goodstock-x /home/goodstock-x/backups
print_success "Backup directory created"

# Set up automatic security updates
print_status "Configuring automatic security updates..."
apt install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades
print_success "Automatic security updates configured"

# Create maintenance script
print_status "Creating maintenance script..."
cat <<EOF > /home/goodstock-x/maintenance.sh
#!/bin/bash

# Goodstock-X Maintenance Script

echo "🔧 Running maintenance tasks..."

# Update system packages
sudo apt update && sudo apt upgrade -y

# Clean up old logs
find /home/goodstock-x/logs -name "*.log" -mtime +30 -delete

# Clean up old backups (keep last 7 days)
find /home/goodstock-x/backups -name "*.tar.gz" -mtime +7 -delete

# Restart PM2 processes
pm2 restart all

# Check disk usage
df -h

echo "✅ Maintenance completed"
EOF

chown goodstock-x:goodstock-x /home/goodstock-x/maintenance.sh
chmod +x /home/goodstock-x/maintenance.sh
print_success "Maintenance script created"

# Final system optimization
print_status "Optimizing system settings..."

# Increase file limits
echo "goodstock-x soft nofile 65536" >> /etc/security/limits.conf
echo "goodstock-x hard nofile 65536" >> /etc/security/limits.conf

# Optimize sysctl settings
cat <<EOF >> /etc/sysctl.conf

# Goodstock-X optimizations
net.core.somaxconn = 65536
net.ipv4.tcp_max_syn_backlog = 65536
net.ipv4.ip_local_port_range = 1024 65535
EOF

sysctl -p
print_success "System optimizations applied"

print_success "🎉 Server setup completed successfully!"

echo ""
echo "📋 NEXT STEPS:"
echo "============="
print_status "1. Switch to goodstock-x user: sudo su - goodstock-x"
print_status "2. Run the deployment script: ./deploy-to-hostinger.sh"
print_status "3. Configure CloudPanel reverse proxy"
print_status "4. Set up SSL certificate"
echo ""
print_status "📊 System Information:"
echo "   - Node.js: $(node --version)"
echo "   - npm: $(npm --version)"
echo "   - PM2: $(pm2 --version)"
echo "   - Docker: $(docker --version)"
echo ""
print_warning "⚠️  Remember to:"
print_warning "   - Configure your domain DNS to point to this server"
print_warning "   - Update firewall rules as needed"
print_warning "   - Set up regular backups"
print_warning "   - Configure monitoring and alerting"
echo ""
print_success "Server is ready for Goodstock-X deployment! 🚀"