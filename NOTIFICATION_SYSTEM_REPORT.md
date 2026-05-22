# Notification System — Full Technical Report

**Project:** Digital Hub (Reverse Spare-Parts Marketplace)  
**Date:** 2026-05-21  
**Status:** Production-ready across all 5 phases

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Database Schema](#2-database-schema)
3. [Notification Types Catalog](#3-notification-types-catalog)
4. [Delivery Pipeline](#4-delivery-pipeline)
5. [Trigger Map — Every Event](#5-trigger-map--every-event)
6. [Frontend Architecture](#6-frontend-architecture)
7. [Execution Examples — Full Scenarios](#7-execution-examples--full-scenarios)
8. [Background Jobs](#8-background-jobs)
9. [Performance & Indexes](#9-performance--indexes)
10. [Security Posture](#10-security-posture)
11. [Known Remaining Gaps](#11-known-remaining-gaps)
12. [Phase Implementation Summary](#12-phase-implementation-summary)

---

## 1. Architecture Overview

```
Business Event (e.g. buyer accepts quote)
        │
        ▼
  Use Case Layer          src/use-cases/quotes/index.ts
  (auth + validation)
        │
        ▼
  NotificationTriggers    src/services/notification-triggers.ts
  (maps event → payload)
        │
        ▼
  NotificationService     src/services/notification-service.ts
  (reads prefs → inserts row)
        │
        ▼
  PostgreSQL DB           notifications table
        │
        ▼
  Supabase Realtime       postgres_changes WebSocket
  (server pushes diff)
        │
        ▼
  useNotifications hook   src/features/notifications/hooks/use-notifications.ts
  (TanStack Query cache patch + toast)
        │
        ▼
  NotificationBell +      src/features/notifications/components/
  NotificationDropdown    notification-bell.tsx / notification-dropdown.tsx
```

**Why this architecture:**

- No SSE / long-lived HTTP connections → app is deployed on Netlify (serverless). SSE was previously used and caused lags and crashes because Netlify functions time out. Supabase Realtime uses a single persistent WebSocket managed by the browser, completely outside the serverless function lifecycle.
- All writes go through the server (authMiddleware-protected server functions) — the browser never writes directly to Supabase.
- Realtime is read-only from the client side: the browser subscribes to its own user-scoped channel and receives INSERT/UPDATE/DELETE diffs.

---

## 2. Database Schema

### `notifications` table

| Column         | Type                   | Default           | Description                                                |
| -------------- | ---------------------- | ----------------- | ---------------------------------------------------------- |
| `id`           | uuid                   | gen_random_uuid() | Primary key                                                |
| `user_id`      | text                   | —                 | FK → users.id (CASCADE DELETE)                             |
| `type`         | notification_type enum | —                 | See Section 3                                              |
| `title`        | text                   | —                 | Display title (English, overridden by i18n on client)      |
| `message`      | text                   | —                 | Display body                                               |
| `reference_id` | text                   | NULL              | ID of related entity (request_id, quote_id, etc.)          |
| `link_url`     | text                   | NULL              | Client-side navigation target on click                     |
| `metadata`     | jsonb                  | NULL              | `{ requestId, status, quotesCount, quoteId, quoteStatus }` |
| `is_read`      | boolean                | false             | Cleared by user or mark-all-read action                    |
| `is_priority`  | boolean                | false             | Visual emphasis in dropdown                                |
| `created_at`   | timestamp              | now()             | Used for ordering and batching window                      |

**Indexes:**

```sql
-- Single-column for general user queries
idx_notifications_user_id ON notifications (user_id)

-- Composite for the hot unread query path
idx_notifications_user_unread ON notifications (user_id, is_read, created_at DESC)

-- Dedup guard: prevents concurrent race from double-sending milestone notifications
uniq_milestone_notification_per_request
  ON notifications ((metadata->>'requestId'), type)
  WHERE type IN ('FIRST_QUOTE', 'MILESTONE_3_QUOTES')
```

### `notification_preferences` table

| Column                   | Type                 | Default        | Description                            |
| ------------------------ | -------------------- | -------------- | -------------------------------------- |
| `user_id`                | text                 | —              | FK → users.id (UNIQUE, CASCADE DELETE) |
| `email_enabled`          | boolean              | true           | Email delivery toggle                  |
| `in_app_enabled`         | boolean              | true           | In-app delivery toggle                 |
| `seller_alert_frequency` | alert_frequency enum | IMMEDIATE      | IMMEDIATE or DAILY_DIGEST              |
| `seller_brand_scope`     | brand_scope enum     | SPECIALTY_ONLY | SPECIALTY_ONLY or ALL_BRANDS           |

**Note:** Preferences are created automatically on first notification send if no row exists for the user (lazy initialization in `NotificationService.send`).

---

## 3. Notification Types Catalog

| Type                  | Recipient       | Priority | Trigger                                          | Description                                                      |
| --------------------- | --------------- | -------- | ------------------------------------------------ | ---------------------------------------------------------------- |
| `FIRST_QUOTE`         | Buyer           | No       | First quote on a request                         | "Good news! Your first offer for X is here."                     |
| `MILESTONE_3_QUOTES`  | Buyer           | **Yes**  | 3rd quote on a request                           | "You now have 3 competitive quotes. Time to compare!"            |
| `NEW_QUOTE`           | Buyer           | No       | Any subsequent quote                             | Batched within 30-min window; updates existing row if one exists |
| `QUOTE_STATUS_CHANGE` | Buyer or Seller | No       | Quote updated / revoked / rejected / unfulfilled | Contextual message depends on direction                          |
| `QUOTE_WON`           | Seller          | **Yes**  | Buyer accepts their quote                        | "Your quote for X was accepted. Check your orders."              |
| `ABANDONED_REQUEST`   | Buyer           | **Yes**  | pg_cron job: request open 48h with zero quotes   | "Still looking for parts?"                                       |
| `ACCOUNT_APPROVED`    | Seller          | **Yes**  | Admin approves seller account                    | "Your seller account has been approved."                         |
| `SPAM_FLAG`           | Admin           | No       | Any user flags a request as spam                 | "Request #XXXXX flagged as spam."                                |
| `NEW_LEAD`            | Seller          | No       | (Reserved — not yet emitted)                     | Future: specialty-matched request                                |
| `DAILY_DIGEST`        | Seller          | No       | (Reserved — DAILY_DIGEST email job stub)         | Future: daily email summary                                      |
| `BOTTLENECK_ALERT`    | Admin           | No       | (Reserved)                                       | Future: operational alert                                        |
| `NEW_SELLER_WAITLIST` | Admin           | No       | (Reserved)                                       | Future: new seller joins waitlist                                |
| `SYSTEM`              | Any             | No       | Manual admin send                                | Generic system message                                           |

---

## 4. Delivery Pipeline

### Step-by-step: from event to toast

```
1. Business event fires in a Use Case (e.g. createQuoteUseCase)
   └─ DB transaction commits successfully

2. Use Case calls NotificationTriggers.onQuoteCreated(quoteId)
   └─ fire-and-forget: .catch(console.error) — won't break the response if it fails

3. NotificationTriggers fetches context (quote + request) from DB
   └─ determines type: FIRST_QUOTE / MILESTONE_3_QUOTES / NEW_QUOTE (batched)

4. Calls NotificationService.send(payload)
   └─ reads user's notification_preferences
   └─ if in_app_enabled:
       INSERT INTO notifications (...) RETURNING *
       notificationEvents.emit('notification', row)   ← SSE emitter (unused on Netlify)

5. PostgreSQL change log triggers Supabase Realtime
   └─ Supabase pushes postgres_changes diff to all matching WebSocket subscribers

6. useNotifications hook receives payload (payload.eventType === 'INSERT')
   └─ queryClient.setQueryData(['notifications', 'unread', userId], ...)
   └─ queryClient.invalidateQueries for related caches (requests, quotes, etc.)
   └─ toast.success / toast.error depending on type

7. React re-renders NotificationBell
   └─ badge count increments
   └─ notification appears at top of dropdown
```

### The batching path (NEW_QUOTE, 4th+ bid within 30 minutes)

```
NotificationTriggers.onQuoteCreated
  └─ rowCount > 3 (not a milestone)
  └─ query: existing unread NEW_QUOTE for same requestId within last 30 min
      ├─ FOUND → UPDATE notifications SET message = "You now have N offers..."
      │           metadata.quotesCount = N
      │           → Supabase emits UPDATE event (not INSERT)
      │           → client patches cache, no new toast (UPDATE events don't toast)
      └─ NOT FOUND → INSERT new NEW_QUOTE row
                    → Supabase emits INSERT event
                    → client shows toast
```

---

## 5. Trigger Map — Every Event

### Buyer-side triggers

| Event                                     | Call site                       | Trigger method              | Notification sent                      |
| ----------------------------------------- | ------------------------------- | --------------------------- | -------------------------------------- |
| Seller submits 1st quote                  | `createQuoteUseCase` → `.catch` | `onQuoteCreated(quoteId)`   | `FIRST_QUOTE` to buyer                 |
| Seller submits 3rd quote                  | same                            | same                        | `MILESTONE_3_QUOTES` to buyer          |
| Seller submits 4th+ quote                 | same                            | same                        | `NEW_QUOTE` to buyer (batched/updated) |
| Seller updates quote price/terms          | `updateQuoteUseCase` → await    | `onQuoteUpdated(quoteId)`   | `QUOTE_STATUS_CHANGE` to buyer         |
| Seller reminder (waiting for fulfillment) | direct server call              | `onSellerReminder(quoteId)` | `QUOTE_STATUS_CHANGE` to buyer         |

### Seller-side triggers

| Event                           | Call site                                         | Trigger method                      | Notification sent                                                |
| ------------------------------- | ------------------------------------------------- | ----------------------------------- | ---------------------------------------------------------------- |
| Buyer accepts their quote       | `acceptQuoteUseCase` → `.catch`                   | `onQuoteAccepted(quoteId)`          | `QUOTE_WON` to winner                                            |
| Buyer rejects their quote       | `rejectQuoteUseCase` → `.catch`                   | `onQuoteRejected(quoteId)`          | `QUOTE_STATUS_CHANGE` to seller                                  |
| Buyer un-rejects quote          | `unrejectQuoteUseCase` → `.catch`                 | `onQuoteUnrejected(quoteId)`        | `QUOTE_STATUS_CHANGE` to seller                                  |
| Buyer revokes accepted quote    | `revokeQuoteUseCase` → `.catch`                   | `onQuoteRevoked(quoteId)`           | `QUOTE_STATUS_CHANGE` to seller                                  |
| Request fulfilled (winner)      | `fulfillRequestUseCase` → `.catch`                | `onRequestFulfilled(requestId, [])` | `QUOTE_STATUS_CHANGE` "Deal Confirmed!" to accepted sellers      |
| Request fulfilled (losers)      | same, pending sellers captured before transaction | same, passes `pendingSellerIds`     | `QUOTE_STATUS_CHANGE` "Request Fulfilled" to each pending seller |
| Admin approves account          | `approveSellerUseCase`                            | `onAccountApproved(userId)`         | `ACCOUNT_APPROVED` to seller                                     |
| Request abandoned 48h, 0 quotes | pg_cron `notify_abandoned_requests()` every 6h    | SQL INSERT directly                 | `ABANDONED_REQUEST` to buyer                                     |

### Admin-side triggers

| Event                   | Call site           | Trigger method             | Notification sent              |
| ----------------------- | ------------------- | -------------------------- | ------------------------------ |
| Request flagged as spam | `flagAsSpamUseCase` | `onSpamFlagged(requestId)` | `SPAM_FLAG` to all admin users |

### No notification (intentional)

| Event                             | Reason                                                                      |
| --------------------------------- | --------------------------------------------------------------------------- |
| Request cancelled by buyer        | Only affects buyer — they know, no one else needs notifying                 |
| Request reopened by buyer         | State change owned by buyer                                                 |
| Quote soft-deleted                | Seller initiated — no surprise                                              |
| New request posted to marketplace | Was Supabase Broadcast (`public-marketplace`) — disabled by user preference |

---

## 6. Frontend Architecture

### Hook hierarchy

```
__root.tsx
  └─ useNotifications(userId)          ← WebSocket lifecycle, toast, cache patches
       └─ Supabase postgres_changes     ← single subscription for entire session

NotificationBell
  └─ useUnreadNotifications(userId, limit)  ← TanStack Query, staleTime: 60s
  └─ useMarkNotificationRead()
  └─ useMarkAllNotificationsRead()
```

### `useNotifications` — realtime subscription details

```typescript
// Channel name: stable per user, no random suffix
const channelName = `notifications_${_userId}`

// StrictMode fix: createBrowserClient is a singleton.
// On remount, old channel still in singleton's internal map.
// Must remove it before re-subscribing or it throws:
// "cannot add callbacks after subscribe()"
supabase
  .getChannels()
  .filter((c) => c.topic === `realtime:${channelName}`)
  .forEach((c) => supabase.removeChannel(c))
```

**On INSERT:**

1. Patch `['notifications', 'unread', userId]` cache (prepend new notification)
2. Invalidate `['requests', 'details', requestId]`, `['buyer', 'requests']`, `['requests', 'open']`
3. If `quoteId + quoteStatus` present: invalidate `['seller', 'quotes']`, `['seller', 'dashboard']`, `['credits', 'my-balance']`
4. Show `toast.success` (or `toast.error` for ABANDONED_REQUEST / SPAM_FLAG / BOTTLENECK_ALERT)

**On UPDATE:**

1. Patch cache — replace matching notification in place
2. No toast (UPDATE = batching window refresh, user already knows)

**On DELETE:**

1. Filter deleted notification out of cache
2. Return immediately (no toast, no cache invalidation)

**On reconnect:**

```typescript
// hasConnectedRef tracks whether this is initial connect or reconnect
if (status === 'SUBSCRIBED' && hasConnectedRef.current) {
  // Missed events while offline — force refetch
  queryClient.invalidateQueries({
    queryKey: ['notifications', 'unread', _userId],
    exact: false,
  })
}
hasConnectedRef.current = true
```

### `useUnreadNotifications`

```typescript
// Returns { items, total } — not just an array
// items: paginated rows (limit increments by 10 on "Load more")
// total: actual unread count (used for badge)
useQuery({
  queryKey: ['notifications', 'unread', userId, limit],
  queryFn: () => fetchUnreadNotificationsServerFn({ data: limit }),
  enabled: !!userId,
  staleTime: 60_000, // 60s — real-time handles freshness
})
```

**Why `staleTime: 60s`**: The Supabase Realtime subscription keeps the cache fresh in real time. Frequent refetches would be redundant noise on Netlify's serverless invocations. 60s means the cache is considered fresh for a minute; any new notification arriving via WebSocket updates it immediately regardless.

### Badge logic

```typescript
// In NotificationBell:
const total = data?.total ?? 0 // ← from COUNT(*) query, not items.length
const badgeLabel = total > 10 ? '10+' : total > 0 ? String(total) : null
```

`total` comes from a `COUNT(*)` query that runs in parallel with the paginated items query. This means even if the user has 50 unread notifications but only 10 are loaded, the badge correctly shows `10+`.

### Load more

```typescript
// NotificationBell manages limit state:
const [limit, setLimit] = useState(10)
const hasMore = notifications.length < total

// Passes to dropdown:
onLoadMore={() => setLimit(l => l + 10)}
```

Each "Load more" click increases the limit by 10, triggering a new query with the updated key `['notifications', 'unread', userId, 20]`. The previous result is not evicted — TanStack Query returns stale while fetching.

---

## 7. Execution Examples — Full Scenarios

### Scenario A: Buyer posts a request, 5 sellers bid within 1 hour

**Timeline:**

```
T+0min   Buyer creates request
         → createRequestUseCase → onNewRequest(requestId)
         → Supabase Broadcast to 'public-marketplace' (sellers' boards refresh)
         [No notification stored in DB — broadcast only]

T+5min   Seller 1 bids
         → createQuoteUseCase → onQuoteCreated(quoteId)
         → rowCount = 1 → INSERT FIRST_QUOTE to buyer
         DB row: { type: 'FIRST_QUOTE', isPriority: false, metadata: { requestId, quotesCount: 1 } }
         Buyer sees: toast "First Quote Received!" + bell badge = 1

T+15min  Seller 2 bids
         → rowCount = 2 → check for recent NEW_QUOTE (none yet)
         → INSERT NEW_QUOTE to buyer
         DB row: { type: 'NEW_QUOTE', metadata: { requestId, quotesCount: 2 } }
         Buyer sees: toast "New Offer Received" + bell badge = 2

T+25min  Seller 3 bids  (within 30min of Seller 2's NEW_QUOTE)
         → rowCount = 3 → MILESTONE → INSERT MILESTONE_3_QUOTES to buyer
         DB row: { type: 'MILESTONE_3_QUOTES', isPriority: true, metadata: { requestId, quotesCount: 3 } }
         Buyer sees: toast "3 Quotes Milestone!" + bell badge = 3

T+35min  Seller 4 bids  (within 30min of the NEW_QUOTE at T+15)
         → rowCount = 4 → look for unread NEW_QUOTE within 30min window
         → FOUND (T+15min row, still unread)
         → UPDATE that row: message = "You now have 4 offers on your request for X."
         → metadata.quotesCount = 4
         Supabase fires UPDATE event (not INSERT) → no new toast, badge stays at 3
         Bell dropdown shows updated message on the T+15 row

T+55min  Seller 5 bids  (41min after T+15 NEW_QUOTE — outside 30min window)
         → rowCount = 5 → look for unread NEW_QUOTE within 30min → NOT FOUND
         → INSERT new NEW_QUOTE row
         Buyer sees: toast "New Offer Received" + bell badge = 4

Final state: buyer has 4 unread notifications (FIRST_QUOTE, MILESTONE_3_QUOTES, NEW_QUOTE×2)
```

---

### Scenario B: Buyer accepts a quote, request gets fulfilled

```
State: Request has 3 quotes — Seller A (pending), Seller B (pending), Seller C (pending)

Step 1: Buyer accepts Seller A's quote
        acceptQuoteUseCase → acceptQuoteTransaction(quoteIdA, tx)
        Transaction: SET quotes.status = 'accepted' WHERE id = quoteIdA
        → onQuoteAccepted(quoteIdA)
        → INSERT QUOTE_WON to Seller A
          { type: 'QUOTE_WON', isPriority: true, title: 'You Won the Deal!',
            message: 'Your quote for Brake Disc was accepted. Check your orders.',
            metadata: { requestId, quoteId: quoteIdA, quoteStatus: 'accepted' } }
        Seller A sees: toast "You Won the Deal!" immediately

        [Sellers B and C are NOT notified yet — quote.status is still 'pending']
        [Request status is still 'open']

Step 2: Buyer confirms deal (fulfillRequestUseCase)
        Before transaction:
          pendingSellerIds = [sellerB_id, sellerC_id]   ← captured NOW, before auto-reject

        fulfillRequestTransaction(requestId, tx):
          UPDATE spare_part_requests SET status = 'fulfilled'
          UPDATE quotes SET status = 'rejected' WHERE request_id = X AND status = 'pending'
          [Sellers B and C's quotes are now 'rejected' in DB]

        onRequestFulfilled(requestId, [sellerB_id, sellerC_id]):
          → For accepted quotes (Seller A):
            INSERT QUOTE_STATUS_CHANGE to Seller A
            { title: 'Deal Confirmed!', message: 'The buyer has confirmed the deal for Brake Disc.' }
          → For pending sellers (B, C):
            INSERT QUOTE_STATUS_CHANGE to Seller B
            { title: 'Request Fulfilled', message: 'The request for Brake Disc has been fulfilled by another seller.' }
            INSERT QUOTE_STATUS_CHANGE to Seller C  (same)

        [Without the pendingSellerIds capture, sellers B & C would never be notified
         because by the time onRequestFulfilled runs, their quotes are already 'rejected'
         and indistinguishable from manually-rejected ones]
```

---

### Scenario C: Buyer revokes an accepted quote

```
State: Seller A has QUOTE_WON notification, quote.status = 'accepted'

revokeQuoteUseCase(quoteIdA, buyerId, 'buyer')
  → revokeQuoteTransaction: UPDATE quotes SET status = 'pending' WHERE id = quoteIdA
  → onQuoteRevoked(quoteIdA)
     → INSERT QUOTE_STATUS_CHANGE to Seller A
       { title: 'Offer Back in Consideration',
         message: 'The buyer changed their mind. Your offer for Brake Disc is back in consideration.',
         metadata: { requestId, quoteId: quoteIdA, quoteStatus: 'pending' } }

Seller A sees: toast "Offer Back in Consideration"
               Badge increments
               Previous QUOTE_WON notification still in list (it's read/unread independently)

[Without this trigger, Seller A would believe they won the deal even after the buyer reverted.
 They might contact their supplier, arrange delivery, etc. based on stale state.]
```

---

### Scenario D: Request abandoned 48h with no bids (pg_cron)

```
pg_cron fires every 6 hours: SELECT notify_abandoned_requests()

SQL function runs:
  FOR r IN (
    SELECT spr.id, spr.buyer_id, spr.part_name
    FROM spare_part_requests spr
    WHERE spr.status = 'open'
      AND spr.deleted_at IS NULL
      AND spr.created_at < now() - interval '48 hours'
      AND NOT EXISTS (
        SELECT 1 FROM quotes q
        WHERE q.request_id = spr.id AND q.deleted_at IS NULL
      )
      AND NOT EXISTS (
        SELECT 1 FROM notifications n
        WHERE n.user_id = spr.buyer_id
          AND n.type = 'ABANDONED_REQUEST'
          AND n.metadata->>'requestId' = spr.id::text
      )
  )

  For each abandoned request:
    INSERT INTO notifications (user_id, type, title, message, link_url, is_priority, metadata)
    VALUES (buyer_id, 'ABANDONED_REQUEST',
            'Still looking for parts?',
            'Your request for Timing Belt has been open for 48h with no offers yet...',
            '/dashboard/requests/<id>', true,
            '{"requestId": "<id>"}')

Why dedup matters:
  - Job runs every 6h
  - Without the dedup guard, a request open for 7 days with no quotes would generate:
    7 * 4 = 28 ABANDONED_REQUEST notifications to the same buyer
  - The NOT EXISTS check on metadata->>'requestId' ensures exactly one notification ever
```

---

### Scenario E: Concurrent quotes race condition (FIRST_QUOTE protection)

```
State: Request has 0 quotes. Two sellers submit simultaneously.

Without the unique partial index:
  Thread 1: SELECT COUNT(*) → 0 quotes → decides to send FIRST_QUOTE
  Thread 2: SELECT COUNT(*) → 0 quotes → also decides to send FIRST_QUOTE
  Thread 1: INSERT notification type=FIRST_QUOTE
  Thread 2: INSERT notification type=FIRST_QUOTE
  → Buyer receives TWO "First Quote Received!" notifications

With the unique partial index:
  CREATE UNIQUE INDEX uniq_milestone_notification_per_request
    ON notifications ((metadata->>'requestId'), type)
    WHERE type IN ('FIRST_QUOTE', 'MILESTONE_3_QUOTES');

  Thread 1: INSERT FIRST_QUOTE → succeeds
  Thread 2: INSERT FIRST_QUOTE → UNIQUE VIOLATION → exception caught by .catch(console.error)
  → Buyer receives exactly ONE "First Quote Received!" notification
```

---

## 8. Background Jobs

### `BackgroundJobs.checkAbandonedRequests()` — TypeScript version

**File:** `src/services/background-jobs.ts`

```typescript
static async checkAbandonedRequests() {
  const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000)

  const oldRequests = await db.query.sparePartRequests.findMany({
    where: and(
      eq(sparePartRequests.status, 'open'),
      lt(sparePartRequests.createdAt, fortyEightHoursAgo),
    ),
    with: { quotes: true },
  })

  for (const request of oldRequests) {
    // FIXED: check for zero non-deleted quotes (not "no accepted quote")
    const hasNoBids = request.quotes.filter(q => !q.deletedAt).length === 0
    if (!hasNoBids) continue

    // FIXED: dedup guard — never send twice for same request
    const alreadyNotified = await db.query.notifications.findFirst({
      where: and(
        eq(notifications.userId, request.buyerId),
        eq(notifications.type, 'ABANDONED_REQUEST'),
        sql`(${notifications.metadata}->>'requestId') = ${request.id}`,
      ),
    })
    if (alreadyNotified) continue

    await NotificationService.send({
      userId: request.buyerId,
      type: 'ABANDONED_REQUEST',
      ...
      metadata: { requestId: request.id },
    })
  }
}
```

**Original bugs that were fixed:**

1. `hasAccepted = request.quotes.some(q => q.status === 'accepted')` → fires when buyer is still waiting but has bids (e.g. 5 sellers bid, buyer hasn't chosen yet). Should only fire when NO bids exist at all.
2. No dedup check → same buyer gets spammed every 6 hours until they respond.

### pg_cron scheduled version — SQL (applied via MCP migration)

**Migration name:** `schedule_abandoned_requests_job`

Runs the same logic as the TypeScript version, but directly in PostgreSQL without requiring the Node.js process. This is the production-active version on the Supabase instance.

```sql
-- Fires every 6 hours
SELECT cron.schedule(
  'check-abandoned-requests',
  '0 */6 * * *',
  'SELECT notify_abandoned_requests()'
);
```

When the SQL function inserts a notification row, Supabase Realtime detects the INSERT (postgres_changes) and pushes it to the buyer's browser in real time — exactly as if `NotificationService.send()` had been called from application code.

---

## 9. Performance & Indexes

### Hot query path

`fetchUnreadNotifications` is called on every page load and after every reconnect:

```sql
SELECT * FROM notifications
WHERE user_id = $1 AND is_read = false
ORDER BY created_at DESC
LIMIT $2
```

**Without composite index:** Postgres uses `idx_notifications_user_id` (single column), then scans all rows for the user, then filters `is_read = false`, then sorts. For a user with 500 total notifications (50 unread), this scans 500 rows to return 10.

**With `idx_notifications_user_unread (user_id, is_read, created_at DESC)`:** Postgres uses an index-only scan — it reads exactly the rows matching `(user_id, is_read=false)` in creation-time order. For the same user, it reads 10 rows instead of 500.

### Parallel COUNT + fetch

```typescript
const [items, totalResult] = await Promise.all([
  db.query.notifications.findMany({ where: condition, limit, offset }),
  db.select({ total: count() }).from(notifications).where(condition),
])
```

One round-trip to the DB for both the paginated page and the total count. Without `Promise.all`, this would be two sequential queries.

---

## 10. Security Posture

### What is protected

- All writes (insert, update, mark-read) go through `authMiddleware`-protected server functions. The browser cannot directly write to the `notifications` table via the Supabase client.
- The Supabase Realtime filter `user_id=eq.${userId}` ensures a user's channel only receives their own notifications at the Realtime layer.
- `markNotificationRead(notificationId, userId)` double-checks `userId` in the WHERE clause — even if a notification ID is guessed, it can only be marked read by its owner.

### What is NOT protected (known risk)

**No Row Level Security (RLS)** on the `notifications` table. The Supabase anon key is publicly visible in the browser. A determined attacker could:

1. Use the anon key to call the Supabase REST API directly
2. Read or modify any row in the `notifications` table without being the owner

**Why it's not fixed in this session:**
The app uses Better Auth (not Supabase Auth). Standard Supabase RLS relies on `auth.uid()` from a Supabase JWT. Better Auth issues its own tokens. The Supabase project uses asymmetric ES256 JWTs — there is no shared secret available to sign custom JWTs that `auth.uid()` would accept.

**Recommended remediation path (deferred):**
Option A — Issue Supabase-compatible JWTs from Better Auth using the ES256 private key held by the Supabase project, then pass them when creating the browser Supabase client.  
Option B — Move all Realtime delivery through a server-managed relay (Edge Function → personal Broadcast channel per user) so the client never touches Postgres tables directly.

---

## 11. Known Remaining Gaps

| Gap                                           | Severity | Impact                                                                | Recommendation                                                                            |
| --------------------------------------------- | -------- | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| No RLS on notifications table                 | High     | Any user can read/write all notifications via Supabase anon key       | See Section 10                                                                            |
| No row archiving / TTL                        | Medium   | Notifications accumulate forever; old rows slow queries over years    | Add `expires_at` column + pg_cron DELETE job                                              |
| `DAILY_DIGEST` enum exists, no job            | Low      | Sellers set to DAILY_DIGEST mode receive no seller-alert emails       | Implement BackgroundJobs.runDailyDigest() cron                                            |
| `sellerBrandScope` ignored at broadcast       | Low      | ALL_BRANDS vs SPECIALTY_ONLY preference not enforced on realtime feed | Filter client-side or write per-user NEW_LEAD notifications for specialty matches         |
| Email delivery suspended                      | Low      | `emailEnabled` preference has no effect; email code is commented out  | Un-comment email block in NotificationService after Resend sandbox setup                  |
| No per-request mute                           | Low      | Active buyers with many requests cannot silence a noisy one           | Add `notification_mutes(user_id, reference_id)` table + check in NotificationService.send |
| Accepting quote doesn't notify losing sellers | Low      | User chose not to implement (too many notifications)                  | Can be added in onQuoteAccepted — query other pending quotes, send QUOTE_STATUS_CHANGE    |

---

## 12. Phase Implementation Summary

| Phase   | Scope                                                                                        | Status | Key files changed                                                                                           |
| ------- | -------------------------------------------------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------- |
| Phase 1 | DB indexes, dedup partial index, DELETE event fix, stable channel ID, reconnect invalidation | Done   | `schema/notifications.ts`, `use-notifications.ts`, Supabase migrations                                      |
| Phase 2 | Missing triggers: onQuoteRevoked, onRequestFulfilled (pending sellers), NEW_QUOTE batching   | Done   | `notification-triggers.ts`, `use-cases/quotes/index.ts`, `use-cases/requests/index.ts`                      |
| Phase 3 | Load more pagination, accurate 10+ badge, loading/error UI states                            | Done   | `notification-bell.tsx`, `notification-dropdown.tsx`, `data-access/notifications.ts`, `fn/notifications.ts` |
| Phase 4 | 30-minute NEW_QUOTE grouping window (UPDATE existing row instead of INSERT)                  | Done   | `notification-triggers.ts`                                                                                  |
| Phase 5 | ABANDONED_REQUEST job: fix wrong condition + add dedup + pg_cron schedule                    | Done   | `background-jobs.ts`, Supabase migration `schedule_abandoned_requests_job`                                  |

---

_Report generated from live codebase analysis at /home/taki/Desktop/mlila/Digital-Hub_
