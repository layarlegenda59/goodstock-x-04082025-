#!/bin/bash

# =============================================================================
# Next.js Deployment Script for VPS (Hostinger Cloud Panel)
# =============================================================================
# This script builds Next.js in standalone mode and deploys to VPS using rsync
# 
# Required Environment Variables:
# - VPS_HOST: VPS hostname or IP address
# - VPS_USER: SSH username for VPS
# - VPS_PATH: Target directory on VPS (e.g., /var/www/goodstock-x)
# 
# Usage:
#   ./deploy.sh
# =============================================================================

set -e  # Exit on any error

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

# Function to check if required environment variables are set
check_env_vars() {
    print_status "Checking environment variables..."
    
    if [ -z "$VPS_HOST" ]; then
        print_error "VPS_HOST environment variable is not set"
        exit 1
    fi
    
    if [ -z "$VPS_USER" ]; then
        print_error "VPS_USER environment variable is not set"
        exit 1
    fi
    
    if [ -z "$VPS_PATH" ]; then
        print_error "VPS_PATH environment variable is not set"
        exit 1
    fi
    
    print_success "Environment variables validated"
}

# Function to check if Node.js 18 is installed
check_node_version() {
    print_status "Checking Node.js version..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -ne 18 ]; then
        print_warning "Node.js version is $NODE_VERSION, but version 18 is recommended"
    else
        print_success "Node.js 18 detected"
    fi
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    if [ ! -f "package.json" ]; then
        print_error "package.json not found. Are you in the correct directory?"
        exit 1
    fi
    
    npm ci
    print_success "Dependencies installed"
}

# Function to build the application
build_application() {
    print_status "Building Next.js application in standalone mode..."
    
    # Verify next.config.js has standalone output
    if ! grep -q "output.*standalone" next.config.js; then
        print_warning "next.config.js may not have 'output: standalone' configured"
    fi
    
    npm run build
    
    # Verify build artifacts exist
    if [ ! -d ".next/standalone" ]; then
        print_error "Standalone build not found. Check next.config.js configuration"
        exit 1
    fi
    
    print_success "Application built successfully"
}

# Function to package deployment files
package_files() {
    print_status "Packaging deployment files..."
    
    # Create deployment directory
    DEPLOY_DIR="deploy-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$DEPLOY_DIR"
    
    # Copy required files and directories
    print_status "Copying .next/standalone..."
    cp -r .next/standalone/* "$DEPLOY_DIR/"
    
    print_status "Copying .next/static..."
    mkdir -p "$DEPLOY_DIR/.next"
    cp -r .next/static "$DEPLOY_DIR/.next/"
    
    print_status "Copying public directory..."
    if [ -d "public" ]; then
        cp -r public "$DEPLOY_DIR/"
    fi
    
    print_status "Copying configuration files..."
    cp package.json "$DEPLOY_DIR/"
    cp next.config.js "$DEPLOY_DIR/"
    
    # Copy environment file if it exists
    if [ -f ".env.local" ]; then
        print_status "Copying .env.local..."
        cp .env.local "$DEPLOY_DIR/"
    fi
    
    # Create a simple start script
    cat > "$DEPLOY_DIR/start.sh" << 'EOF'
#!/bin/bash
# Start script for Next.js standalone application
echo "Starting Next.js application..."
node server.js
EOF
    chmod +x "$DEPLOY_DIR/start.sh"
    
    print_success "Files packaged in $DEPLOY_DIR"
    echo "$DEPLOY_DIR"  # Return the deploy directory name
}

# Function to upload files to VPS
upload_to_vps() {
    local deploy_dir=$1
    print_status "Uploading files to VPS..."
    
    # Test SSH connection
    print_status "Testing SSH connection to $VPS_USER@$VPS_HOST..."
    if ! ssh -o ConnectTimeout=10 -o BatchMode=yes "$VPS_USER@$VPS_HOST" exit 2>/dev/null; then
        print_error "Cannot connect to VPS. Check SSH keys and connection"
        exit 1
    fi
    
    # Create target directory on VPS
    print_status "Creating target directory on VPS..."
    ssh "$VPS_USER@$VPS_HOST" "mkdir -p $VPS_PATH"
    
    # Backup existing deployment (if exists)
    print_status "Creating backup of existing deployment..."
    ssh "$VPS_USER@$VPS_HOST" "if [ -d '$VPS_PATH/current' ]; then mv '$VPS_PATH/current' '$VPS_PATH/backup-$(date +%Y%m%d-%H%M%S)'; fi"
    
    # Upload new files
    print_status "Syncing files to VPS..."
    rsync -avz --delete "$deploy_dir/" "$VPS_USER@$VPS_HOST:$VPS_PATH/current/"
    
    print_success "Files uploaded successfully"
}

# Function to install production dependencies on VPS
install_production_deps() {
    print_status "Installing production dependencies on VPS..."
    
    ssh "$VPS_USER@$VPS_HOST" << EOF
cd $VPS_PATH/current
echo "Installing production dependencies..."
npm install --production --silent
echo "Production dependencies installed"
EOF
    
    print_success "Production dependencies installed on VPS"
}

# Function to restart application with PM2
restart_application() {
    print_status "Restarting application with PM2..."
    
    ssh "$VPS_USER@$VPS_HOST" << EOF
cd $VPS_PATH/current

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "PM2 not found, installing globally..."
    npm install -g pm2
fi

# Check if app is already running
if pm2 describe goodstock-x > /dev/null 2>&1; then
    echo "Restarting existing PM2 process..."
    pm2 restart goodstock-x
else
    echo "Starting new PM2 process..."
    pm2 start server.js --name goodstock-x
fi

# Save PM2 configuration
pm2 save

# Show status
pm2 status
EOF
    
    print_success "Application restarted with PM2"
}

# Function to cleanup local deployment files
cleanup() {
    local deploy_dir=$1
    if [ -n "$deploy_dir" ] && [ -d "$deploy_dir" ]; then
        print_status "Cleaning up local deployment files..."
        rm -rf "$deploy_dir"
        print_success "Cleanup completed"
    fi
}

# Main deployment function
main() {
    print_status "Starting deployment process..."
    echo "==========================================="
    echo "Next.js VPS Deployment Script"
    echo "Target: $VPS_USER@$VPS_HOST:$VPS_PATH"
    echo "==========================================="
    
    # Check prerequisites
    check_env_vars
    check_node_version
    
    # Build and package
    install_dependencies
    build_application
    DEPLOY_DIR=$(package_files)
    
    # Deploy to VPS
    upload_to_vps "$DEPLOY_DIR"
    install_production_deps
    restart_application
    
    # Cleanup
    cleanup "$DEPLOY_DIR"
    
    print_success "Deployment completed successfully!"
    echo "==========================================="
    echo "Your application should now be running on the VPS"
    echo "You can check the status with: ssh $VPS_USER@$VPS_HOST 'pm2 status'"
    echo "==========================================="
}

# Trap to cleanup on script exit
trap 'cleanup "$DEPLOY_DIR"' EXIT

# Run main function
main "$@"