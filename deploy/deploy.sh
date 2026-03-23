#!/bin/bash
set -e

# ——— Настрой под свой сервер ———
APP_DIR="/var/www/wedding"
REPO_DIR="$HOME/wedding-invite"

echo "📦 Building..."
cd "$REPO_DIR"
npm ci
npm run db:seed
npm run build

echo "🚀 Deploying to $APP_DIR..."
sudo mkdir -p "$APP_DIR"

# Copy standalone build
sudo rsync -a --delete .next/standalone/ "$APP_DIR/"
sudo rsync -a .next/static/ "$APP_DIR/.next/static/"
sudo rsync -a public/ "$APP_DIR/public/"
sudo mkdir -p "$APP_DIR/data"

# Copy database (only if not exists — preserve existing RSVP data!)
if [ ! -f "$APP_DIR/data/wedding.db" ]; then
  sudo cp data/wedding.db "$APP_DIR/data/wedding.db"
  echo "  → Fresh database copied"
else
  echo "  → Existing database preserved (RSVP data intact)"
fi

# Copy ecosystem config
sudo cp ecosystem.config.js "$APP_DIR/"

echo "♻️  Restarting pm2..."
cd "$APP_DIR"
pm2 startOrRestart ecosystem.config.js --env production
pm2 save

echo "✅ Done! App running at http://localhost:3000"
