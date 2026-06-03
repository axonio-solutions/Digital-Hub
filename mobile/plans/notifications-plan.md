# Push Notification Background Delivery — Investigation & Fix Plan

## Status: 🔍 Investigating

---

## System Overview

The notification flow has **3 layers**:

```
[Server business event] → [NotificationService.send()] → [Mobile app receives]
```

### Current Flow (broken)

```
Business event (new quote, accepted, etc.)
  → NotificationTriggers.onXxx()
    → NotificationService.send()
      → ✅ INSERT into `notifications` DB table
      → ❌ Node EventEmitter emits — no listener attached
      → ❌ Should call Supabase Edge Function "send-push" — not done
```

### What the Edge Function expects

File: `supabase/functions/send-push/index.ts`

Two endpoints:

- `POST /register` — mobile app sends `userId + expoPushToken` → stored in `device_tokens` table
- `POST /` (webhook handler) — receives `{ user_id, title, message, metadata, reference_id }`, queries `device_tokens`, POSTs to Expo Push API

### Mobile App Current Behavior

- `initNotificationHandler()` — sets handler to always show alerts
- `registerPushToken(user)` — registers token with edge function (runs once when `authState === 'ready'`)
- Polling loop in `BuyerNavigator`/`SellerNavigator` — fetches unread via API every 30s, shows local notification for new ones
- `setupNotificationResponseListener` — handles tap-to-navigate

---

## Root Causes — 3 Gaps

### ✅ Gap 1 (SERVER): No push dispatch from server

**Problem:** `NotificationService.send()` (in `src/services/notification-service.ts`) creates the DB record but never calls the `send-push` edge function. The `notificationEvents` Emitter has no listeners.

**Possible fixes (choose one):**

| Option | Approach                                                                                                           | Pros                            | Cons                                                                                               |
| ------ | ------------------------------------------------------------------------------------------------------------------ | ------------------------------- | -------------------------------------------------------------------------------------------------- |
| A      | Supabase Database Webhook: on `notifications` INSERT → POST to `send-push` edge function                           | No code change needed on server | Requires Supabase dashboard config; webhook URL includes anon key; reliability depends on Supabase |
| B      | Direct HTTP call from `NotificationService.send()` to edge function                                                | Self-contained, explicit        | Needs edge function URL + apiKey in server env                                                     |
| C      | Call edge function from the trigger functions (`notification-triggers.ts`) instead of `NotificationService.send()` | More granular control           | Duplication, more code                                                                             |

**Recommendation:** Option B — most reliable, code is explicit. Add the edge function URL and apiKey to server `.env`, call it in `NotificationService.send()` after the DB insert.

### ✅ Gap 2 (MOBILE): No background notification task

**Problem:** `expo-notifications` requires `registerTaskAsync` for JS to run when a notification arrives in background/killed state. This is completely missing.

**Required changes in `push-notifications.ts`:**

- Import `registerTaskAsync`, `unregisterTaskAsync` from `expo-notifications`
- Import `TaskManager`
- Define `BACKGROUND_NOTIFICATION_TASK` constant
- Register a task handler that processes notification data (e.g. updates store, shows local notification)
- Call `registerTaskAsync(...)` in the init flow
- Call `unregisterTaskAsync(...)` on cleanup

### ✅ Gap 3 (MOBILE): No foreground received listener

**Problem:** Only `addNotificationResponseReceivedListener` (tap handler) exists. No `addNotificationReceivedListener` to handle payload while app is in foreground — currently relies entirely on 30s poll.

**Fix:** Add `addNotificationReceivedListener` in `setupNotificationResponseListener` that processes the notification data (invalidates queries, updates unread count, etc.).

---

## Implementation Order

### Phase 1: Server-side push dispatch

- [ ] Read `supabase/functions/send-push/index.ts` to understand exact payload format
- [ ] Add `EXPO_PUSH_EDGE_FN_URL` and `EXPO_PUSH_API_KEY` to server `.env.example` and server env
- [ ] Modify `src/services/notification-service.ts` — after DB insert, `fetch()` the edge function with notification data
- [ ] Verify edge function receives the request and queries `device_tokens`
- [ ] Verify EXPO push API call succeeds
- [ ] Check if `device_tokens` table exists in Supabase (not in Drizzle schema)

### ✅ Phase 2: Mobile background handler

- [x] Import `expo-task-manager` and define `BACKGROUND_NOTIFICATION_TASK` handler
- [x] Task handler processes notification data payload (for badge updates, prefetch, etc.)
- [x] `registerBackgroundNotificationTask()` / `unregisterBackgroundNotificationTask()` exported
- [x] Registered in `App.tsx` effect alongside `initNotificationHandler()`
- [x] `app.json`: added `enableBackgroundRemoteNotifications: true` for iOS

### ✅ Phase 3: Mobile foreground handler

- [x] `setupNotificationForegroundListener(onReceived?)` added — calls `addNotificationReceivedListener`
- [x] Wired in `App.tsx` to invalidate `['unread-notifications']` query client cache
- [x] Cleans up via `cleanupNotificationResponseListener()` (shared cleanup)

### Phase 4: Testing

- [ ] EAS development build on device
- [ ] Foreground: trigger business event → notification should appear immediately (not after 30s poll)
- [ ] Background (app in background): notification should arrive as system notification + JS handler processes data
- [ ] Killed (app force-closed): notification should arrive as system notification; tapping it navigates to correct screen

---

## Open Questions

1. `device_tokens` table — exists in Supabase but not in Drizzle schema. Can we verify it exists? If not, we need to create it.
2. Edge function `apiKey` — where is it stored server-side? The mobile uses `EXPO_PUBLIC_SEND_PUSH_KEY` env var. Does the server have access to this? Or should we use a different auth mechanism (e.g., service role key)?
3. Does the polling loop in BuyerNavigator/SellerNavigator need to be removed once push is working, or kept as fallback?
4. The `scheduleLocalNotification` with `trigger: null` already shows the notification immediately for foreground. For background, the OS handles display automatically. For killed state, the OS handles display but JS data processing only happens on tap.
