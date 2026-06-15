#!/bin/bash
# Career Transparency Platform — Initial Setup Script
set -e

echo "🚀 Setting up Career Transparency Platform..."

# Check prerequisites
command -v docker >/dev/null 2>&1 || { echo "❌ Docker is required but not installed."; exit 1; }
command -v docker compose >/dev/null 2>&1 || { echo "❌ Docker Compose is required but not installed."; exit 1; }
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed."; exit 1; }

# Copy env file
if [ ! -f .env ]; then
  cp .env.example .env
  echo "✅ Created .env from .env.example"
  echo "⚠️  Please edit .env with your actual values before continuing"
  echo "   Critical: JWT_SECRET, ANONYMIZATION_SALT, ENCRYPTION_KEY"
  read -p "Press Enter after editing .env to continue..."
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Start infrastructure services
echo "🐳 Starting infrastructure services..."
docker compose up -d postgres redis elasticsearch minio

# Wait for services
echo "⏳ Waiting for services to be ready..."
sleep 15

# Check postgres
until docker compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; do
  echo "   Waiting for PostgreSQL..."
  sleep 3
done
echo "✅ PostgreSQL ready"

# Check redis
until docker compose exec -T redis redis-cli -a redispassword ping > /dev/null 2>&1; do
  echo "   Waiting for Redis..."
  sleep 3
done
echo "✅ Redis ready"

# Generate Prisma client
echo "🔧 Generating Prisma client..."
cd packages/database && npx prisma generate && cd ../..

# Run migrations
echo "🗄️  Running database migrations..."
cd packages/database && npx prisma migrate dev --name init && cd ../..

# Seed database
echo "🌱 Seeding database..."
cd packages/database && npx ts-node prisma/seed.ts && cd ../..

# Create MinIO bucket
echo "🪣 Creating MinIO bucket..."
docker compose exec -T minio mc alias set local http://localhost:9000 minioadmin minioadmin 2>/dev/null || true
docker compose exec -T minio mc mb local/career-platform 2>/dev/null || true
docker compose exec -T minio mc anonymous set public local/career-platform/avatars 2>/dev/null || true
docker compose exec -T minio mc anonymous set public local/career-platform/company-logos 2>/dev/null || true

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Start the API:     cd apps/api && npm run start:dev"
echo "   2. Start the Web:     cd apps/web && npm run dev"
echo "   3. Start the Admin:   cd apps/admin && npm run dev"
echo ""
echo "🔗 URLs:"
echo "   Web:     http://localhost:3000"
echo "   API:     http://localhost:3001/api"
echo "   Swagger: http://localhost:3001/api/docs"
echo "   Admin:   http://localhost:3002"
echo "   MinIO:   http://localhost:9001"
echo ""
echo "👤 Admin credentials:"
echo "   Email:    admin@platform.com"
echo "   Password: Admin@123456"
echo "   ⚠️  Change this immediately in production!"
