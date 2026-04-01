# Authentication System Prompt & Architecture Guide

This document outlines the authentication architecture used in this repository, designed to be used as a reference or prompt for implementing a similar system in other TanStack Start / Better Auth projects.

## 🚀 Tech Stack

- **Framework**: TanStack Start (Vinxi)
- **Authentication**: [Better Auth](https://www.better-auth.com/) (v1.2+)
- **Database/ORM**: Drizzle ORM with Postgres
- **State Management**: TanStack Query
- **Routing**: TanStack Router (File-based)
- **Styling/UI**: Tailwind CSS, Radix UI, Lucide Icons

---

## 📂 Project Organization

```text
src/
├── lib/
│   ├── auth.ts              # Server-side Better Auth configuration
│   └── auth-client.ts       # Client-side Better Auth setup
├── features/auth/
│   ├── constants/           # Auth routes, roles, and UI config
│   ├── guards/              # Server-side middleware (guards)
│   ├── queries/             # TanStack Query options for session
│   └── validation/          # Zod schemas for login/register
├── fn/
│   └── auth.ts              # TanStack Start server functions (Actions)
├── routes/
│   ├── api/auth/$.ts        # Better Auth API handler route
│   ├── _authed.tsx          # Protected layout route
│   └── __root.tsx           # Global context population
└── types/
    └── router.ts            # Shared Router context types
```

---

## 🛠️ Core Implementation Details

### 1. Server Configuration ([src/lib/auth.ts](file:///c:/Users/FARTAS/Desktop/axis-platform/axis-platform/src/lib/auth.ts))

Uses `betterAuth` with `drizzleAdapter`. Key features:

- **Custom Session**: Injects additional data (like `cafeId`) into the session using the `customSession` plugin.
- **Hooks**: Validates custom fields (`user_type`, `phone`) during sign-up using the [before](file:///c:/Users/FARTAS/Desktop/axis-platform/axis-platform/src/routes/__root.tsx#17-21) hook.
- **Plugins**: Includes the `admin()` plugin for role-based management.

### 2. API Integration ([src/routes/api/auth/$.ts](file:///c:/Users/FARTAS/Desktop/axis-platform/axis-platform/src/routes/api/auth/$.ts))

All auth requests are routed through a splash route using TanStack Start's `createAPIFileRoute`.

```typescript
export const APIRoute = createAPIFileRoute('/api/auth/$')({
  GET: ({ request }) => auth.handler(request),
  POST: ({ request }) => auth.handler(request),
})
```

### 3. Middleware Defense ([src/features/auth/guards/auth.ts](file:///c:/Users/FARTAS/Desktop/axis-platform/axis-platform/src/features/auth/guards/auth.ts))

Defines `authMiddleware` that runs on the server for TanStack Start functions.

- Fetches session via `auth.api.getSession`.
- Throws 401 if unauthorized.
- Injects user and custom session data into the function context.

### 4. Router Context & Pre-fetching ([src/routes/\_\_root.tsx](file:///c:/Users/FARTAS/Desktop/axis-platform/axis-platform/src/routes/__root.tsx))

The root route uses [beforeLoad](file:///c:/Users/FARTAS/Desktop/axis-platform/axis-platform/src/routes/__root.tsx#17-21) to pre-fetch the user session using TanStack Query's `ensureQueryData`.

- This ensures the [user](file:///c:/Users/FARTAS/Desktop/axis-platform/axis-platform/src/features/auth/queries/auth-queries.ts#6-13) is available in the `context` for all child routes and components.
- Avoids waterfall requests and flickering.

### 5. Protected Layouts ([src/routes/\_authed.tsx](file:///c:/Users/FARTAS/Desktop/axis-platform/axis-platform/src/routes/_authed.tsx))

A pathless layout route (`_authed`) protects all its children.

- It checks `context.user` in [beforeLoad](file:///c:/Users/FARTAS/Desktop/axis-platform/axis-platform/src/routes/__root.tsx#17-21).
- Redirects to `/login` with a `redirect` search param if missing.
- Handles multi-step registration (e.g., redirecting to `/complete-registration` for "pending" users).

---

## 🔄 Authentication Flows

### Client-to-Server Action

1. User submits a form (e.g., `login`).
2. A TanStack Start **Server Function** ([src/fn/auth.ts](file:///c:/Users/FARTAS/Desktop/axis-platform/axis-platform/src/fn/auth.ts)) is called.
3. The server function calls `auth.api.signInEmail`.
4. Browser cookies are set automatically by Better Auth through the API handler.

### Route Protection Flow

1. User navigates to a `/dashboard` (child of `_authed`).
2. [\_\_root.tsx](file:///c:/Users/FARTAS/Desktop/axis-platform/axis-platform/src/routes/__root.tsx)'s [beforeLoad](file:///c:/Users/FARTAS/Desktop/axis-platform/axis-platform/src/routes/__root.tsx#17-21) fetches the session.
3. [\_authed.tsx](file:///c:/Users/FARTAS/Desktop/axis-platform/axis-platform/src/routes/_authed.tsx)'s [beforeLoad](file:///c:/Users/FARTAS/Desktop/axis-platform/axis-platform/src/routes/__root.tsx#17-21) checks the session in context.
4. If valid, the page renders; otherwise, it redirects.

### Data Access Flow

1. A server function for fetching data (e.g., `getCafeDetails`) is called.
2. It uses `.middleware([authMiddleware])`.
3. The handler receives `context.user` and `context.cafeId` directly, ensuring secure, multi-tenant data access.

---

## 💡 Key Design Patterns

- **Context Injection**: Use `better-auth` plugins to inject domain-specific IDs (like `cafeId`) early so they are available everywhere.
- **Type Safety**: Use `satisfied BetterAuthOptions` and shared `RouterContext` types to ensure end-to-end type safety.
- **Server-First Auth**: Leverage `auth.api.getSession` on the server within TanStack Start's lifecycle for maximum security.
- **Consolidated API**: Use the [$.ts](file:///c:/Users/FARTAS/Desktop/axis-platform/axis-platform/src/routes/api/auth/$.ts) catch-all route for auth to keep the routing clean.
