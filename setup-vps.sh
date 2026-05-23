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

# Sets or replaces a key in a .env file; appends if key not found
set_env() {
  local key=$1 val=$2 file=$3
  if grep -q "^${key}=" "$file"; then
    sed -i "s|^${key}=.*|${key}=${val}|" "$file"
  else
    echo "${key}=${val}" >> "$file"
  fi
}

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}       mlila — VPS Setup Script               ${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# ─── OS check ─────────────────────────────────────────────────────────────────
if ! command -v apt-get &>/dev/null; then
  err "This script requires a Debian/Ubuntu system (apt-get not found)."
fi

# ─── Swap ─────────────────────────────────────────────────────────────────────
if [ ! -f /swapfile ]; then
  info "Creating 4GB swap file..."
  sudo fallocate -l 4G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab > /dev/null
  log "Swap created and enabled (persists across reboots)."
else
  log "Swap already exists, skipping."
fi

# ─── Architecture ─────────────────────────────────────────────────────────────
ARCH=$(dpkg --print-architecture)

# ─── 1. System deps ───────────────────────────────────────────────────────────
info "Updating system and installing base packages..."
sudo apt-get update -qq
sudo apt-get install -y -qq curl git openssl
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
  read -rp "$(echo -e "${BLUE}[?]${NC} Press ENTER once you have created the .env file...")"
  [ ! -f ".env" ] && err ".env still not found. Aborting."
fi

log ".env file found."

# ─── 8. Validate and fill required env vars ───────────────────────────────────
info "Validating env vars..."

# Auto-generate BETTER_AUTH_SECRET if empty or missing
if ! grep -qE "^BETTER_AUTH_SECRET=.+" .env; then
  SECRET=$(openssl rand -base64 32)
  set_env "BETTER_AUTH_SECRET" "$SECRET" .env
  log "Generated BETTER_AUTH_SECRET automatically."
fi

# Warn about other critical missing vars
for VAR in DATABASE_URL SUPABASE_URL SUPABASE_ANON_KEY; do
  if ! grep -qE "^${VAR}=.+" .env; then
    warn "${VAR} is empty or missing — app may not work correctly."
  fi
done

log "Env vars validated."

# ─── 9. Install dependencies ──────────────────────────────────────────────────
info "Installing dependencies..."
pnpm install --no-frozen-lockfile
log "Dependencies installed."

# ─── 10. Kill all existing PM2 processes ──────────────────────────────────────
info "Stopping all existing PM2 processes..."
pm2 kill || true

# Register PM2 to start on reboot
STARTUP_CMD=$(pm2 startup 2>&1 | grep "sudo env" || true)
if [ -n "$STARTUP_CMD" ]; then
  eval "$STARTUP_CMD"
fi

# Start app only if a build already exists (e.g. re-running the script)
if [ -f ".output/server/index.mjs" ]; then
  info "Existing build found — starting app with PM2..."
  pm2 start ecosystem.config.cjs
  pm2 save
  log "App started via PM2."
else
  warn "No build found yet — app will start after you run 'pnpm deploy:vps' locally."
fi

# ─── 11. Start cloudflared tunnel via PM2 ─────────────────────────────────────
info "Starting Cloudflare Tunnel via PM2..."
pm2 start "cloudflared tunnel --url http://localhost:3000" --name cloudflared
pm2 save
log "Cloudflare Tunnel started."

# ─── 12. Auto-detect tunnel URL and update .env ───────────────────────────────
echo ""
info "Waiting for tunnel URL (up to 15s)..."
TUNNEL_URL=""
for i in $(seq 1 5); do
  sleep 3
  TUNNEL_URL=$(pm2 logs cloudflared --lines 50 --nostream 2>/dev/null \
    | grep -o 'https://[a-zA-Z0-9-]*\.trycloudflare\.com' | tail -1)
  [ -n "$TUNNEL_URL" ] && break
done

if [ -n "$TUNNEL_URL" ]; then
  set_env "BETTER_AUTH_URL" "$TUNNEL_URL" .env
  set_env "VITE_APP_URL"    "$TUNNEL_URL" .env
  log "Updated .env with tunnel URL: $TUNNEL_URL"

  # If app is already running, restart to pick up new BETTER_AUTH_URL
  if pm2 list | grep -q "mlila"; then
    pm2 delete mlila
    pm2 start ecosystem.config.cjs
    pm2 save
    log "App restarted with updated env."
  fi

  echo ""
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${GREEN}  Tunnel URL: ${TUNNEL_URL}${NC}"
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
else
  warn "Could not auto-detect tunnel URL."
  warn "Run: pm2 logs cloudflared --lines 50 --nostream | grep trycloudflare"
fi

# ─── 13. Next steps ───────────────────────────────────────────────────────────
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Next steps (run from your local machine):   ${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "  1. Update .env.vps.local in your project:"
echo "       VITE_APP_URL=${TUNNEL_URL:-<tunnel-url>}"
echo "       BETTER_AUTH_URL=${TUNNEL_URL:-<tunnel-url>}"
echo ""
echo "  2. Build and deploy:"
echo "       pnpm deploy:vps"
echo ""
warn "The tunnel URL changes on every cloudflared restart."
warn "When it changes, update both places and redeploy:"
warn "  VPS:   sed -i 's|^BETTER_AUTH_URL=.*|BETTER_AUTH_URL=NEW_URL|' ~/mlila/.env"
warn "         sed -i 's|^VITE_APP_URL=.*|VITE_APP_URL=NEW_URL|' ~/mlila/.env"
warn "         pm2 delete mlila && pm2 start ~/mlila/ecosystem.config.cjs && pm2 save"
warn "  Local: update .env.vps.local then run: pnpm deploy:vps"
echo ""
echo -e "${BLUE}Useful commands:${NC}"
echo "  pm2 list                    — show running processes"
echo "  pm2 logs mlila              — app logs"
echo "  pm2 logs cloudflared        — tunnel logs + URL"
echo "  pm2 restart cloudflared     — get new tunnel URL"
echo ""
log "Setup complete."
