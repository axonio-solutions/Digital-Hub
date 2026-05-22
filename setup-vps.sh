#!/usr/bin/env bash
set -e

# ─── Colors ───────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

log()  { echo -e "${GREEN}[✓]${NC} $1"; }
info() { echo -e "${BLUE}[→]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err()  { echo -e "${RED}[✗]${NC} $1"; exit 1; }

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}       mlila — VPS Setup Script               ${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# ─── OS check ─────────────────────────────────────────────────────────────────
if ! command -v apt-get &>/dev/null; then
  err "This script requires a Debian/Ubuntu system (apt-get not found)."
fi

# ─── Architecture ─────────────────────────────────────────────────────────────
ARCH=$(dpkg --print-architecture)   # amd64 or arm64

# ─── 1. System deps ───────────────────────────────────────────────────────────
info "Updating system and installing base packages..."
sudo apt-get update -qq
sudo apt-get install -y -qq curl git
log "System packages ready."

# ─── 2. Node.js 20 ────────────────────────────────────────────────────────────
if command -v node &>/dev/null && [[ "$(node -v)" == v20* ]]; then
  log "Node.js already installed: $(node -v)"
else
  info "Installing Node.js 20 via NodeSource..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - &>/dev/null
  sudo apt-get install -y -qq nodejs
  log "Node.js installed: $(node -v)"
fi

# ─── 3. pnpm ──────────────────────────────────────────────────────────────────
if command -v pnpm &>/dev/null; then
  log "pnpm already installed: $(pnpm -v)"
else
  info "Installing pnpm..."
  npm install -g pnpm --silent
  log "pnpm installed: $(pnpm -v)"
fi

# ─── 4. PM2 ───────────────────────────────────────────────────────────────────
if command -v pm2 &>/dev/null; then
  log "PM2 already installed: $(pm2 -v)"
else
  info "Installing PM2..."
  npm install -g pm2 --silent
  log "PM2 installed: $(pm2 -v)"
fi

# ─── 5. cloudflared ───────────────────────────────────────────────────────────
if command -v cloudflared &>/dev/null; then
  log "cloudflared already installed: $(cloudflared --version 2>&1 | head -1)"
else
  info "Installing cloudflared (${ARCH})..."
  CF_URL="https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-${ARCH}.deb"
  curl -fsSL "$CF_URL" -o /tmp/cloudflared.deb
  sudo dpkg -i /tmp/cloudflared.deb &>/dev/null
  rm /tmp/cloudflared.deb
  log "cloudflared installed: $(cloudflared --version 2>&1 | head -1)"
fi

# ─── 6. Clone / update repo ───────────────────────────────────────────────────
echo ""
read -rp "$(echo -e "${BLUE}[?]${NC} Enter your git repo URL: ")" REPO_URL
APP_DIR="$HOME/mlila"

if [ -d "$APP_DIR/.git" ]; then
  warn "Directory $APP_DIR already exists — pulling latest changes..."
  git -C "$APP_DIR" pull
else
  info "Cloning repo..."
  git clone "$REPO_URL" "$APP_DIR"
fi

cd "$APP_DIR"
log "Repo ready at $APP_DIR"

# ─── 7. .env setup ────────────────────────────────────────────────────────────
if [ ! -f ".env" ]; then
  warn ".env file not found. Create it now with the following variables:"
  echo ""
  cat <<'EOF'
  DATABASE_URL=
  BETTER_AUTH_SECRET=
  BETTER_AUTH_URL=http://localhost:3000
  VITE_APP_URL=http://localhost:3000
  SUPABASE_URL=
  SUPABASE_ANON_KEY=
  VITE_SUPABASE_URL=
  VITE_SUPABASE_ANON_KEY=
  RESEND_API_KEY=
  VITE_RESEND_TEST_EMAIL=
  R2_ACCESS_KEY_ID=
  R2_SECRET_ACCESS_KEY=
  R2_BUCKET_NAME=
  R2_ACCOUNT_ID=
EOF
  echo ""
  warn "Set BETTER_AUTH_URL and VITE_APP_URL to http://localhost:3000 for now."
  warn "After setup you will get a Cloudflare tunnel URL — update these two"
  warn "values and run:  pnpm build:vps && pm2 restart mlila"
  echo ""
  read -rp "$(echo -e "${BLUE}[?]${NC} Press ENTER once you have created the .env file...")"
  [ ! -f ".env" ] && err ".env still not found. Aborting."
fi

log ".env file found."

# ─── 8. Install dependencies ──────────────────────────────────────────────────
info "Installing dependencies..."
pnpm install --frozen-lockfile
log "Dependencies installed."

# ─── 9. Build for VPS ─────────────────────────────────────────────────────────
info "Building app for VPS (this may take a minute)..."
pnpm build:vps
log "Build complete — output at .output/"

# ─── 10. Start app via PM2 ────────────────────────────────────────────────────
info "Starting app with PM2..."
pm2 start ecosystem.config.cjs
pm2 save

# Register PM2 to start on reboot
STARTUP_CMD=$(pm2 startup 2>&1 | grep "sudo env" || true)
if [ -n "$STARTUP_CMD" ]; then
  eval "$STARTUP_CMD"
fi

log "App started via PM2."

# ─── 11. Start cloudflared tunnel via PM2 ─────────────────────────────────────
info "Starting Cloudflare Tunnel via PM2..."
pm2 start "cloudflared tunnel --url http://localhost:3000" --name cloudflared
pm2 save
log "Cloudflare Tunnel started."

# ─── 12. Show tunnel URL ──────────────────────────────────────────────────────
echo ""
info "Waiting for tunnel URL..."
sleep 5
pm2 logs cloudflared --lines 50 --nostream | grep -o 'https://[a-zA-Z0-9-]*\.trycloudflare\.com' | tail -1 | while read -r URL; do
  echo ""
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${GREEN}  Your app is live at: ${URL}${NC}"
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
done

echo ""
warn "The tunnel URL changes on every restart of cloudflared."
warn "Once you have the URL, update your .env:"
warn "  BETTER_AUTH_URL=<tunnel-url>"
warn "  VITE_APP_URL=<tunnel-url>"
warn "Then rebuild:  cd $APP_DIR && pnpm build:vps && pm2 restart mlila"
echo ""
echo -e "${BLUE}Useful commands:${NC}"
echo "  pm2 list                    — show running processes"
echo "  pm2 logs mlila              — app logs"
echo "  pm2 logs cloudflared        — tunnel logs + URL"
echo "  pm2 restart mlila           — restart app"
echo "  pm2 restart cloudflared     — new tunnel URL"
echo ""
log "Setup complete."
