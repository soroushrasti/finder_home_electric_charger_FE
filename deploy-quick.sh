#!/bin/bash

# Quick deployment script (without full build)
# Use this when you only need to update existing build

SERVER_USER="root"
SERVER_HOST="185.213.165.46"
SERVER_PORT="3031"
REMOTE_PATH="/var/www/chargebridge"
BUILD_DIR="dist"

echo "🚀 Quick deploying to server..."

# Check if build exists
if [ ! -d "$BUILD_DIR" ]; then
    echo "❌ No build found. Run ./deploy.sh first to create a build."
    exit 1
fi

# Copy files to server
rsync -avz -e "ssh -p $SERVER_PORT" --delete $BUILD_DIR/ $SERVER_USER@$SERVER_HOST:$REMOTE_PATH/

echo "✅ Deployment completed!"

