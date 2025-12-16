#!/bin/bash
set -e

# Configuration
SOURCE_DB_URL="postgres://a144745fcee48925a77f09103b10b98c8b6da5f60b8b1734ada4baef263cf34a:sk_d-hqjW8hRUzb-SEEZMNnC@db.prisma.io:5432/postgres?sslmode=require"
TARGET_DB_URL="postgresql://postgres:secure_password_change_me@bandoxanh-db:5432/bandoxanh"

echo "Starting data migration..."
echo "Source: Remote Supabase"
echo "Target: Local Docker Postgres"

# Use a temporary container to perform the transfer
# We link it to the db network so it can access the 'bandoxanh-db' container
docker run --rm \
  --network bandoxanh_default \
  -e SOURCE_DB_URL="$SOURCE_DB_URL" \
  -e TARGET_DB_URL="$TARGET_DB_URL" \
  postgres:17-alpine \
  sh -c "pg_dump --data-only --no-owner --no-privileges \"\$SOURCE_DB_URL\" | psql \"\$TARGET_DB_URL\""

echo "Migration completed successfully!"
