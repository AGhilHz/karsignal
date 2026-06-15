# Deployment Guide — Career Transparency Platform

## Prerequisites

- Docker & Docker Compose v2+
- Node.js 20+
- A server with at least 4GB RAM (8GB recommended)
- Domain name with Cloudflare DNS

---

## 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install docker-compose-plugin

# Create app directory
sudo mkdir -p /opt/career-platform
sudo chown $USER:$USER /opt/career-platform
cd /opt/career-platform
```

---

## 2. Environment Configuration

```bash
cp .env.example .env
nano .env
```

**Critical values to change:**
- `JWT_SECRET` — generate with: `openssl rand -hex 64`
- `JWT_REFRESH_SECRET` — generate with: `openssl rand -hex 64`
- `ENCRYPTION_KEY` — exactly 32 characters
- `ANONYMIZATION_SALT` — random string, never change after launch
- `ADMIN_PASSWORD` — strong password
- `OPENAI_API_KEY` — your OpenAI key
- `KAVENEGAR_API_KEY` — your Kavenegar SMS key

---

## 3. First-Time Setup

```bash
# Start infrastructure services first
docker compose up -d postgres redis elasticsearch minio

# Wait for services to be healthy
docker compose ps

# Run database migrations
docker compose run --rm api npx prisma migrate deploy

# Seed initial data
docker compose run --rm api npx ts-node prisma/seed.ts

# Start all services
docker compose up -d
```

---

## 4. Cloudflare Setup

1. Add your domain to Cloudflare
2. Set DNS A record pointing to your server IP
3. Enable "Proxied" (orange cloud)
4. SSL/TLS mode: **Full (strict)**
5. Create Turnstile widget for bot protection
6. Add Turnstile keys to `.env`

---

## 5. SSL with Let's Encrypt (if not using Cloudflare proxy)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Update `infrastructure/nginx/conf.d/default.conf` to use SSL.

---

## 6. MinIO Setup

```bash
# Access MinIO console at http://your-server:9001
# Login: minioadmin / minioadmin
# Create bucket: career-platform
# Set bucket policy to public for media files
```

---

## 7. Elasticsearch Index Setup

```bash
# Create indices (run after services are up)
docker compose exec api node -e "
const { Client } = require('@elastic/elasticsearch');
const client = new Client({ node: 'http://elasticsearch:9200', auth: { username: 'elastic', password: 'elasticpassword' } });

async function setup() {
  await client.indices.create({ index: 'jobs', body: {
    mappings: { properties: {
      title: { type: 'text', analyzer: 'standard' },
      description: { type: 'text' },
      city: { type: 'keyword' },
      isRemote: { type: 'boolean' },
      employmentType: { type: 'keyword' },
      industry: { type: 'keyword' },
    }}
  }});
  
  await client.indices.create({ index: 'companies', body: {
    mappings: { properties: {
      name: { type: 'text' },
      description: { type: 'text' },
      industry: { type: 'keyword' },
      city: { type: 'keyword' },
    }}
  }});
  
  console.log('Indices created');
}
setup().catch(console.error);
"
```

---

## 8. Monitoring

```bash
# View logs
docker compose logs -f api
docker compose logs -f web

# Check service health
docker compose ps

# Database backup
docker compose exec postgres pg_dump -U postgres career_platform > backup_$(date +%Y%m%d).sql
```

---

## 9. Scaling

For high traffic, consider:
- Multiple API replicas behind Nginx load balancer
- PostgreSQL read replicas
- Redis Cluster
- Elasticsearch cluster (3 nodes minimum)
- CDN for static assets

---

## 10. Security Checklist

- [ ] Change all default passwords
- [ ] Set strong JWT secrets (64+ chars)
- [ ] Enable Cloudflare WAF
- [ ] Set up fail2ban
- [ ] Configure firewall (only ports 80, 443 public)
- [ ] Regular database backups
- [ ] Monitor for unusual activity
- [ ] Keep Docker images updated
- [ ] Review Prisma query logs for slow queries

---

## Privacy Architecture Notes

The platform uses **privacy-by-design**:

1. `anonymousTokenHash` = `HMAC-SHA256(userId, ANONYMIZATION_SALT)`
2. This token is stored on reviews/discussions instead of `userId`
3. The token is **one-way** — cannot be reversed
4. Even with full database access, you cannot map reviews to users
5. The `ANONYMIZATION_SALT` must never change after launch (would break existing tokens)
6. Admins can only see aggregate data, never individual identity-content mappings
