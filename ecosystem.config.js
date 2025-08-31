module.exports = {
  apps: [{
    name: 'goodstock-x',
    script: 'server.js',  // Use standalone server.js instead of npm start
    cwd: process.env.VPS_PATH ? `${process.env.VPS_PATH}/current` : '/var/www/goodstock-x/current',
    instances: 1,
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    
    // Environment variables
    env: {
      NODE_ENV: 'production',
      PORT: process.env.PORT || 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: process.env.PORT || 3000
    },
    
    // Logging configuration
    error_file: process.env.VPS_PATH ? `${process.env.VPS_PATH}/logs/error.log` : '/var/www/goodstock-x/logs/error.log',
    out_file: process.env.VPS_PATH ? `${process.env.VPS_PATH}/logs/out.log` : '/var/www/goodstock-x/logs/out.log',
    log_file: process.env.VPS_PATH ? `${process.env.VPS_PATH}/logs/combined.log` : '/var/www/goodstock-x/logs/combined.log',
    time: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    
    // Restart policy
    kill_timeout: 5000,
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s',
    
    // Health monitoring
    wait_ready: true,
    listen_timeout: 8000,
    health_check_grace_period: 3000
  }],
  
  // Deployment configuration (optional)
  deploy: {
    production: {
      user: process.env.VPS_USER || 'root',
      host: process.env.VPS_HOST || 'your-vps-host.com',
      ref: 'origin/main',
      repo: 'https://github.com/your-username/goodstock-x.git',
      path: process.env.VPS_PATH || '/var/www/goodstock-x',
      'post-deploy': 'npm install --production && pm2 reload ecosystem.config.js --env production && pm2 save'
    }
  }
};