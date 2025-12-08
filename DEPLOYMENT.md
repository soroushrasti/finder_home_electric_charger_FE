# ChargeBridge Frontend Deployment Guide

## Prerequisites
- Node.js and npm installed locally
- SSH access to server: `ssh root@185.213.165.46 -p 3031`
- Nginx installed on server
- Backend running on http://0.0.0.0:8000

## Deployment Steps

### 1. First Time Setup

Make deployment scripts executable:
```bash
chmod +x deploy.sh deploy-quick.sh
```

### 2. Full Deployment (includes build)

```bash
./deploy.sh
```

This will:
- Install dependencies
- Build the web app with `expo export:web`
- Deploy to `/var/www/chargebridge` on server
- Configure Nginx
- Reload Nginx

### 3. Quick Deployment (uses existing build)

If you've already built and just need to upload:
```bash
./deploy-quick.sh
```

### 4. Manual Deployment

If you prefer manual steps:

```bash
# Build
npx expo export:web

# Deploy
rsync -avz -e "ssh -p 3031" --delete dist/ root@185.213.165.46:/var/www/chargebridge/

# Setup Nginx (first time only)
scp -P 3031 nginx.conf root@185.213.165.46:/etc/nginx/sites-available/chargebridge
ssh root@185.213.165.46 -p 3031 "ln -sf /etc/nginx/sites-available/chargebridge /etc/nginx/sites-enabled/chargebridge && nginx -t && systemctl reload nginx"
```

## Configuration

### API Backend
The app is configured to connect to: `http://185.213.165.46:8000`

Location: `src/config/environment.js`

### Nginx Setup
The nginx config proxies `/api/*` requests to the backend at `http://127.0.0.1:8000`

## Server Setup Commands

If nginx is not installed on server:
```bash
ssh root@185.213.165.46 -p 3031
apt update && apt install -y nginx
systemctl enable nginx
systemctl start nginx
```

## Troubleshooting

### Check Nginx status
```bash
ssh root@185.213.165.46 -p 3031 "systemctl status nginx"
```

### Check Nginx logs
```bash
ssh root@185.213.165.46 -p 3031 "tail -f /var/log/nginx/error.log"
```

### Test Nginx config
```bash
ssh root@185.213.165.46 -p 3031 "nginx -t"
```

### Check backend is running
```bash
ssh root@185.213.165.46 -p 3031 "curl http://localhost:8000"
```

## Access Your App

Once deployed, access at:
- **HTTP**: http://185.213.165.46

## Notes

- The backend is already running on port 8000
- Frontend will be served on port 80 (default HTTP)
- API requests are proxied through Nginx to avoid CORS issues
- Make sure firewall allows port 80 traffic

