#!/usr/bin/env bash
set -euo pipefail

# Neon exposes a pooled connection (host contains "-pooler") that's ideal for the
# serverless app at runtime, but Prisma migrations need a direct connection.
# Derive a direct URL by dropping the "-pooler" segment and the client-only
# channel_binding flag, and use it for the one-off migrate + seed steps only.
MIGRATE_URL="${DATABASE_URL/-pooler./.}"
MIGRATE_URL="${MIGRATE_URL/&channel_binding=require/}"

echo "→ Applying database migrations..."
DATABASE_URL="$MIGRATE_URL" npx prisma migrate deploy

echo "→ Seeding workout content (idempotent)..."
DATABASE_URL="$MIGRATE_URL" npx prisma db seed

echo "→ Building Next.js app..."
npx next build
