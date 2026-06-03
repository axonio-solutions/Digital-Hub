# Refactoring Plan — Mobile App

## Status: ✅ Complete (partial — ongoing)

---

## 1. Screen Name Refactoring — ✅ Done

Renamed all 11 screens with business-oriented, clear names:

| Old (technical)       | New (business)               |
| --------------------- | ---------------------------- |
| `HomeScreen`          | `HomeScreen` (kept)          |
| `MarketplaceScreen`   | `MarketplaceScreen` (kept)   |
| `ProfileScreen`       | `ProfileScreen` (kept)       |
| `DetailsScreen`       | `RequestDetailsScreen`       |
| `CreateRequestScreen` | `NewRequestScreen`           |
| `MyRequestsScreen`    | `MyRequestsScreen` (kept)    |
| `MyQuotesScreen`      | `MyQuotesScreen` (kept)      |
| `OfferScreen`         | `SubmitQuoteScreen`          |
| `EditProfileScreen`   | `EditProfileScreen` (kept)   |
| `CreditsScreen`       | `CreditsScreen` (kept)       |
| `NotificationsScreen` | `NotificationsScreen` (kept) |

Updated all imports/exports, navigate calls, navigator types, and route names across:

- `App.tsx`
- `RootNavigator.tsx`
- `BuyerNavigator.tsx` / `SellerNavigator.tsx`
- `types.ts` (both navigator param lists)

**Verification:** `npx tsc --noEmit` passes.

---

## 2. RequestDetailsScreen Actions Matrix — ✅ Done

**Problem:** Nested `if-else` blocks for determining which actions/buttons to show per request + quote status combination. Unmaintainable.

**Solution:** Declarative data structures replacing all conditional logic:

- `REQUEST_ACTIONS` — actions per request status (`open`, `cancelled`, `fulfilled`)
- `QUOTE_ACTIONS` — buyer actions per quote status (`pending`, `accepted`, `rejected`)
- `QUOTE_DISABLED_REASON` — locked-state messages per status pair
- `QUOTE_ACTION_BTN` — unified button renderer

Both bottom bar and quote card actions driven by single matrix lookup.

---

## 3. CreditsScreen Redesign — ✅ Done

- Removed `C` constants pattern, uses theme tokens + accent constants (`ACCENT_GOLD`, `NAVY`)
- Cleaner hero card with gradient
- Simplified skeleton loading
- Removed decorative elements

---

## 4. Navigation Auth Guard — ✅ Done (round 1 + 2)

### Round 1 — Fix "Maximum update depth exceeded" loop

**Root cause:** `navigate` was called on every render where auth state was `ready`, causing React to re-render → re-navigate → infinite loop.

**Fix:** Replaced `navigate` with `reset` in `App.tsx` auth guard. Added `lastResetRef` to prevent duplicate resets. Simplified dependency array to `[authState, user?.account_status, user?.role]`.

### Round 2 — Fix "need to reload to log in" + Splash flash

**Root cause (1):** Zustand `persist` middleware restored `authState: 'ready'` from storage on cold start, racing against the async auth check. This caused LoadingScreen → BuyerTabs → LoadingScreen → BuyerTabs cycle.

**Fix:** Added `partialize` to `user-store.ts` to exclude `authState` from persistence — always starts as `'checking'` on launch.

**Root cause (2):** `RootNavigator.tsx` always had `Splash` as initial route, causing a flash even for authenticated users.

**Fix:** Set `initialRouteName` dynamically from `authState` + `user.role`/`account_status`. Authenticated active buyers go directly to `BuyerTabs`.

### Files changed:

- `mobile/src/lib/stores/user-store.ts` — `partialize`
- `mobile/src/navigation/RootNavigator.tsx` — dynamic `initialRouteName`
- `mobile/App.tsx` — reset effect with `lastResetRef`

---

## 5. Auth Store — `onSignedIn` was never wired — ✅ Done

**Root cause:** After `signInWithEmail` stored the token in SecureStore, nothing updated the zustand store (`authState` stayed `'signed-out'`). The `onSignedIn` callback prop existed on `LoginScreen` but was never passed by any caller.

**Fix:** Removed `onSignedIn` prop. `LoginScreen.handleSubmit` now calls `fetchSession()` directly after sign-in succeeds and updates the store via `setUser()` + `setAuthState('ready')`.

### Google Autofill for credentials — ✅ Done

Changed `autoComplete` values on password fields to Google-standard values:

- Sign-in: `current-password` (was `password`)
- Sign-up: `new-password` (was `password-new`)
- Confirm: `new-password` (was `password-new`)

---

## 6. Logout Crash — `user.storeName` on null — ✅ Done

**Root cause:** 4 files used `useUserStore((s) => s.user)!` (non-null assertion). When `logout()` set `user: null`, mounted screens behind the profile screen in the navigation stack re-rendered with `null` and tried to access `null.storeName`.

**Files fixed:**

- `SellerHomeScreen.tsx` — removed `!`, added `if (!user) return null`
- `HomeScreen.tsx` — same
- `EditProfileScreen.tsx` — same + added guards in `handleSave`, `confirmDeactivate`, `confirmDelete`
- `BuyerNavigator.tsx` — same

**Verification:** `npx tsc --noEmit` passes.

---

## 7. Request Card Fill Width — ✅ Done

**Root cause:** `AnimatedPressable` wraps children in a `Pressable` which creates its own flexbox context (`flexDirection: 'column'` default). This prevented:

1. `width: 100%` from propagating to children
2. `cardBody`'s `flex: 1` from working (no definite parent width)

**Fix:**

- `AnimatedPressable.tsx` — Added `View { flex: 1 }` wrapper between `Animated.View` and `Pressable` so the Pressable inherits a definite width
- `HomeScreen.tsx` / `MyRequestsScreen.tsx` — Wrapped card content in `cardRow` View (`flexDirection: row`, `gap`) to explicitly provide row layout
- `Skeleton.tsx` — Same pattern

**Verification:** `npx tsc --noEmit` passes.

---

## Next Work

See `plans/notifications-plan.md` for the push notification investigation.
