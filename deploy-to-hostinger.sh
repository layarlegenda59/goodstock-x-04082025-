#!/bin/bash

# Deployment script for Goodstock-X E-commerce Platform
# Deploy Next.js + Supabase app to Hostinger VPS with CloudPanel
# Domain: www.goodstock-x.com
# Site User: goodstock-x
# App Directory: /home/goodstock-x/htdocs/goodstock-x

set -e  # Exit on any error

echo "🚀 Starting deployment of Goodstock-X to Hostinger VPS..."

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

# Check if running as goodstock-x user
if [ "$(whoami)" != "goodstock-x" ]; then
    print_error "This script must be run as the goodstock-x user"
    print_status "Please switch to goodstock-x user: sudo su - goodstock-x"
    exit 1
fi

# Step 1: Clone GitHub repository
print_status "Step 1: Cloning GitHub repository..."
cd /home/goodstock-x/htdocs

# Remove existing directory if it exists
if [ -d "goodstock-x" ]; then
    print_warning "Existing goodstock-x directory found. Backing up..."
    mv goodstock-x goodstock-x-backup-$(date +%Y%m%d-%H%M%S)
fi

git clone https://github.com/layarlegenda59/goodstock-x-04082025-.git goodstock-x
cd goodstock-x
print_success "Repository cloned successfully"

# Step 2: Install dependencies
print_status "Step 2: Installing dependencies..."
npm install
print_success "Dependencies installed successfully"

# Step 3: Setup environment variables
print_status "Step 3: Setting up environment variables..."
cat <<EOF > .env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://eldhtxtnwdanyavkikap.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Database Configuration
DATABASE_URL=your_database_url_here

# JWT Secret for authentication
JWT_SECRET=your_jwt_secret_here

# Production Environment
NODE_ENV=production

# Next.js Configuration
NEXTAUTH_URL=https://www.goodstock-x.com
NEXTAUTH_SECRET=your_nextauth_secret_here
EOF

print_warning "⚠️  IMPORTANT: Please update the .env file with your actual credentials:"
print_warning "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
print_warning "   - DATABASE_URL"
print_warning "   - JWT_SECRET"
print_warning "   - NEXTAUTH_SECRET"
print_status "Environment file created at: $(pwd)/.env"

# Step 4: Build the project
print_status "Step 4: Building the project..."
npm run build
print_success "Project built successfully"

# Step 5: Install PM2 globally and configure
print_status "Step 5: Setting up PM2 process manager..."

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    print_status "Installing PM2 globally..."
    npm install -g pm2
fi

# Stop existing PM2 process if running
if pm2 list | grep -q "goodstock-x"; then
    print_status "Stopping existing goodstock-x process..."
    pm2 stop goodstock-x
    pm2 delete goodstock-x
fi

# Create PM2 ecosystem file
cat <<EOF > ecosystem.config.js
module.exports = {
  apps: [{
    name: 'goodstock-x',
    script: 'npm',
    args: 'start',
    cwd: '/home/goodstock-x/htdocs/goodstock-x',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/home/goodstock-x/logs/goodstock-x-error.log',
    out_file: '/home/goodstock-x/logs/goodstock-x-out.log',
    log_file: '/home/goodstock-x/logs/goodstock-x-combined.log',
    time: true
  }]
};
EOF

# Create logs directory
mkdir -p /home/goodstock-x/logs

# Start the application with PM2
print_status "Starting application with PM2..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup
print_success "Application started with PM2"

# Step 6: Create deployment script for future updates
print_status "Step 6: Creating deployment script for future updates..."
cat <<EOF > deploy.sh
#!/bin/bash

# Quick deployment script for Goodstock-X updates
# Usage: ./deploy.sh

set -e

echo "🔄 Starting deployment update..."

# Navigate to project directory
cd /home/goodstock-x/htdocs/goodstock-x

# Pull latest changes
echo "📥 Pulling latest changes from GitHub..."
git pull origin main

# Install any new dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building project..."
npm run build

# Restart PM2 process
echo "🔄 Restarting application..."
pm2 restart goodstock-x

echo "✅ Deployment update completed successfully!"
echo "🌐 Application is running at: https://www.goodstock-x.com"
EOF

chmod +x deploy.sh
print_success "Deployment script created: $(pwd)/deploy.sh"

print_success "🎉 Deployment completed successfully!"

echo ""
echo "📋 NEXT STEPS - CloudPanel Configuration:"
echo "==========================================="
print_status "1. Open CloudPanel at: https://31.97.222.15:8443"
print_status "2. Login to your CloudPanel admin account"
print_status "3. Navigate to Sites → www.goodstock-x.com"
print_status "4. Go to 'Reverse Proxy' section"
print_status "5. Configure reverse proxy settings:"
echo "   - Source: /"
echo "   - Destination: http://127.0.0.1:3000"
print_status "6. Enable 'Let's Encrypt SSL Certificate'"
print_status "7. Save the configuration"
echo ""
print_status "🔧 Application Management Commands:"
echo "   - Check status: pm2 status"
echo "   - View logs: pm2 logs goodstock-x"
echo "   - Restart app: pm2 restart goodstock-x"
echo "   - Deploy updates: ./deploy.sh"
echo ""
print_warning "⚠️  Remember to update your .env file with actual credentials!"
print_success "🌐 Your application will be available at: https://www.goodstock-x.com"

echo ""
echo "📊 Current PM2 Status:"
pm2 status

echo ""
print_success "Deployment script execution completed! 🚀"