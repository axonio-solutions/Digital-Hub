# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is `pnpm`. Scripts:

- `pnpm dev` — Vite dev server on port 5173
- `pnpm build` — production build (output: `dist/client`, deployed to Netlify)
- `pnpm start` — preview the production build
- `pnpm test` — Vitest (no tests exist yet despite the toolchain being wired up)
- `pnpm lint` / `pnpm format` / `pnpm check` (runs prettier + eslint --fix)
- `pnpm db:generate` / `db:migrate` / `db:studio` / `db:check` — Drizzle Kit against `src/db/schema/index.ts`, outputting to `drizzle/`
- Add Shadcn components with `pnpx shadcn@latest add <component>` — don't hand-roll primitives Shadcn provides

`pnpm-workspace.yaml` is **not** a workspace declaration — it only sets `allowBuilds` flags. There is no monorepo.

## Architecture — "Axis" tiered layers

The codebase enforces strict layering. Each layer only calls the one below it:

| Layer                | Folder             | Responsibility                                                                                                             |
| -------------------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| **Routes**           | `src/routes/`      | TanStack Router file-based routes. URL params, loaders, render feature components. Calls Use Cases (or server fns) only.   |
| **Server Functions** | `src/fn/`          | RPC entry points wrapped with `createServerFn` from `@tanstack/react-start`. Validate input with Zod, then call Use Cases. |
| **Use Cases**        | `src/use-cases/`   | Business logic, authorization, validation. Framework-agnostic. Orchestrates Data Access.                                   |
| **Data Access**      | `src/data-access/` | Pure Drizzle queries/mutations. No business rules, no auth checks.                                                         |
| **DB**               | `src/db/`          | Drizzle client (`src/db/index.ts`) + schemas (`src/db/schema/*.ts`).                                                       |

**Never call `src/db` directly from routes, features, or server functions.** Routes/features go through Use Cases (often via `src/fn`). Use Cases go through Data Access.

`src/services/` holds cross-cutting concerns that don't fit a single use case (e.g. `notification-service.ts` orchestrating Email + SSE, `background-jobs.ts`).

### Features vs components

- `src/features/<domain>/` — domain-specific UI: `components/`, `hooks/`, `validations/` (Zod), `queries/` (TanStack Query options factories). Domains include `admin`, `auth`, `buyer`, `seller`, `marketplace`, `quotes`, `requests`, `notifications`, `vendors`, `taxonomy`, `credits`, `support`, `accounts`, `dashboard`, `upload`.
- `src/components/` — generic shared UI (Shadcn primitives in `components/ui/`, app-wide things like `theme-provider`, `i18n-provider`).

## Routing & auth

File-based via TanStack Router. The generated tree is in `src/routeTree.gen.ts` (don't edit).

Route groups:

- `_public/` — landing, about, contact, explore, faq, pricing
- `_auth/` — login (unauthenticated entry)
- `_authed/` — **protected**. `_authed.tsx` runs `beforeLoad`:
  1. Redirects to `/login` if no user
  2. Forces `complete-registration` when `user.account_status` is `new`
  3. Forces `waitlist` when `account_status === 'waitlisted'`
- `api/auth/$.ts` — catch-all Better Auth handler

The root route (`__root.tsx`) loads the user via `authQueries.user()` in `beforeLoad` and exposes it on the router context as `MyRouterContext` (`src/types/router.ts`). Access with `Route.useRouteContext()` — typed `user` is available in every protected route.

`src/lib/auth.ts` configures Better Auth server-side (Drizzle adapter, admin + phone plugins). `src/lib/auth-client.ts` is the client API. Note: `getUser` in `src/fn/auth.ts` bypasses Better Auth's cookie cache by re-fetching from `users` table, so DB fields show up fresh.

## Database

PostgreSQL via Drizzle ORM. Connection in `src/db/index.ts` uses `postgres` driver with `prepare: false` (Supabase transaction pooler on :6543 doesn't support prepared statements). Drizzle is configured with **`casing: "snake_case"`** in both `drizzle.config.ts` and `src/db/index.ts` — write TS field names in camelCase and the ORM maps to snake_case columns. Schemas live in `src/db/schema/{auth,marketplace,vehicles,notifications,taxonomy,vendors,credits,relations}.ts` and are re-exported from `index.ts`.

`.env` must contain `DATABASE_URL`, `BETTER_AUTH_SECRET`, `RESEND_API_KEY`.

## Imports

Always use the `@/*` alias (mapped to `src/`) — configured in `tsconfig.json` and `vite.config.ts`. No relative paths across modules.

## i18n & RTL

`react-i18next` with locales `en`, `fr`, `ar`. The root route reads `?lang=` from search params and syncs with i18n. Arabic switches the document to `dir="rtl"` and routes through `DirectionProvider` and `Toaster` so positioning flips. An inline `<script>` in `__root.tsx` sets dir/lang from `localStorage` before hydration to avoid flash.

## Excluded from the app

`axis/` is a standalone reference/boilerplate project — it's excluded from `tsconfig.json` and is not part of the build. Don't import from it.

## Style conventions

- Files & folders: kebab-case (`new-request-form.tsx`)
- Components: PascalCase; server functions: camelCase ending in `Fn` (e.g. `loginFn`)
- Validations: Zod schemas live in `src/features/<domain>/validations/` or `src/types/`
- When building a new feature, work bottom-up: **DB schema → data-access → use-case → feature component → route**
