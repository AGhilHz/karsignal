#!/bin/bash
# ============================================
# Career Transparency Platform - Ubuntu 24 Deployment
# ============================================
set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -echo -e "${GREEN}  Karsignal.ir - Career Transparency Platform${NC}"
echo -e "${GREEN}  Ubuntu 24.04 LTS${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# ─── Check if running as root ─────────────────────────────
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Please run as root: sudo bash deploy-ubuntu24.sh${NC}"
    exit 1
fi

# ─── Get user inputs ──────────────────────────────────────
read -p "Enter your domain (e.g., example.com): " DOMAIN
read -p "Enter your email for SSL certificate: " EMAIL
read -p "Enter database password (or press Enter for auto-generate): " DB_PASSWORD
read -p "Enter Redis password (or press Enter for auto-generate): " REDIS_PASSWORD
read -p "Enter JWT secret (or press Enter for auto-generate): " JWT_SECRET

# Auto-generate passwords if empty
if [ -z "$DB_PASSWORD" ]; then
    DB_PASSWORD=$(openssl rand -base64 24)
    echo -e "${YELLOW}Generated DB password: ${DB_PASSWORD}${NC}"
fi
if [ -z "$REDIS_PASSWORD" ]; then
    REDIS_PASSWORD=$(openssl rand -base64 24)
    echo -e "${YELLOW}Generated Redis password: ${REDIS_PASSWORD}${NC}"
fi
if [ -z "$JWT_SECRET" ]; then
    JWT_SECRET=$(openssl rand -base64 48)
    echo -e "${YELLOW}Generated JWT secret: ${JWT_SECRET}${NC}"
fi

# ─── Update system ────────────────────────────────────────
echo -e "\n${GREEN}[1/8] Updating system packages...${NC}"
apt update && apt upgrade -y
apt install -y curl git ufw fail2ban

# ─── Install Docker ───────────────────────────────────────
echo -e "\n${GREEN}[2/8] Installing Docker...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    systemctl enable docker
    systemctl start docker
    rm get-docker.sh
fi

# Install Docker Compose plugin
if ! docker compose version &> /dev/null; then
    apt install -y docker-compose-plugin
fi

echo -e "${GREEN}Docker version: $(docker --version)${NC}"
echo -e "${GREEN}Docker Compose version: $(docker compose version)${NC}"

# ─── Configure firewall ───────────────────────────────────
echo -e "\n${GREEN}[3/8] Configuring firewall...${NC}"
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
echo -e "${GREEN}Firewall configured: SSH, HTTP, HTTPS allowed${NC}"

# ─── Clone repository ─────────────────────────────────────
echo -e "\n${GREEN}[4/8] Cloning repository...${NC}"
APP_DIR="/opt/career-platform"
if [ -d "$APP_DIR" ]; then
    echo -e "${YELLOW}Directory exists, pulling latest changes...${NC}"
    cd $APP_DIR
    git pull
else
        git clone https://github.com/AGhilHz/karsignal.git $APP_DIR
    cd $APP_DIR
fi

# ─── Create production .env ───────────────────────────────
echo -e "\n${GREEN}[5/8] Creating production environment...${NC}"
JWT_REFRESH_SECRET=$(openssl rand -base64 48)
ENCRYPTION_KEY=$(openssl rand -hex 16)
ANONYMIZATION_SALT=$(openssl rand -base64 32)
MINIO_USER="minioadmin"
MINIO_PASSWORD=$(openssl rand -base64 24)
ELASTIC_PASSWORD=$(openssl rand -base64 24)

cat > .env << EOF
# ============================================
# Production Environment - Generated $(date)
# ============================================

# App
NODE_ENV=production
APP_PORT=3001
APP_URL=https://${DOMAIN}
FRONTEND_URL=https://${DOMAIN}
ADMIN_URL=https://admin.${DOMAIN}
NEXT_PUBLIC_ADMIN_URL=https://admin.${DOMAIN}

# Database
DATABASE_URL=postgresql://postgres:${DB_PASSWORD}@postgres:5432/career_platform
DATABASE_SHADOW_URL=postgresql://postgres:${DB_PASSWORD}@postgres:5432/career_platform_shadow

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=${REDIS_PASSWORD}
REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379

# Elasticsearch
ELASTICSEARCH_NODE=http://elasticsearch:9200
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=${ELASTIC_PASSWORD}

# JWT
JWT_SECRET=${JWT_SECRET}
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Encryption
ENCRYPTION_KEY=${ENCRYPTION_KEY}
ANONYMIZATION_SALT=${ANONYMIZATION_SALT}

# S3 / MinIO
S3_ENDPOINT=http://minio:9000
S3_ACCESS_KEY=${MINIO_USER}
S3_SECRET_KEY=${MINIO_PASSWORD}
S3_BUCKET_NAME=career-platform
S3_REGION=us-east-1
S3_PUBLIC_URL=https://${DOMAIN}/files

# OpenAI (REQUIRED - Get from https://platform.openai.com)
OPENAI_API_KEY=sk-REPLACE_WITH_YOUR_KEY

# SMTP (for email notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@${DOMAIN}
SMTP_PASS=REPLACE_WITH_YOUR_EMAIL_PASSWORD
SMTP_FROM=Career Platform <noreply@${DOMAIN}>

# Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_LIMIT=100
AUTH_RATE_LIMIT_TTL=900
AUTH_RATE_LIMIT_LIMIT=5

# Analytics
NEXT_PUBLIC_GA_ID=
EOF

echo -e "${GREEN}Environment file created at $APP_DIR/.env${NC}"
echo -e "${YELLOW}⚠ IMPORTANT: Edit .env and set your OPENAI_API_KEY and SMTP settings${NC}"

# ─── Setup Nginx for production ───────────────────────────
echo -e "\n${GREEN}[6/8] Configuring Nginx for production...${NC}"
mkdir -p infrastructure/nginx/conf.d/prod

cat > infrastructure/nginx/conf.d/prod/default.conf << EOF
upstream api_backend {
    server api:3001;
    keepalive 32;
}

upstream web_frontend {
    server web:3000;
    keepalive 32;
}

upstream admin_frontend {
    server admin:3002;
    keepalive 32;
}

# Rate limiting zones
limit_req_zone \$binary_remote_addr zone=api:10m rate=30r/s;
limit_req_zone \$binary_remote_addr zone=auth:10m rate=5r/m;

server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};

    # For Certbot ACME challenge
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    # Redirect all HTTP to HTTPS
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name ${DOMAIN} www.${DOMAIN};

    # SSL certificates (will be added by Certbot)
    ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;

    # SSL security settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # API routes
    location /api/ {
        limit_req zone=api burst=50 nodelay;
        proxy_pass http://api_backend/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 90;
        proxy_connect_timeout 10;
        proxy_send_timeout 30;
    }

    # Auth routes - stricter rate limit
    location /api/auth/ {
        limit_req zone=auth burst=10 nodelay;
        proxy_pass http://api_backend/auth/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # MinIO file serving
    location /files/ {
        proxy_pass http://minio:9000/career-platform/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }

    # Frontend
    location / {
        proxy_pass http://web_frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Next.js static files caching
    location /_next/static/ {
        proxy_pass http://web_frontend;
        proxy_cache_valid 60m;
        add_header Cache-Control "public, immutable, max-age=31536000";
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 'OK';
        add_header Content-Type text/plain;
    }
}
EOF

# Create Nginx Dockerfile for production
cat > infrastructure/nginx/Dockerfile << EOF
FROM nginx:alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY conf.d/prod/ /etc/nginx/conf.d/
EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]
EOF

# ─── Create admin subdomain config ────────────────────────
cat > infrastructure/nginx/conf.d/prod/admin.conf << EOF
server {
    listen 443 ssl http2;
    server_name admin.${DOMAIN};

    ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;

    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;

    location / {
        proxy_pass http://admin_frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# ─── Build and start services ─────────────────────────────
echo -e "\n${GREEN}[7/8] Building and starting Docker services...${NC}"
cd $APP_DIR

# Build with production target
docker compose -f docker-compose.yml -f docker-compose.prod.yml build --no-cache

# Start database services first
docker compose up -d postgres redis elasticsearch minio
echo -e "${YELLOW}Waiting 30s for databases to initialize...${NC}"
sleep 30

# Run migrations
echo -e "${GREEN}Running database migrations...${NC}"
docker compose run --rm api npx prisma migrate deploy

# Start all services
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# ─── Install SSL certificate ──────────────────────────────
echo -e "\n${GREEN}[8/8] Installing SSL certificate...${NC}"
apt install -y certbot python3-certbot-nginx

# Get SSL certificate
certbot --nginx -d ${DOMAIN} -d www.${DOMAIN} --non-interactive --agree-tos --email ${EMAIL}

# Setup auto-renewal
echo "0 0,12 * * * root certbot renew --quiet" >> /etc/crontab

# ─── Setup log rotation ───────────────────────────────────
cat > /etc/logrotate.d/career-platform << EOF
/var/log/career-platform/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 root root
    sharedscripts
    postrotate
        docker compose -f /opt/career-platform/docker-compose.yml restart api
    endscript
}
EOF

# ─── Setup fail2ban for Docker ────────────────────────────
cat > /etc/fail2ban/jail.d/docker.conf << EOF
[nginx-botsearch]
enabled = true
port = http,https
filter = nginx-botsearch
logpath = /var/log/nginx/access.log
maxretry = 2
bantime = 3600

[nginx-http-auth]
enabled = true
port = http,https
filter = nginx-http-auth
logpath = /var/log/nginx/error.log
maxretry = 5
bantime = 3600
EOF

systemctl restart fail2ban

# ─── Create backup script ─────────────────────────────────
mkdir -p /opt/backups
cat > /opt/backups/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR

# Backup PostgreSQL
docker exec ctp_postgres pg_dump -U postgres career_platform > $BACKUP_DIR/db_backup.sql

# Backup MinIO data
docker exec ctp_minio mc alias set local http://localhost:9000 minioadmin $MINIO_PASSWORD
docker exec ctp_minio mc cp --recursive local/career-platform/ $BACKUP_DIR/files/

# Cleanup old backups (keep last 7 days)
find /opt/backups -type d -mtime +7 -exec rm -rf {} +

echo "Backup completed: $BACKUP_DIR"
EOF

chmod +x /opt/backups/backup.sh

# Add daily backup to cron
echo "0 2 * * * root /opt/backups/backup.sh >> /var/log/backup.log 2>&1" >> /etc/crontab

# ─── Print summary ────────────────────────────────────────
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  ✅ Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "🌐 Website: https://${DOMAIN}"
echo -e "🔧 Admin Panel: https://admin.${DOMAIN}"
echo -e "📡 API: https://${DOMAIN}/api"
echo ""
echo -e "${YELLOW}⚠ IMPORTANT NEXT STEPS:${NC}"
echo -e "1. Edit ${GREEN}/opt/career-platform/.env${NC}"
echo -e "   - Set OPENAI_API_KEY"
echo -e "   - Configure SMTP settings"
echo ""
echo -e "2. Point your DNS to this server:"
echo -e "   A Record: ${DOMAIN} → $(curl -s ifconfig.me)"
echo -e "   A Record: www.${DOMAIN} → $(curl -s ifconfig.me)"
echo -e "   A Record: admin.${DOMAIN} → $(curl -s ifconfig.me)"
echo ""
echo -e "3. Useful commands:"
echo -e "   ${GREEN}cd /opt/career-platform${NC}"
echo -e "   ${GREEN}docker compose logs -f${NC}        # View logs"
echo -e "   ${GREEN}docker compose restart api${NC}    # Restart API"
echo -e "   ${GREEN}docker compose down && docker compose up -d${NC}  # Restart all"
echo -e "   ${GREEN}/opt/backups/backup.sh${NC}        # Manual backup"
echo ""
echo -e "4. Run database seed (optional):"
echo -e "   ${GREEN}docker compose exec api npm run db:seed${NC}"
echo ""
echo -e "${GREEN}✅ SSL certificate installed${NC}"
echo -e "${GREEN}✅ Firewall configured${NC}"
echo -e "${GREEN}✅ Fail2ban configured${NC}"
echo -e "${GREEN}✅ Auto-backup configured (daily 2 AM)${NC}"
echo -e "${GREEN}✅ SSL auto-renewal configured${NC}"
echo ""
echo -e "${YELLOW}📁 App location: /opt/career-platform${NC}"
echo -e "${YELLOW}📁 Backup location: /opt/backups${NC}"
echo ""
