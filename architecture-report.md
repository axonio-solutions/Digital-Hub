# MLILA — Web Architecture & Design Report

> Automotive spare parts marketplace — buyers request parts, sellers compete by quoting prices.
> Generated from codebase analysis — May 2026.

---

## 1. Project Overview

| Aspect              | Detail                                                       |
| ------------------- | ------------------------------------------------------------ |
| **Name**            | `mlila` (Digital Hub)                                        |
| **Description**     | Multi-tenant automotive spare parts marketplace              |
| **Stack**           | TanStack Start (React 19 + TanStack Router + TanStack Query) |
| **Server**          | Vite (dev) / Nitro (production) via TanStack Start           |
| **Database**        | PostgreSQL via Drizzle ORM (snake_case mapping)              |
| **Auth**            | Better Auth (email/password, phone plugin, admin plugin)     |
| **UI**              | Tailwind CSS v4, Shadcn/Radix primitives, Framer Motion      |
| **i18n**            | react-i18next (en / fr / ar) — Arabic RTL supported          |
| **Email**           | Resend (React Email templates)                               |
| **Package Manager** | pnpm                                                         |
| **Deployment**      | Netlify (primary) / VPS via PM2                              |
| **Port**            | 5173 (dev), 3000 (VPS)                                       |

---

## 2. Architectural Layering (Axis Pattern)

Strict tiered architecture — each layer calls only the one below it:

```
┌──────────────────────────────────────────┐
│  ROUTES (src/routes/)                    │
│  TanStack Router file-based routes       │
│  URL params, loaders, render features    │
├──────────────────────────────────────────┤
│  SERVER FUNCTIONS (src/fn/)              │
│  RPC entry points wrapped by             │
│  createServerFn — validate input (Zod)   │
├──────────────────────────────────────────┤
│  USE CASES (src/use-cases/)              │
│  Business logic, auth, orchestration     │
├──────────────────────────────────────────┤
│  DATA ACCESS (src/data-access/)          │
│  Pure Drizzle queries/mutations          │
├──────────────────────────────────────────┤
│  DB (src/db/)                            │
│  Drizzle client + schema definitions     │
└──────────────────────────────────────────┘
```

**Rule:** Routes never call DB directly. Routes/Features go through Server Functions (or Use Cases). Use Cases go through Data Access.

### Directory Map

| Layer            | Folder             | Responsibility                                                                                |
| ---------------- | ------------------ | --------------------------------------------------------------------------------------------- |
| Routes           | `src/routes/`      | TanStack Router file-based routes. URL params, loaders, render feature components.            |
| Server Functions | `src/fn/`          | RPC entry points wrapped with `createServerFn`. Validate input with Zod, then call Use Cases. |
| Use Cases        | `src/use-cases/`   | Business logic, authorization, validation. Framework-agnostic. Orchestrates Data Access.      |
| Data Access      | `src/data-access/` | Pure Drizzle queries/mutations. No business rules, no auth checks.                            |
| DB               | `src/db/`          | Drizzle client + schemas (`src/db/schema/*.ts`).                                              |

### Cross-Cutting Services (`src/services/`)

| File                       | Purpose                                  |
| -------------------------- | ---------------------------------------- |
| `background-jobs.ts`       | Background job processing                |
| `email-templates.ts`       | Email template definitions (React Email) |
| `notification-service.ts`  | Orchestrates Email + SSE notifications   |
| `notification-triggers.ts` | Triggers specific notification events    |

---

## 3. Complete Route Tree

### 3.1 Route Groups

| Group      | Guard                                              | Layout                                   |
| ---------- | -------------------------------------------------- | ---------------------------------------- |
| `_public/` | None                                               | Navbar + Outlet (Ft1 mast-headed footer) |
| `_auth/`   | Redirects to `/dashboard` if already authenticated | Centered auth form                       |
| `_authed/` | Requires auth + account_status checks              | Outlet only (role-based dashboards)      |
| `api/`     | None                                               | Raw request handler                      |

### 3.2 Full Route Map

```
__root__                               Root layout
│                                      i18n, direction, theme, fonts
│                                      beforeLoad: loads user from DB
│                                      notFoundComponent: 404 page
│
├── /_auth (public entry — unauthenticated only)
│   └── /login                         AuthForm + ThemeToggle
│                                      beforeLoad: redirects to /dashboard if logged in
│
├── /_public (public pages — Navbar layout)
│   ├── /                              Landing page
│   │                                  HeroSection + StatsStrip + HowItWorksSection + CtaSection
│   ├── /about                         About content
│   ├── /contact                       Contact content
│   ├── /explore                       Public marketplace search (?q=)
│   ├── /faq                           FAQ content
│   └── /pricing                       Pricing content
│
├── /_authed (protected — must be logged in)
│   │ beforeLoad:
│   │   1. If !user → redirect /login?redirect=<path>
│   │   2. If account_status = 'new' → /complete-registration
│   │   3. If account_status = 'waitlisted' → /waitlist
│   │
│   ├── /onboarding                    Multi-step wizard
│   │  Step 1: Choose role (buyer/seller)
│   │  Step 2: Profile photo
│   │  Step 3: Contact info
│   │  Step 4: Location (wilaya, city, address)
│   │  Step 5: Specialties (seller only — brands & categories)
│   │
│   ├── /complete-registration         Avatar upload for new users
│   ├── /waitlist                      Waitlisted seller status (with check & logout)
│   │
│   ├── /marketplace/$requestId        Request detail (seller/admin only)
│   │                                  beforeLoad: role === 'seller' || 'admin'
│   │
│   └── /dashboard                     Role-based layout (lazy loaded)
│       │                              AdminLayout / SellerLayout / BuyerLayout
│       │
│       ├── /                          Dashboard overview
│       │   admin:   stats, system metrics, market gap analysis
│       │   seller:  seller stats
│       │   buyer:   buyer requests (deferred)
│       │
│       ├── /requests                  Buyer requests hub (buyer/admin)
│       │                              beforeLoad: role === 'buyer' || 'admin'
│       │
│       ├── /requests/$requestId       Single request detail (buyer/admin)
│       │                              beforeLoad: role === 'buyer' || 'admin'
│       │
│       ├── /quotes                    Seller quotes hub (seller/admin)
│       │                              beforeLoad: role === 'seller' || 'admin'
│       │
│       ├── /profile                   Account settings (SettingsHub)
│       ├── /billing                   Billing overview (seller/admin)
│       │                              beforeLoad: role === 'seller' || 'admin'
│       │
│       ├── /support                   Support tickets hub
│       ├── /users                     → redirect /dashboard/admin/users
│       ├── /audit                     → redirect /dashboard/admin/audit
│       │
│       └── /admin (admin-only guard)
│           │                          beforeLoad: role !== 'admin' → redirect /dashboard
│           │
│           ├── /categories            Taxonomy management (categories & brands)
│           ├── /buyers                Buyer analytics
│           ├── /sellers               Seller analytics
│           ├── /users                 User management table
│           │                          Metrics: total, waitlisted, active sellers, pending email
│           │                          Supports ban toggle
│           │
│           ├── /intelligence          Market gap analysis
│           ├── /revenue               Revenue metrics + credit transactions
│           ├── /credit-requests       Credit request management + packages
│           │                          Tabs: requests (DataTable), packages (CreditPackages)
│           │                          Approve/reject mutations
│           │
│           └── /audit                 Full request audit trail
│                                      DataTable: sort, filter, pagination, column visibility
│                                      Metrics: pending, flagged, today count, conversion rate
│
├── /api/auth/$                        Better Auth catch-all handler (GET + POST)
└── /api/v1/$                          Legacy REST API (being replaced by server functions)
```

### 3.3 Route Components (error boundaries)

| Component                  | Usage                                                     |
| -------------------------- | --------------------------------------------------------- |
| `route-error-fallback.tsx` | Error boundary — shows error message + "Try again" button |
| `-default-not-found.tsx`   | 404 page — "Go back home" link                            |

---

## 4. Auth Flow

### 4.1 Before-load chain (`_authed.tsx`)

```
User requests protected route
        │
        ▼
  Session exists?
        │
   ┌────┴────┐
   YES       NO
   │         └──→ Redirect /login?redirect=<current_path>
   ▼
  account_status?
   │
   ├── "new" / null  ──→ /complete-registration
   ├── "waitlisted"   ──→ /waitlist
   └── "active"       ──→ Allow through to route
```

### 4.2 Role-Based Route Guards

| Route                            | Allowed Roles     |
| -------------------------------- | ----------------- |
| `/dashboard/admin/*`             | `admin`           |
| `/dashboard/requests`            | `buyer`, `admin`  |
| `/dashboard/requests/$requestId` | `buyer`, `admin`  |
| `/dashboard/quotes`              | `seller`, `admin` |
| `/marketplace/$requestId`        | `seller`, `admin` |
| `/dashboard/billing`             | `seller`, `admin` |

### 4.3 Auth Stack

- **Server:** Better Auth with Drizzle adapter — `src/lib/auth.ts`
  - Plugins: `admin()`, `phoneNumber()`, `customSession()`
  - Sessions: 7-day expiry, 1-day update age, cookie cache
  - Custom user fields: `account_status`, `phoneNumber`, `storeName`, `wilaya`, `whatsappNumber`, etc.
- **Client:** `createAuthClient` — `src/lib/auth-client.ts`
- **Server functions:** `src/fn/auth.ts` — login, register, registerSeller, logout, getUser

---

## 5. Dashboard Role-Based Routing

`/dashboard/route.tsx` dynamically loads layouts via `React.lazy`:

| User Role | Layout                  | Fallback            |
| --------- | ----------------------- | ------------------- |
| `admin`   | `AdminLayout`           | `DashboardSkeleton` |
| `seller`  | `SellerLayout`          | `DashboardSkeleton` |
| `buyer`   | `BuyerLayout` (default) | `DashboardSkeleton` |

Each layout is wrapped in `<React.Suspense>`.

### Dashboard Section Access by Role

| Section         | Buyer | Seller | Admin |
| --------------- | ----- | ------ | ----- |
| Overview        | ✅    | ✅     | ✅    |
| Requests        | ✅    | —      | ✅    |
| Quotes          | —     | ✅     | ✅    |
| Profile         | ✅    | ✅     | ✅    |
| Billing         | —     | ✅     | ✅    |
| Support         | ✅    | ✅     | ✅    |
| Categories      | —     | —      | ✅    |
| Buyers          | —     | —      | ✅    |
| Sellers         | —     | —      | ✅    |
| Users           | —     | —      | ✅    |
| Intelligence    | —     | —      | ✅    |
| Revenue         | —     | —      | ✅    |
| Credit Requests | —     | —      | ✅    |
| Audit           | —     | —      | ✅    |

---

## 6. Data Models (DB Schema)

### 6.1 Users (`src/db/schema/auth.ts`)

Better Auth user table with custom fields:

| Column               | Type    | Notes                           |
| -------------------- | ------- | ------------------------------- |
| `id`                 | text    | Primary key                     |
| `name`               | text    |                                 |
| `email`              | text    | Unique                          |
| `emailVerified`      | boolean |                                 |
| `image`              | text    | Avatar URL                      |
| `role`               | text    | `user` / `admin`                |
| `banned`             | boolean |                                 |
| `banReason`          | text    |                                 |
| `account_status`     | text    | `new` / `waitlisted` / `active` |
| `phoneNumber`        | text    |                                 |
| `storeName`          | text    | Seller store name               |
| `wilaya`             | text    | Algerian province               |
| `whatsappNumber`     | text    |                                 |
| `address`            | text    |                                 |
| `city`               | text    |                                 |
| `companyAddress`     | text    |                                 |
| `commercialRegister` | text    | Seller registration             |
| `credits`            | integer |                                 |

Additional tables: `sessions`, `accounts`, `verifications`

### 6.2 Spare Part Requests (`src/db/schema/marketplace.ts`)

| Column         | Type      | Notes                              |
| -------------- | --------- | ---------------------------------- |
| `id`           | uuid      | Primary key                        |
| `buyerId`      | text      | FK → users.id                      |
| `categoryId`   | integer   | FK → partCategories.id             |
| `brandId`      | integer   | FK → vehicleBrands.id              |
| `partName`     | text      |                                    |
| `oemNumber`    | text      | OEM part number                    |
| `vehicleBrand` | text      |                                    |
| `modelYear`    | integer   |                                    |
| `imageUrls`    | text[]    |                                    |
| `status`       | text      | `open` / `fulfilled` / `cancelled` |
| `isSpam`       | boolean   |                                    |
| `isPriority`   | boolean   |                                    |
| `notes`        | text      |                                    |
| `deletedAt`    | timestamp | Soft delete                        |

Indexed with `gin_trgm` for text search.

### 6.3 Quotes (`src/db/schema/marketplace.ts`)

| Column      | Type      | Notes                               |
| ----------- | --------- | ----------------------------------- |
| `id`        | uuid      | Primary key                         |
| `requestId` | uuid      | FK → sparePartRequests.id           |
| `sellerId`  | text      | FK → users.id                       |
| `price`     | integer   | DZD (Algerian dinar)                |
| `condition` | text      | `new` / `used`                      |
| `warranty`  | text      |                                     |
| `status`    | text      | `pending` / `accepted` / `rejected` |
| `deletedAt` | timestamp | Soft delete                         |

### 6.4 Taxonomy (`src/db/schema/taxonomy.ts`)

**partCategories:**
| Column | Type |
|--------|------|
| `id` | integer (PK) |
| `name` | text (unique) |
| `description` | text |
| `imageUrl` | text |
| `status` | `active` / `draft` / `archived` |

**vehicleBrands:**
| Column | Type |
|--------|------|
| `id` | integer (PK) |
| `brand` | text (unique) |
| `clusterOrigin` | text |
| `clusterRegion` | text |
| `imageUrl` | text |
| `status` | `active` / `draft` / `archived` |

### 6.5 Vendor Specialties (`src/db/schema/vendors.ts`)

| Table              | Columns               | Purpose                                         |
| ------------------ | --------------------- | ----------------------------------------------- |
| `sellerBrands`     | sellerId + brandId    | Composite PK — which brands a seller covers     |
| `sellerCategories` | sellerId + categoryId | Composite PK — which categories a seller covers |

### 6.6 Credits (`src/db/schema/credits.ts`)

| Table                | Purpose                                                             |
| -------------------- | ------------------------------------------------------------------- |
| `creditPackages`     | Predefined credit bundles (name, credits, price)                    |
| `creditRequests`     | Seller requests to purchase credits (pending/approved/rejected)     |
| `creditTransactions` | Ledger of all credit movements (purchase, bonus, spend, adjustment) |

### 6.7 Notifications (`src/db/schema/notifications.ts`)

| Table                     | Purpose                                                               |
| ------------------------- | --------------------------------------------------------------------- |
| `notifications`           | Per-user notifications with type enum, title, message, link, priority |
| `notificationPreferences` | Per-user email/in-app toggles, alert frequency, brand scope           |

### 6.8 Vehicles (`src/db/schema/vehicles.ts`)

| Column         | Type      |
| -------------- | --------- |
| `id`           | uuid (PK) |
| `userId`       | text (FK) |
| `make`         | text      |
| `model`        | text      |
| `year`         | integer   |
| `vin`          | text      |
| `licensePlate` | text      |
| `color`        | text      |

---

## 7. Feature Modules (`src/features/`)

| Domain           | Components                                              | Purpose                                         |
| ---------------- | ------------------------------------------------------- | ----------------------------------------------- |
| `accounts/`      | SettingsHub, profile forms                              | Account settings, profile updates, deactivation |
| `admin/`         | AdminOverview, AdminUsersTable, AdminIntelligence, etc. | Admin dashboard components                      |
| `auth/`          | AuthForm, use-auth hook, authQueries                    | Authentication forms, hooks, Query options      |
| `buyer/`         | BuyerHub, BuyerRequestDetails, BuyerOverview            | Buyer dashboard, request creation/management    |
| `credits/`       | RevenueRoute, CreditPackages, credit components         | Credit packages, requests, revenue display      |
| `dashboard/`     | DashboardSkeleton, shared utilities                     | Shared dashboard components                     |
| `marketplace/`   | PublicMarketplace, RequestDetailPage                    | Public marketplace, request detail              |
| `notifications/` | use-notifications hook, notification display            | Notification hooks & components                 |
| `quotes/`        | SellerQuotesHub, quote components                       | Quote management                                |
| `requests/`      | use-requests hook, shared logic                         | Request hooks & shared utilities                |
| `seller/`        | SellerOverview, SellerLayout, BillingOverview           | Seller dashboard, quotes hub, billing           |
| `support/`       | SupportHub, ticket components                           | Support ticket creation and management          |
| `taxonomy/`      | TaxonomyHub                                             | Categories/brands management (admin)            |
| `upload/`        | AvatarUpload component                                  | File upload (avatar, images)                    |
| `vendors/`       | Vendor management                                       | Seller/vendor operations                        |

---

## 8. Server Functions (`src/fn/`)

| File               | Exports                                                                                                                            |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `auth.ts`          | getUser, loginFn, registerFn, registerSellerFn, logoutFn                                                                           |
| `admin.ts`         | getTaxonomy, getDashboardStats, getAdvancedSystemMetrics, getMarketGapAnalysis, getBuyerAnalytics, getSellerAnalytics, getAllUsers |
| `landing.ts`       | getLandingStats                                                                                                                    |
| `requests.ts`      | fetchBuyerRequests, fetchAllRequests, createRequest, etc.                                                                          |
| `quotes.ts`        | fetchSellerStats, createQuote, updateQuote, etc.                                                                                   |
| `credits.ts`       | getRevenueMetrics, getCreditTransactions, getCreditRequests, approveCreditRequest, rejectCreditRequest, requestCredits             |
| `onboarding.ts`    | completeOnboarding                                                                                                                 |
| `notifications.ts` | markRead, markAllRead                                                                                                              |
| `support.ts`       | submitTicket                                                                                                                       |
| `vendors.ts`       | Vendor operations                                                                                                                  |
| `users.ts`         | User operations                                                                                                                    |

---

## 9. Use Cases (`src/use-cases/`)

| Domain           | Operations                                          |
| ---------------- | --------------------------------------------------- |
| `accounts/`      | Profile updates, account deactivation/deletion      |
| `admin/`         | Taxonomy retrieval, admin-specific logic            |
| `credits/`       | Credit packages, transactions, credit requests      |
| `notifications/` | Mark read, get unread, mark all read                |
| `quotes/`        | Create/update/accept/reject/revoke/unreject quotes  |
| `requests/`      | Create/update/cancel/reopen/delete/fulfill requests |
| `support/`       | Submit support tickets                              |

---

## 10. Data Access (`src/data-access/`)

| File               | Operations                              |
| ------------------ | --------------------------------------- |
| `admin.ts`         | Admin data queries                      |
| `analytics.ts`     | Analytics queries                       |
| `credits.ts`       | Credit data operations                  |
| `notifications.ts` | Notification data operations            |
| `quotes.ts`        | Quote data operations                   |
| `requests.ts`      | Request data operations                 |
| `taxonomy.ts`      | Taxonomy (categories/brands) operations |
| `users.ts`         | User metadata updates                   |
| `vendors.ts`       | Seller specialties operations           |

---

## 11. Data Flow Pattern

```
User Action (browser)
    │
    ▼
Route Component
    │ calls createServerFn (RPC)
    ▼
Server Function (src/fn/)
    │ validates input (Zod)
    │ calls use-case
    ▼
Use Case (src/use-cases/)
    │ business logic, auth checks
    │ calls data-access
    ▼
Data Access (src/data-access/)
    │ pure Drizzle query/mutation
    ▼
Database (PostgreSQL via Drizzle ORM)
```

---

## 12. Design System

### 12.1 Genre

`modern-minimal` — B2B marketplace platform. Stripe/Linear/ElevenLabs school. Declarative, confident, restrained. Geist sans, large tight displays, generous whitespace, pill CTAs.

### 12.2 Macrostructure Families

| Page Type                    | Family            | Characteristics                      |
| ---------------------------- | ----------------- | ------------------------------------ |
| Home (marketing)             | **Workbench**     | Sticky-scroll product tour, 3 frames |
| About, Contact, FAQ, Pricing | **Long Document** | Inline section heads, prose flow     |

### 12.3 Theme Tokens (OKLCH)

| Token                | Light                                  | Dark                   |
| -------------------- | -------------------------------------- | ---------------------- |
| `--color-paper`      | `oklch(100% 0 0)` — pure white         | `oklch(12% 0.01 280)`  |
| `--color-paper-2`    | `oklch(97% 0.005 260)` — near-white    | `oklch(15% 0.01 280)`  |
| `--color-ink`        | `oklch(12% 0.01 280)` — near-black     | `oklch(95% 0.005 280)` |
| `--color-ink-2`      | `oklch(40% 0.01 280)` — secondary text | `oklch(65% 0.005 280)` |
| `--color-rule`       | `oklch(89% 0.005 280)` — borders       | `oklch(100% 0 0 / 8%)` |
| `--color-accent`     | `oklch(50% 0.14 260)` — brand blue     | `oklch(64% 0.13 260)`  |
| `--color-accent-ink` | `oklch(100% 0 0)` — white on accent    | —                      |
| `--color-focus`      | `oklch(64% 0.13 260)` — focus ring     | —                      |

Brand accent: **hue 260°** (blue).

### 12.4 Typography

| Token           | Value                                                                                              |
| --------------- | -------------------------------------------------------------------------------------------------- |
| Display font    | **Geist**, weight 600, tracking −0.025em                                                           |
| Display scale   | `clamp(2.5rem, 4.5vw + 0.5rem, 4.25rem)` → `--text-display`                                        |
| Display-s scale | `clamp(1.75rem, 3vw + 0.25rem, 2.75rem)` → `--text-display-s`                                      |
| Body font       | **Noto Sans Arabic Variable** 400 (RTL-aware); Geist 400 Latin fallback                            |
| Mono font       | **Geist Mono** 400                                                                                 |
| Restriction     | Never `font-black` (900) on body copy or section headings. Reserve bold for labels/table numerals. |

### 12.5 Spacing Scale

| Token         | Value                                 |
| ------------- | ------------------------------------- |
| `--space-3xs` | 0.25rem                               |
| `--space-2xs` | 0.5rem                                |
| `--space-xs`  | 0.75rem                               |
| `--space-sm`  | 1rem                                  |
| `--space-md`  | 1.5rem                                |
| `--space-lg`  | 2.5rem                                |
| `--space-xl`  | 4rem                                  |
| `--space-2xl` | 6rem                                  |
| `--space-3xl` | 9rem — minimum between major sections |

### 12.6 Navigation — N5 Floating Pill

- **Public pages** (/, /about, /pricing, /faq, /contact, /explore): `fixed inset-x-0 top-0`, centered, max-width 768px, blur backdrop
- **App pages** (dashboard, auth, etc.): sticky header (existing behavior)
- **Mobile:** wordmark left + hamburger right → slide-out Sheet

### 12.7 Footer — Ft1 Mast-Headed

- Single horizontal band: wordmark + tagline + inline essential links
- Copyright beneath in muted small type
- Replaces previous 3-column index footer

### 12.8 CTA Voice

| Type          | Style                                                                                         |
| ------------- | --------------------------------------------------------------------------------------------- |
| **Primary**   | Filled pill · `bg-primary text-primary-foreground rounded-full px-6 py-2.5 font-semibold`     |
| **Secondary** | Outlined pill · `border border-border text-foreground rounded-full px-6 py-2.5 font-semibold` |

### 12.9 Motion

| Aspect               | Value                                                       |
| -------------------- | ----------------------------------------------------------- |
| Library              | Framer Motion                                               |
| Reveal               | fade + `translateY(8px → 0)` on `whileInView`, `once: true` |
| Duration             | 360ms                                                       |
| Easing               | `cubic-bezier(0.16, 1, 0.3, 1)` → `--ease-out`              |
| Reduced motion       | opacity-only crossfade, ≤ 150ms                             |
| Page-load animations | None — scroll-triggered only                                |
| Max concurrent       | 2 reveals per section                                       |
| Micro                | `transform` and `opacity` only. Never layout properties.    |

### 12.10 Microinteractions Stance

- **Silent success:** no celebratory toasts for non-critical actions
- **Hover:** color/opacity shifts only. No `whileHover={{ scale }}` on cards
- **Focus:** `:focus-visible` ring in `--color-focus`, instant (no animation)
- **No `animate-ping`** pulsing dots anywhere
- **Buttons:** `active:scale-[0.97]` press feedback, `transition-all duration-150`

### 12.11 Prohibited Elements

- Dot-grid backgrounds
- Glow blobs
- Pulsing badges
- `animate-ping`
- `transform rotate` tilt-on-hover cards
- `box-shadow: shadow-primary/20`
- Font weight 900 on body copy or section headings

### 12.12 Shared Across All Pages

- Brand blue accent (hue 260°, `--color-accent` / `--primary`)
- Geist display + Noto Sans Arabic body
- Pill CTA shape (`rounded-full`)
- N5 floating pill nav (public) / sticky nav (app)
- Ft1 mast-headed footer (public pages)
- Section spacing rhythm (`--space-3xl` minimum)

### 12.13 Per-Page Variation

| Page             | May Differ On                                                                       |
| ---------------- | ----------------------------------------------------------------------------------- |
| Home (Workbench) | UI mockup frames (honest representations, no fake data)                             |
| Content pages    | Section-head style: S2 Hanging (About), S4 Inline (FAQ), S3 Sticky-pinned (Pricing) |
| All pages        | No decorative icon+card grids                                                       |

---

## 13. Key Technical Decisions

| Decision                                                | Rationale                                                                            |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| **Casing:** snake_case in DB, camelCase in TS           | Drizzle ORM handles mapping via `casing: "snake_case"`                               |
| **Connection:** `postgres` driver with `prepare: false` | Supabase transaction pooler (port 6543) doesn't support prepared statements          |
| **Dual API:** Legacy REST + Server Functions            | Legacy `/api/v1/$` coexists; migration in progress to TanStack Server Functions      |
| **i18n/SSR:** Inline `<script>` for dir/lang            | Prevents hydration flash — reads from `localStorage` before React mounts             |
| **Dashboard lazy loading:** `React.lazy` + Suspense     | Role-based layouts loaded on demand; skeleton fallback during loading                |
| **User cache bypass:** `getUser` re-fetches from DB     | Ensures fresh `account_status` and custom fields (bypasses Better Auth cookie cache) |
| **No monorepo:** `pnpm-workspace.yaml` only sets flags  | Despite having the file, not a workspace — just allows specific build dependencies   |

---

## 14. Router Configuration

### 14.1 Router Context (`src/types/router.ts`)

```typescript
interface MyRouterContext {
  queryClient: QueryClient
  user: Awaited<ReturnType<typeof getUser>> // Fresh from DB
  session: Session | null // Better Auth session
}
```

### 14.2 Router Setup (`src/router.tsx`)

- QueryClient: 5-min stale time, 1 retry
- `defaultPreload: 'intent'`
- `scrollRestoration: true`
- SSR query hydration integration
- Context: `{ queryClient, user: null, session: null }`

---

## 15. i18n & RTL

| Locale         | Direction |
| -------------- | --------- |
| `en` (English) | LTR       |
| `fr` (French)  | LTR       |
| `ar` (Arabic)  | RTL       |

- Language synced via `?lang=` search param + `localStorage`
- Root route uses `DirectionProvider` to flip layout for Arabic
- Inline `<script>` in `__root.tsx` sets `dir` and `lang` before hydration (prevents flash)
- `Toaster` and all Radix primitives are direction-aware

---

## 16. Component Tree (Public Pages)

```
RootDocument
├── <html dir="…" lang="…">
│   ├── <head> (fonts, Material Symbols, styles)
│   ├── <body>
│   │   ├── I18nProvider
│   │   │   └── DirectionProvider
│   │   │       ├── Outlet
│   │   │       │   │
│   │   │       │   ├── _public layout:
│   │   │       │   │   ├── Navbar (N5 floating pill)
│   │   │       │   │   ├── <Outlet>
│   │   │       │   │   │   ├── Home: Hero → StatsStrip → HowItWorks → CTA
│   │   │       │   │   │   ├── About: AboutContent
│   │   │       │   │   │   ├── Contact: ContactContent
│   │   │       │   │   │   ├── Explore: PublicMarketplace
│   │   │       │   │   │   ├── FAQ: FaqContent
│   │   │       │   │   │   └── Pricing: PricingContent
│   │   │       │   │   └── Footer (Ft1 Mast-headed)
│   │   │       │   │
│   │   │       │   ├── _auth layout:
│   │   │       │   │   └── Login: AuthForm + ThemeToggle
│   │   │       │   │
│   │   │       │   ├── _authed layout:
│   │   │       │   │   ├── CompleteRegistration: AvatarUpload
│   │   │       │   │   ├── Onboarding: wizard (5 steps)
│   │   │       │   │   ├── Waitlist: status + check button
│   │   │       │   │   ├── Marketplace/$requestId: RequestDetailPage
│   │   │       │   │   └── Dashboard (role-based)
│   │   │       │   │       ├── Overview / Requests / Quotes / Profile / Billing / Support
│   │   │       │   │       └── Admin: Categories / Buyers / Sellers / Users / Intelligence / Revenue / Credit-requests / Audit
│   │   │       │   │
│   │   │       │   └── 404: DefaultNotFound
│   │   │       │
│   │   │       └── Toaster
│   │   │
│   │   ├── TanStack Query Devtools (DEV only)
│   │   └── TanStack Router Devtools (DEV only)
```

---

## 17. Route File Inventory (37 files)

| #   | File Path                                                      | URL Path                           |
| --- | -------------------------------------------------------------- | ---------------------------------- |
| 1   | `src/routes/__root.tsx`                                        | (root layout)                      |
| 2   | `src/routes/_auth/login.tsx`                                   | `/login`                           |
| 3   | `src/routes/_public.tsx`                                       | (public layout)                    |
| 4   | `src/routes/_public/index.tsx`                                 | `/`                                |
| 5   | `src/routes/_public/about/index.tsx`                           | `/about`                           |
| 6   | `src/routes/_public/contact/index.tsx`                         | `/contact`                         |
| 7   | `src/routes/_public/explore/index.tsx`                         | `/explore`                         |
| 8   | `src/routes/_public/faq/index.tsx`                             | `/faq`                             |
| 9   | `src/routes/_public/pricing/index.tsx`                         | `/pricing`                         |
| 10  | `src/routes/_authed.tsx`                                       | (auth guard layout)                |
| 11  | `src/routes/_authed/onboarding.tsx`                            | `/onboarding`                      |
| 12  | `src/routes/_authed/complete-registration.tsx`                 | `/complete-registration`           |
| 13  | `src/routes/_authed/waitlist.tsx`                              | `/waitlist`                        |
| 14  | `src/routes/_authed/marketplace/$requestId.tsx`                | `/marketplace/$requestId`          |
| 15  | `src/routes/_authed/dashboard/route.tsx`                       | `/dashboard` (layout)              |
| 16  | `src/routes/_authed/dashboard/index.tsx`                       | `/dashboard/`                      |
| 17  | `src/routes/_authed/dashboard/requests/index.tsx`              | `/dashboard/requests`              |
| 18  | `src/routes/_authed/dashboard/requests/$requestId.tsx`         | `/dashboard/requests/$requestId`   |
| 19  | `src/routes/_authed/dashboard/quotes/index.tsx`                | `/dashboard/quotes`                |
| 20  | `src/routes/_authed/dashboard/profile/index.tsx`               | `/dashboard/profile`               |
| 21  | `src/routes/_authed/dashboard/billing/index.tsx`               | `/dashboard/billing`               |
| 22  | `src/routes/_authed/dashboard/support/index.tsx`               | `/dashboard/support`               |
| 23  | `src/routes/_authed/dashboard/users/index.tsx`                 | `/dashboard/users`                 |
| 24  | `src/routes/_authed/dashboard/audit/index.tsx`                 | `/dashboard/audit`                 |
| 25  | `src/routes/_authed/dashboard/admin/route.tsx`                 | `/dashboard/admin`                 |
| 26  | `src/routes/_authed/dashboard/admin/categories.tsx`            | `/dashboard/admin/categories`      |
| 27  | `src/routes/_authed/dashboard/admin/buyers.tsx`                | `/dashboard/admin/buyers`          |
| 28  | `src/routes/_authed/dashboard/admin/sellers.tsx`               | `/dashboard/admin/sellers`         |
| 29  | `src/routes/_authed/dashboard/admin/users/index.tsx`           | `/dashboard/admin/users`           |
| 30  | `src/routes/_authed/dashboard/admin/intelligence.tsx`          | `/dashboard/admin/intelligence`    |
| 31  | `src/routes/_authed/dashboard/admin/revenue/index.tsx`         | `/dashboard/admin/revenue`         |
| 32  | `src/routes/_authed/dashboard/admin/credit-requests/index.tsx` | `/dashboard/admin/credit-requests` |
| 33  | `src/routes/_authed/dashboard/admin/audit/index.tsx`           | `/dashboard/admin/audit`           |
| 34  | `src/routes/api/auth/$.ts`                                     | `/api/auth/$`                      |
| 35  | `src/routes/api/v1/$.ts`                                       | `/api/v1/$`                        |
| 36  | `src/routes/components/errors/route-error-fallback.tsx`        | (error boundary)                   |
| 37  | `src/routes/components/errors/-default-not-found.tsx`          | (404 page)                         |
