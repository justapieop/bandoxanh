#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Setup...${NC}"

# Check for root
if [ "$EUID" -ne 0 ]; then 
  echo "Please run as root (sudo ./setup_vps.sh)"
  exit 1
fi

# 1. Install System Dependencies
echo -e "${GREEN}Installing Nginx and PM2...${NC}"
apt-get update
# Check if nginx is installed
if ! command -v nginx &> /dev/null; then
    apt-get install -y nginx
fi

# Install PM2 globally if not exists
if ! command -v pm2 &> /dev/null; then
    if command -v npm &> /dev/null; then
        npm install -g pm2
    else
        echo "Error: npm is not installed. Please install Node.js and npm first."
        exit 1
    fi
fi

# 2. Configure Nginx
echo -e "${GREEN}Configuring Nginx...${NC}"
cp /home/png/bandoxanh/bandoxanh.nginx.conf /etc/nginx/sites-available/bandoxanh

# Enable the site
if [ ! -f /etc/nginx/sites-enabled/bandoxanh ]; then
    ln -s /etc/nginx/sites-available/bandoxanh /etc/nginx/sites-enabled/
    # Remove default site if it exists to avoid conflicts
    if [ -f /etc/nginx/sites-enabled/default ]; then
        rm /etc/nginx/sites-enabled/default
    fi
fi

# Test and reload
nginx -t && systemctl reload nginx

echo -e "${GREEN}System Setup Complete!${NC}"
echo "---------------------------------------------------"
echo "To finish deployment, run the following as your normal user (NOT root):"
echo "1. ./migrate_data.sh  (To copy data from Supabase DB)"
echo "2. npm run build      (To build the Next.js app)"
echo "3. pm2 start ecosystem.config.js (To start the app)"
echo "4. pm2 save           (To save the process list)"
echo "---------------------------------------------------"
