#!/bin/bash
# Database backup script
set -e

BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/db_backup_$DATE.sql.gz"

mkdir -p "$BACKUP_DIR"

echo "📦 Creating database backup..."
docker compose exec -T postgres pg_dump -U postgres career_platform | gzip > "$BACKUP_FILE"

echo "✅ Backup saved: $BACKUP_FILE"
echo "   Size: $(du -sh $BACKUP_FILE | cut -f1)"

# Keep only last 7 backups
ls -t "$BACKUP_DIR"/db_backup_*.sql.gz | tail -n +8 | xargs -r rm
echo "🧹 Old backups cleaned (keeping last 7)"
