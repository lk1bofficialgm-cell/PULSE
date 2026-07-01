#!/usr/bin/env bash
set -euo pipefail

# Normalize DATABASE_URL: some dashboards store it wrapped in quotes or as a
# full `psql '...'` command. Extract from the scheme onward, strip whitespace
# and a trailing quote so Prisma always gets a bare connection string.
CLEAN="postgres${DATABASE_URL#*postgres}"
CLEAN="$(printf '%s' "$CLEAN" | tr -d '[:space:]')"
CLEAN="${CLEAN%\'}"
CLEAN="${CLEAN%\"}"

# Neon's pooled connection (host contains "-pooler") is ideal for the serverless
# app at runtime, but Prisma migrations need a direct connection. Derive one by
# dropping the "-pooler" segment and the client-only channel_binding flag.
MIGRATE_URL="${CLEAN/-pooler./.}"
MIGRATE_URL="${MIGRATE_URL/&channel_binding=require/}"

echo "→ Using DB: $(printf '%s' "$MIGRATE_URL" | sed -E 's#^([a-z]+://)[^@]*@([^/?]+).*#\1***@\2#')"

echo "→ Applying database migrations..."
DATABASE_URL="$MIGRATE_URL" npx prisma migrate deploy

echo "→ Seeding workout content (idempotent)..."
DATABASE_URL="$MIGRATE_URL" npx prisma db seed

echo "→ Building Next.js app..."
npx next build
