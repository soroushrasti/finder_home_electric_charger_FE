#!/bin/bash

# ChargeBridge Frontend Deployment Script
# This script builds and deploys the web app to the server

echo "🚀 Starting ChargeBridge deployment..."

# Configuration
SERVER_USER="root"
SERVER_HOST="185.213.165.46"
SERVER_PORT="3031"
REMOTE_PATH="/var/www/chargebridge"
BUILD_DIR="dist"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install

echo -e "${YELLOW}🔨 Building web application...${NC}"
npm run build:web

# Check if build was successful
if [ ! -d "$BUILD_DIR" ]; then
    echo -e "${RED}❌ Build failed! dist directory not found.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build completed successfully${NC}"

echo -e "${YELLOW}📤 Deploying to server...${NC}"

# Create remote directory if it doesn't exist
ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST "mkdir -p $REMOTE_PATH"

# Copy files to server
rsync -avz -e "ssh -p $SERVER_PORT" --delete $BUILD_DIR/ $SERVER_USER@$SERVER_HOST:$REMOTE_PATH/

echo -e "${GREEN}✅ Files deployed successfully${NC}"

echo -e "${YELLOW}🔧 Setting up Nginx configuration...${NC}"

# Copy nginx config to server
scp -P $SERVER_PORT nginx.conf $SERVER_USER@$SERVER_HOST:/etc/nginx/sites-available/chargebridge

# Enable site and restart nginx
ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST << 'ENDSSH'
ln -sf /etc/nginx/sites-available/chargebridge /etc/nginx/sites-enabled/chargebridge
nginx -t && systemctl reload nginx
ENDSSH

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${GREEN}🌐 Your app should be accessible at http://185.213.165.46${NC}"

