# Mobile Build Guide

## Always build from the `mobile/` folder

```bash
cd mobile
```

## Install dependencies

Use `npm install` — NOT `pnpm install` (mobile is not a pnpm workspace member).

```bash
npm install
```

## Build commands

```bash
# Downloadable APK for testing
eas build --profile preview --platform android

# Production AAB for Play Store
eas build --profile production --platform android
```

## Before each build — update the API URL

The Cloudflare tunnel URL in `eas.json` changes every time you restart the tunnel.
Open `mobile/eas.json` and update `EXPO_PUBLIC_API_URL` in all three `env` blocks:

```json
"EXPO_PUBLIC_API_URL": "https://YOUR-TUNNEL.trycloudflare.com"
```

## Known version pins (do not upgrade without testing)

| Package | Pinned version | Reason |
|---|---|---|
| `expo` | `~54.0.33` | SDK 54 |
| `expo-font` | `~14.0.11` | SDK 56 version (56.0.5) crashes at launch |
| `react-native-svg` | `15.12.1` | SDK 54 compatible |
| `zod` | `^3.x` | Must be in mobile deps — not hoisted from root |

## Common build errors and fixes

### `Failed to resolve plugin for module "expo-secure-store"` 
→ Run `npm install` from `mobile/`

### `java.lang.NoSuchMethodError: getDirectConverter`
→ `expo-font` drifted to SDK 56. Run `npm install expo-font@~14.0.11` from `mobile/`

### `Unable to resolve module zod`
→ `zod` is not installed in mobile. Run `npm install zod@^3.24.0` from `mobile/`

### JS bundle error (Metro)
→ Run `npx expo export --platform android --output-dir /tmp/test` from `mobile/` to see the exact error locally before pushing to EAS.
