#!/bin/bash
# TDG Billing - Deploy script for Hostinger Cloud
# Usage: ssh user@host 'bash -s' < deploy.sh

set -e

APP_DIR="${APP_DIR:-$HOME/tdg-billing}"
REPO_URL="https://github.com/achariya-it-hub/tdg-billing.git"

echo "=== TDG Billing Deploy ==="

# Clone if first time, otherwise pull
if [ ! -d "$APP_DIR" ]; then
    echo "Cloning repo..."
    git clone "$REPO_URL" "$APP_DIR"
else
    echo "Pulling latest..."
    cd "$APP_DIR"
    git pull
fi

cd "$APP_DIR"

# Install production deps only
echo "Installing dependencies..."
npm install --omit=dev

# Build frontend
echo "Building frontend..."
npx vite build

echo "=== Done ==="
echo ""
echo "Next steps in hPanel:"
echo "1. Go to Hosting → Manage → Advanced → Node.js"
echo "2. Set Document Root: $APP_DIR"
echo "3. Set Entry Point: server/index.js"
echo "4. Node.js version: 18+"
echo "5. Click Start / Restart"
echo ""
echo "Or run manually: node server/index.js &"
