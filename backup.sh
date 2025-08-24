#!/bin/bash

# Goodstock-X Backup Script
# This script creates backups of the application, database, and configuration files

set -e

# Configuration
APP_NAME="goodstock-x"
APP_DIR="/home/goodstock-x/htdocs/goodstock-x"
BACKUP_DIR="/home/goodstock-x/backups"
LOG_FILE="/home/goodstock-x/logs/backup.log"
RETENTION_DAYS=30
DATE=$(date +%Y%m%d-%H%M%S)

# Supabase configuration (if using local database)
SUPABASE_PROJECT_ID="eldhtxtnwdanyavkikap"
SUPABASE_URL="https://eldhtxtnwdanyavkikap.supabase.co"

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

# Function to log messages
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

# Function to create backup directory structure
setup_backup_dirs() {
    print_status "Setting up backup directories..."
    
    mkdir -p "$BACKUP_DIR/app"
    mkdir -p "$BACKUP_DIR/config"
    mkdir -p "$BACKUP_DIR/logs"
    mkdir -p "$BACKUP_DIR/database"
    
    print_success "Backup directories created"
    log_message "Backup directories setup completed"
}

# Function to backup application files
backup_application() {
    print_status "Backing up application files..."
    
    local backup_file="$BACKUP_DIR/app/goodstock-x-app-$DATE.tar.gz"
    
    # Create application backup excluding node_modules and .next
    tar -czf "$backup_file" \
        --exclude="node_modules" \
        --exclude=".next" \
        --exclude=".git" \
        --exclude="*.log" \
        --exclude="backups" \
        -C "$(dirname "$APP_DIR")" \
        "$(basename "$APP_DIR")"
    
    if [ $? -eq 0 ]; then
        local file_size=$(du -h "$backup_file" | cut -f1)
        print_success "Application backup created: $backup_file ($file_size)"
        log_message "Application backup created: $backup_file ($file_size)"
    else
        print_error "Failed to create application backup"
        log_message "Application backup failed"
        return 1
    fi
}

# Function to backup configuration files
backup_configuration() {
    print_status "Backing up configuration files..."
    
    local config_backup="$BACKUP_DIR/config/config-$DATE.tar.gz"
    
    # Create temporary directory for config files
    local temp_config_dir="/tmp/goodstock-x-config-$DATE"
    mkdir -p "$temp_config_dir"
    
    # Copy important configuration files
    cp "$APP_DIR/.env" "$temp_config_dir/" 2>/dev/null || print_warning "No .env file found"
    cp "$APP_DIR/ecosystem.config.js" "$temp_config_dir/" 2>/dev/null || print_warning "No ecosystem.config.js found"
    cp "$APP_DIR/package.json" "$temp_config_dir/" 2>/dev/null || print_warning "No package.json found"
    cp "$APP_DIR/next.config.js" "$temp_config_dir/" 2>/dev/null || print_warning "No next.config.js found"
    cp "$APP_DIR/tailwind.config.ts" "$temp_config_dir/" 2>/dev/null || print_warning "No tailwind.config.ts found"
    cp "$APP_DIR/tsconfig.json" "$temp_config_dir/" 2>/dev/null || print_warning "No tsconfig.json found"
    
    # Backup PM2 configuration
    pm2 save --force
    cp ~/.pm2/dump.pm2 "$temp_config_dir/" 2>/dev/null || print_warning "No PM2 dump found"
    
    # Create configuration backup
    tar -czf "$config_backup" -C "$(dirname "$temp_config_dir")" "$(basename "$temp_config_dir")"
    
    # Cleanup temporary directory
    rm -rf "$temp_config_dir"
    
    if [ $? -eq 0 ]; then
        local file_size=$(du -h "$config_backup" | cut -f1)
        print_success "Configuration backup created: $config_backup ($file_size)"
        log_message "Configuration backup created: $config_backup ($file_size)"
    else
        print_error "Failed to create configuration backup"
        log_message "Configuration backup failed"
        return 1
    fi
}

# Function to backup logs
backup_logs() {
    print_status "Backing up logs..."
    
    local logs_backup="$BACKUP_DIR/logs/logs-$DATE.tar.gz"
    local logs_dir="/home/goodstock-x/logs"
    
    if [ -d "$logs_dir" ] && [ "$(ls -A "$logs_dir")" ]; then
        tar -czf "$logs_backup" -C "$(dirname "$logs_dir")" "$(basename "$logs_dir")"
        
        if [ $? -eq 0 ]; then
            local file_size=$(du -h "$logs_backup" | cut -f1)
            print_success "Logs backup created: $logs_backup ($file_size)"
            log_message "Logs backup created: $logs_backup ($file_size)"
        else
            print_error "Failed to create logs backup"
            log_message "Logs backup failed"
            return 1
        fi
    else
        print_warning "No logs found to backup"
        log_message "No logs found to backup"
    fi
}

# Function to backup database (Supabase export)
backup_database() {
    print_status "Backing up database..."
    
    # Note: For Supabase, we can't directly backup the database from the server
    # This function creates a placeholder and instructions
    
    local db_backup_info="$BACKUP_DIR/database/database-info-$DATE.txt"
    
    cat <<EOF > "$db_backup_info"
Goodstock-X Database Backup Information
Generated: $(date)

Database Type: Supabase (Cloud)
Project ID: $SUPABASE_PROJECT_ID
Project URL: $SUPABASE_URL

IMPORTANT: 
Supabase databases are automatically backed up by Supabase.
For manual backups, use the Supabase Dashboard:
1. Go to https://app.supabase.com/project/$SUPABASE_PROJECT_ID
2. Navigate to Settings > Database
3. Use the backup/restore functionality

For data export:
1. Use the SQL Editor to export specific tables
2. Use pg_dump if you have direct database access
3. Use the Supabase CLI for automated backups

Tables to backup:
- profiles
- products
- Any custom tables created for the application

Storage buckets to backup:
- product-images
- Any other storage buckets
EOF
    
    print_success "Database backup info created: $db_backup_info"
    log_message "Database backup info created: $db_backup_info"
    
    # If you have Supabase CLI configured, uncomment the following:
    # supabase db dump --file "$BACKUP_DIR/database/database-dump-$DATE.sql"
}

# Function to create a complete backup
create_complete_backup() {
    print_status "Creating complete backup..."
    
    local complete_backup="$BACKUP_DIR/goodstock-x-complete-$DATE.tar.gz"
    
    # Create a temporary directory for the complete backup
    local temp_complete_dir="/tmp/goodstock-x-complete-$DATE"
    mkdir -p "$temp_complete_dir"
    
    # Copy all backup components
    cp -r "$BACKUP_DIR/app" "$temp_complete_dir/" 2>/dev/null || true
    cp -r "$BACKUP_DIR/config" "$temp_complete_dir/" 2>/dev/null || true
    cp -r "$BACKUP_DIR/logs" "$temp_complete_dir/" 2>/dev/null || true
    cp -r "$BACKUP_DIR/database" "$temp_complete_dir/" 2>/dev/null || true
    
    # Create backup manifest
    cat <<EOF > "$temp_complete_dir/backup-manifest.txt"
Goodstock-X Complete Backup
Created: $(date)
Backup ID: $DATE
Server: $(hostname)
Application Directory: $APP_DIR
Backup Directory: $BACKUP_DIR

Contents:
- Application files (excluding node_modules, .next, .git)
- Configuration files (.env, ecosystem.config.js, etc.)
- Application logs
- Database backup information

Restore Instructions:
1. Extract this backup to a temporary location
2. Copy application files to the target directory
3. Restore configuration files
4. Install dependencies: npm install
5. Build application: npm run build
6. Restore database from Supabase backup
7. Start application with PM2
EOF
    
    # Create complete backup archive
    tar -czf "$complete_backup" -C "$(dirname "$temp_complete_dir")" "$(basename "$temp_complete_dir")"
    
    # Cleanup temporary directory
    rm -rf "$temp_complete_dir"
    
    if [ $? -eq 0 ]; then
        local file_size=$(du -h "$complete_backup" | cut -f1)
        print_success "Complete backup created: $complete_backup ($file_size)"
        log_message "Complete backup created: $complete_backup ($file_size)"
    else
        print_error "Failed to create complete backup"
        log_message "Complete backup failed"
        return 1
    fi
}

# Function to cleanup old backups
cleanup_old_backups() {
    print_status "Cleaning up old backups..."
    
    local deleted_count=0
    
    # Find and delete old backup files
    find "$BACKUP_DIR" -name "*.tar.gz" -mtime +"$RETENTION_DAYS" -type f | while read -r file; do
        rm -f "$file"
        ((deleted_count++))
        print_status "Deleted old backup: $(basename "$file")"
    done
    
    # Find and delete old backup info files
    find "$BACKUP_DIR" -name "*.txt" -mtime +"$RETENTION_DAYS" -type f | while read -r file; do
        rm -f "$file"
        ((deleted_count++))
        print_status "Deleted old backup info: $(basename "$file")"
    done
    
    print_success "Cleanup completed"
    log_message "Cleanup completed - retention period: $RETENTION_DAYS days"
}

# Function to list existing backups
list_backups() {
    print_status "Listing existing backups..."
    
    echo "\n📦 Application Backups:"
    ls -lh "$BACKUP_DIR/app/"*.tar.gz 2>/dev/null | awk '{print $9, $5, $6, $7, $8}' || echo "No application backups found"
    
    echo "\n⚙️  Configuration Backups:"
    ls -lh "$BACKUP_DIR/config/"*.tar.gz 2>/dev/null | awk '{print $9, $5, $6, $7, $8}' || echo "No configuration backups found"
    
    echo "\n📝 Log Backups:"
    ls -lh "$BACKUP_DIR/logs/"*.tar.gz 2>/dev/null | awk '{print $9, $5, $6, $7, $8}' || echo "No log backups found"
    
    echo "\n🗄️  Complete Backups:"
    ls -lh "$BACKUP_DIR/"goodstock-x-complete-*.tar.gz 2>/dev/null | awk '{print $9, $5, $6, $7, $8}' || echo "No complete backups found"
    
    echo "\n💾 Total Backup Size:"
    du -sh "$BACKUP_DIR" 2>/dev/null || echo "Backup directory not found"
}

# Function to restore from backup
restore_backup() {
    local backup_file="$1"
    
    if [ -z "$backup_file" ]; then
        print_error "Please specify a backup file to restore"
        echo "Usage: $0 --restore /path/to/backup.tar.gz"
        return 1
    fi
    
    if [ ! -f "$backup_file" ]; then
        print_error "Backup file not found: $backup_file"
        return 1
    fi
    
    print_warning "⚠️  This will restore the application from backup"
    print_warning "⚠️  Current application will be backed up first"
    
    read -p "Do you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Restore cancelled"
        return 0
    fi
    
    # Create backup of current state
    print_status "Creating backup of current state..."
    backup_application
    
    # Stop application
    print_status "Stopping application..."
    pm2 stop "$APP_NAME" || true
    
    # Extract backup
    print_status "Extracting backup..."
    local temp_restore_dir="/tmp/restore-$DATE"
    mkdir -p "$temp_restore_dir"
    tar -xzf "$backup_file" -C "$temp_restore_dir"
    
    # Restore application files
    print_status "Restoring application files..."
    rsync -av "$temp_restore_dir/"*/ "$APP_DIR/"
    
    # Install dependencies
    print_status "Installing dependencies..."
    cd "$APP_DIR"
    npm install
    
    # Build application
    print_status "Building application..."
    npm run build
    
    # Start application
    print_status "Starting application..."
    pm2 start "$APP_NAME"
    
    # Cleanup
    rm -rf "$temp_restore_dir"
    
    print_success "Restore completed successfully"
    log_message "Restore completed from: $backup_file"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTION]"
    echo "Options:"
    echo "  -a, --app        Backup application files only"
    echo "  -c, --config     Backup configuration files only"
    echo "  -l, --logs       Backup logs only"
    echo "  -d, --database   Backup database info only"
    echo "  -f, --full       Create complete backup (default)"
    echo "  --list           List existing backups"
    echo "  --cleanup        Cleanup old backups"
    echo "  --restore FILE   Restore from backup file"
    echo "  --help           Show this help message"
}

# Create necessary directories
mkdir -p "$(dirname "$LOG_FILE")"
setup_backup_dirs

# Parse command line arguments
case "${1:-}" in
    -a|--app)
        backup_application
        ;;
    -c|--config)
        backup_configuration
        ;;
    -l|--logs)
        backup_logs
        ;;
    -d|--database)
        backup_database
        ;;
    -f|--full)
        backup_application
        backup_configuration
        backup_logs
        backup_database
        create_complete_backup
        ;;
    --list)
        list_backups
        ;;
    --cleanup)
        cleanup_old_backups
        ;;
    --restore)
        restore_backup "$2"
        ;;
    --help)
        show_usage
        ;;
    "")
        # Default: full backup
        backup_application
        backup_configuration
        backup_logs
        backup_database
        create_complete_backup
        cleanup_old_backups
        ;;
    *)
        echo "Unknown option: $1"
        show_usage
        exit 1
        ;;
esac

print_success "🎉 Backup operation completed!"
log_message "Backup operation completed successfully"