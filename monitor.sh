#!/bin/bash

# Goodstock-X Monitoring and Health Check Script
# This script monitors the application health and performs basic maintenance

set -e

# Configuration
APP_NAME="goodstock-x"
APP_URL="https://www.goodstock-x.com"
LOCAL_URL="http://localhost:3000"
LOG_FILE="/home/goodstock-x/logs/monitor.log"
ALERT_EMAIL="admin@goodstock-x.com"  # Configure your email
MAX_MEMORY_MB=1024
MAX_CPU_PERCENT=80

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

# Function to send alerts (configure with your preferred method)
send_alert() {
    local message="$1"
    log_message "ALERT: $message"
    print_error "ALERT: $message"
    
    # Uncomment and configure your preferred alerting method:
    # echo "$message" | mail -s "Goodstock-X Alert" "$ALERT_EMAIL"
    # curl -X POST -H 'Content-type: application/json' --data '{"text":"'$message'"}' YOUR_SLACK_WEBHOOK_URL
}

# Function to check if PM2 process is running
check_pm2_process() {
    print_status "Checking PM2 process..."
    
    if pm2 list | grep -q "$APP_NAME"; then
        local status=$(pm2 jlist | jq -r '.[] | select(.name=="'$APP_NAME'") | .pm2_env.status')
        if [ "$status" = "online" ]; then
            print_success "PM2 process is running"
            log_message "PM2 process check: PASSED"
            return 0
        else
            print_error "PM2 process is not online (status: $status)"
            log_message "PM2 process check: FAILED - Status: $status"
            return 1
        fi
    else
        print_error "PM2 process not found"
        log_message "PM2 process check: FAILED - Process not found"
        return 1
    fi
}

# Function to check application health via HTTP
check_http_health() {
    print_status "Checking HTTP health..."
    
    # Check local endpoint
    if curl -f -s --max-time 10 "$LOCAL_URL" > /dev/null; then
        print_success "Local HTTP check passed"
        log_message "Local HTTP check: PASSED"
    else
        print_error "Local HTTP check failed"
        log_message "Local HTTP check: FAILED"
        return 1
    fi
    
    # Check public endpoint
    if curl -f -s --max-time 10 "$APP_URL" > /dev/null; then
        print_success "Public HTTP check passed"
        log_message "Public HTTP check: PASSED"
        return 0
    else
        print_error "Public HTTP check failed"
        log_message "Public HTTP check: FAILED"
        return 1
    fi
}

# Function to check system resources
check_system_resources() {
    print_status "Checking system resources..."
    
    # Check memory usage
    local memory_usage=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
    if [ "$memory_usage" -gt 90 ]; then
        print_warning "High memory usage: ${memory_usage}%"
        log_message "Memory usage warning: ${memory_usage}%"
    else
        print_success "Memory usage: ${memory_usage}%"
        log_message "Memory usage: ${memory_usage}%"
    fi
    
    # Check disk usage
    local disk_usage=$(df /home/goodstock-x | tail -1 | awk '{print $5}' | sed 's/%//')
    if [ "$disk_usage" -gt 85 ]; then
        print_warning "High disk usage: ${disk_usage}%"
        log_message "Disk usage warning: ${disk_usage}%"
    else
        print_success "Disk usage: ${disk_usage}%"
        log_message "Disk usage: ${disk_usage}%"
    fi
    
    # Check CPU load
    local cpu_load=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}')
    if (( $(echo "$cpu_load > 80" | bc -l) )); then
        print_warning "High CPU usage: ${cpu_load}%"
        log_message "CPU usage warning: ${cpu_load}%"
    else
        print_success "CPU usage: ${cpu_load}%"
        log_message "CPU usage: ${cpu_load}%"
    fi
}

# Function to check application-specific metrics
check_app_metrics() {
    print_status "Checking application metrics..."
    
    # Check PM2 memory usage
    local app_memory=$(pm2 jlist | jq -r '.[] | select(.name=="'$APP_NAME'") | .monit.memory')
    local app_memory_mb=$((app_memory / 1024 / 1024))
    
    if [ "$app_memory_mb" -gt "$MAX_MEMORY_MB" ]; then
        print_warning "Application memory usage high: ${app_memory_mb}MB"
        log_message "Application memory warning: ${app_memory_mb}MB"
    else
        print_success "Application memory usage: ${app_memory_mb}MB"
        log_message "Application memory usage: ${app_memory_mb}MB"
    fi
    
    # Check PM2 CPU usage
    local app_cpu=$(pm2 jlist | jq -r '.[] | select(.name=="'$APP_NAME'") | .monit.cpu')
    if (( $(echo "$app_cpu > $MAX_CPU_PERCENT" | bc -l) )); then
        print_warning "Application CPU usage high: ${app_cpu}%"
        log_message "Application CPU warning: ${app_cpu}%"
    else
        print_success "Application CPU usage: ${app_cpu}%"
        log_message "Application CPU usage: ${app_cpu}%"
    fi
    
    # Check restart count
    local restart_count=$(pm2 jlist | jq -r '.[] | select(.name=="'$APP_NAME'") | .pm2_env.restart_time')
    print_status "Application restart count: $restart_count"
    log_message "Application restart count: $restart_count"
}

# Function to check SSL certificate expiration
check_ssl_certificate() {
    print_status "Checking SSL certificate..."
    
    local cert_info=$(echo | openssl s_client -servername www.goodstock-x.com -connect www.goodstock-x.com:443 2>/dev/null | openssl x509 -noout -dates 2>/dev/null)
    
    if [ $? -eq 0 ]; then
        local expiry_date=$(echo "$cert_info" | grep notAfter | cut -d= -f2)
        local expiry_timestamp=$(date -d "$expiry_date" +%s)
        local current_timestamp=$(date +%s)
        local days_until_expiry=$(( (expiry_timestamp - current_timestamp) / 86400 ))
        
        if [ "$days_until_expiry" -lt 30 ]; then
            print_warning "SSL certificate expires in $days_until_expiry days"
            log_message "SSL certificate warning: expires in $days_until_expiry days"
        else
            print_success "SSL certificate valid for $days_until_expiry days"
            log_message "SSL certificate valid for $days_until_expiry days"
        fi
    else
        print_error "Failed to check SSL certificate"
        log_message "SSL certificate check: FAILED"
    fi
}

# Function to restart application if needed
restart_application() {
    print_status "Restarting application..."
    pm2 restart "$APP_NAME"
    sleep 10  # Wait for application to start
    
    if check_pm2_process && check_http_health; then
        print_success "Application restarted successfully"
        log_message "Application restart: SUCCESS"
        return 0
    else
        print_error "Application restart failed"
        log_message "Application restart: FAILED"
        send_alert "Failed to restart $APP_NAME application"
        return 1
    fi
}

# Function to perform maintenance tasks
perform_maintenance() {
    print_status "Performing maintenance tasks..."
    
    # Clean old logs (keep last 30 days)
    find /home/goodstock-x/logs -name "*.log" -mtime +30 -delete 2>/dev/null || true
    
    # Clean PM2 logs
    pm2 flush
    
    # Clean old backups (keep last 7 days)
    find /home/goodstock-x/backups -name "*.tar.gz" -mtime +7 -delete 2>/dev/null || true
    
    print_success "Maintenance tasks completed"
    log_message "Maintenance tasks completed"
}

# Main monitoring function
run_health_check() {
    echo "🔍 Starting health check for $APP_NAME..."
    log_message "Health check started"
    
    local failed_checks=0
    
    # Run all checks
    check_pm2_process || ((failed_checks++))
    check_http_health || ((failed_checks++))
    check_system_resources
    check_app_metrics
    check_ssl_certificate
    
    # If critical checks failed, try to restart
    if [ "$failed_checks" -gt 0 ]; then
        print_warning "$failed_checks critical checks failed"
        send_alert "$failed_checks critical checks failed for $APP_NAME"
        
        # Attempt restart if PM2 or HTTP checks failed
        if ! check_pm2_process || ! check_http_health; then
            restart_application
        fi
    else
        print_success "All health checks passed"
        log_message "All health checks passed"
    fi
    
    echo "✅ Health check completed"
    log_message "Health check completed"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTION]"
    echo "Options:"
    echo "  -h, --health     Run health check (default)"
    echo "  -m, --maintenance Run maintenance tasks"
    echo "  -r, --restart    Restart application"
    echo "  -s, --status     Show application status"
    echo "  --help           Show this help message"
}

# Function to show application status
show_status() {
    echo "📊 Goodstock-X Application Status"
    echo "================================="
    
    # PM2 status
    echo "\n🔧 PM2 Status:"
    pm2 status "$APP_NAME"
    
    # System resources
    echo "\n💾 System Resources:"
    echo "Memory: $(free -h | grep Mem | awk '{print $3"/"$2}')"
    echo "Disk: $(df -h /home/goodstock-x | tail -1 | awk '{print $3"/"$2" ("$5" used)"}')"
    echo "Load: $(uptime | awk -F'load average:' '{print $2}')"
    
    # Application metrics
    echo "\n📈 Application Metrics:"
    local app_memory=$(pm2 jlist | jq -r '.[] | select(.name=="'$APP_NAME'") | .monit.memory')
    local app_memory_mb=$((app_memory / 1024 / 1024))
    local app_cpu=$(pm2 jlist | jq -r '.[] | select(.name=="'$APP_NAME'") | .monit.cpu')
    echo "App Memory: ${app_memory_mb}MB"
    echo "App CPU: ${app_cpu}%"
    
    # Recent logs
    echo "\n📝 Recent Logs (last 10 lines):"
    pm2 logs "$APP_NAME" --lines 10 --nostream
}

# Create log directory if it doesn't exist
mkdir -p "$(dirname "$LOG_FILE")"

# Parse command line arguments
case "${1:-}" in
    -h|--health)
        run_health_check
        ;;
    -m|--maintenance)
        perform_maintenance
        ;;
    -r|--restart)
        restart_application
        ;;
    -s|--status)
        show_status
        ;;
    --help)
        show_usage
        ;;
    "")
        run_health_check
        ;;
    *)
        echo "Unknown option: $1"
        show_usage
        exit 1
        ;;
esac