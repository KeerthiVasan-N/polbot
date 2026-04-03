#!/bin/bash
# Oracle Cloud / Ubuntu VPS setup script for polbot
# Run: chmod +x setup.sh && ./setup.sh

set -e

echo "=== Polbot VPS Setup ==="

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20 LTS
if ! command -v node &>/dev/null; then
  echo "Installing Node.js 20..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt install -y nodejs
fi
echo "Node: $(node -v)"

# Install Chromium dependencies (needed for whatsapp-web.js / Puppeteer)
echo "Installing Chromium dependencies..."
sudo apt install -y \
  chromium-browser \
  libgbm1 \
  libnss3 \
  libatk-bridge2.0-0 \
  libx11-xcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  libcups2 \
  libpango-1.0-0 \
  libcairo2 \
  libasound2 \
  libatspi2.0-0 \
  libgtk-3-0

# Install pm2 globally for auto-restart
if ! command -v pm2 &>/dev/null; then
  echo "Installing pm2..."
  sudo npm install -g pm2
fi

# Install project dependencies
echo "Installing project dependencies..."
npm install

# Tell Puppeteer to use system Chromium
export PUPPETEER_EXECUTABLE_PATH=$(which chromium-browser)
echo "PUPPETEER_EXECUTABLE_PATH=$(which chromium-browser)" > .env

echo ""
echo "=== Setup complete! ==="
echo ""
echo "Next steps:"
echo "  1. First run (scan QR):  npm start"
echo "  2. After QR scanned, Ctrl+C then start with pm2:"
echo "     pm2 start bot.js --name polbot"
echo "     pm2 save && pm2 startup"
echo ""
echo "Commands:"
echo "  pm2 logs polbot     — view live logs"
echo "  pm2 restart polbot  — restart bot"
echo "  npm run reset       — clear auth, re-scan QR"
echo "  pm2 stop polbot     — stop bot"
