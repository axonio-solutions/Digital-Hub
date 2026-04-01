# MLILA Scalability Readiness Audit Report

**Date:** April 1, 2026
**Role:** Principal Systems Architect & SRE
**Status:** ⚠️ **High Risk** (Requires immediate architectural changes to handle 10,000+ users)

---

## 1. The Verdict

**"Yes, but only up to ~500 concurrent users."**

In its current state, MLILA will function beautifully for a small pilot. However, the architecture contains "linear-growth traps"—specifically in the **SSE Notification System** and **Database Connection Layer**—that will cause the node process to saturate CPU and the database to reject connections as you scale towards 10,000 active sellers.

---

## 2. Critical Bottlenecks (Red Flags)

### 🚩 O(N*M) SSE Filtering (CPU Burn)
In `src/routes/api/notifications.stream.tsx`, the current listener logic subscribes ALL connected users to a single `EventEmitter`:
```typescript
const listener = (notification: any) => {
  if (notificationUserId === currentUserId) { // THIS RUNS FOR EVERYONE
    controller.enqueue(...)
  }
}
notificationEvents.on('notification', listener)
```
**Impact:** If 5,000 sellers are online and 1 request is created, **5,000 callbacks** fire simultaneously. If 10 requests are created per second, the server executes **50,000 filter checks per second** on a single thread. This will freeze the Node.js event loop, causing API timeouts and dropped connections.

### 🚩 Database Connection Saturation
The `src/db/index.ts` uses the default `postgres.js` client without an external pooler:
```typescript
export const client = postgres(connectionString, { prepare: false });
```
**Impact:** Each server instance competes for a limited pool (default ~10). With 10,000 sellers frequently fetching notifications or refreshing feeds, you will hit `too many clients` errors. Furthermore, in a serverless environment (if using Vercel), this will exhaust database connections during cold-start spikes.

### 🚩 Single-Instance SSE (Horizontal Scaling Fail)
The `EventEmitter` in `src/lib/events.ts` is in-memory.
**Impact:** If you deploy two server instances (Horizontal Scaling), a request created on **Server A** will only notify users connected to **Server A**. Users on **Server B** will never see the notification. You are currently "locked" to a single server instance.

---

## 3. Performance Warnings (Yellow Flags)

### ⚠️ Missing Database Indexes
`spare_part_requests` is queried via `status`, `brandId`, and `categoryId` in `fetchOpenRequestsQuery`.
**Impact:** As the table grows beyond 100k rows, sequential scans will slow down the marketplace feed. `ilike` searches on `partName` and `oemNumber` are currently unindexed `O(N)` operations.

### ⚠️ Relational Payload Bloat
The `findMany` queries use `with: { quotes: true }`.
**Impact:** For the "Open Requests" feed, you are fetching the full list of quotes for every request shown. If a request has 50 quotes, the JSON payload for the feed becomes massive. You should only fetch an `agg_count` for the feed.

---

## 4. The Remediation Roadmap

To "bulletproof" MLILA for 10,000 active sellers, implement these steps in order:

### Step 1: Decentralize SSE with Redis Pub/Sub
Move away from the global `EventEmitter`. 
- **Action:** Replace `src/lib/events.ts` with a Redis client.
- **Architecture:** 
  1. `NotificationService` publishes to a Redis channel named `user:notifications:${userId}`.
  2. The SSE stream route subscribes *only* to that specific user's channel.
- **Benefit:** CPU complexity drops from `O(N*M)` to `O(1)` per notification. Horizontal scaling is instantly enabled.

### Step 2: Implement "Transaction-Aware" Connection Pooling
The current direct connection will not hold.
- **Action:** Use **PgBouncer** or the **Supabase Transaction Pooler** (Port 6543) and increase the pool size in `drizzle.config.ts` and `db/index.ts`.
- **Action:** In `src/db/index.ts`, explicitly set a `max` connection limit based on your server capacity (e.g., `max: 20` for smaller instances).

### Step 3: Explicit Indexing Strategy
Update `src/db/schema/marketplace.ts` to include composite indexes.
- **Action:** Add these indexes to `spare_part_requests`:
  - `idx_requests_active`: `(status, created_at DESC)` — Crucial for the feed.
  - `idx_requests_filter`: `(brand_id, category_id)` — Crucial for seller specialties.
  - `gin_idx_part_search`: GIN index on `part_name` for fast partial matches.

### Step 4: Proactive Cache Invalidation (TanStack Query)
- **Action:** Ensure `onSuccess` handlers for quote/request mutations in the frontend use `queryClient.invalidateQueries({ queryKey: [...] })` rather than manual state manipulation.
- **Action:** Implement **Optimistic Updates** for the "Accept/Reject Quote" flow to mask server latency from the user.

### Step 5: Payload Thinning (Feed Optimization)
- **Action:** Modify `fetchOpenRequestsQuery` to exclude the `quotes` array in the summary view. Instead, return a `quotesCount` computed via a subquery or join. Only fetch actual quote details on the "Request Details" page.
