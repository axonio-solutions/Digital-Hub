# VPS Deployment Guide

## Overview

| What          | Where                            |
| ------------- | -------------------------------- |
| Build the app | **Local machine**                |
| Run the app   | **VPS** (`43.157.81.222`)        |
| Deploy        | `pnpm deploy:vps` from **local** |

---

## 1. First-Time Setup

> Run once on a fresh VPS.

**On your local machine** — copy the setup script to the VPS:

```bash
scp setup-vps.sh ubuntu@43.157.81.222:~/
```

**SSH into the VPS** and run it:

```bash
ssh ubuntu@43.157.81.222
bash setup-vps.sh
```

The script will:

- Install Node.js, pnpm, PM2, cloudflared
- Ask for your **git repo URL** → clones the repo
- Ask you to **create `.env`** → paste all your vars (skip `BETTER_AUTH_SECRET`, auto-generated)
- Start the Cloudflare tunnel and **print the public URL**

When it finishes, note the tunnel URL printed at the end — you'll need it in the next step.

---

## 2. First Deploy (right after setup)

> Run from your **local machine** after setup completes.

**Update `.env.vps.local`** in the project root with the tunnel URL from step 1:

```
VITE_APP_URL=https://xxxx.trycloudflare.com
BETTER_AUTH_URL=https://xxxx.trycloudflare.com
```

**Build and deploy:**

```bash
pnpm deploy:vps
```

This builds the app locally, uploads it to the VPS, and starts it via PM2.
Your app is now live at the tunnel URL.

---

## 3. Redeploy After Code Changes

> Run from your **local machine** whenever you update the code.

```bash
pnpm deploy:vps
```

That's it.

---

## 4. Tunnel URL Changed

> The Cloudflare tunnel URL changes every time cloudflared restarts.
> When it does, the app will return errors until you update both places.

**On the VPS** — get the new URL:

```bash
pm2 logs cloudflared --lines 50 --nostream | grep trycloudflare
```

**On the VPS** — update the runtime env:

```bash
NEW_URL=https://representation-carlos-pressing-possibilities.trycloudflare.com

sed -i "s|^BETTER_AUTH_URL=.*|BETTER_AUTH_URL=${NEW_URL}|" ~/mlila/.env
sed -i "s|^VITE_APP_URL=.*|VITE_APP_URL=${NEW_URL}|" ~/mlila/.env
pm2 delete mlila && pm2 start ~/mlila/ecosystem.config.cjs && pm2 save
```

**On your local machine** — update `.env.vps.local`:

```
VITE_APP_URL=https://xxxx.trycloudflare.com
BETTER_AUTH_URL=https://xxxx.trycloudflare.com
```

Then redeploy to bake the new URL into the client bundle:

```bash
pnpm deploy:vps
```

---

## 5. Useful VPS Commands

```bash
pm2 list                   # show all running processes
pm2 logs mlila             # app logs (errors, requests)
pm2 logs cloudflared       # tunnel logs + current URL
pm2 restart cloudflared    # restart tunnel (gives a new URL)
pm2 delete mlila && pm2 start ~/mlila/ecosystem.config.cjs && pm2 save  # force env reload
```

---

## Files Reference

| File                   | Purpose                                         |
| ---------------------- | ----------------------------------------------- |
| `setup-vps.sh`         | One-time VPS setup script                       |
| `.env.vps.local`       | Local build env (tunnel URL, **not committed**) |
| `~/mlila/.env`         | Runtime env on VPS (**not in repo**)            |
| `ecosystem.config.cjs` | PM2 config — reads `.env` and starts the app    |
| `pnpm deploy:vps`      | Build locally → upload → restart PM2            |
